import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { AppointmentService } from "@/modules/appointments/appointment.service";
import { PregnancyService } from "@/modules/pregnancy/pregnancy.service";
import { z } from "zod";

const appointmentSchema = z.object({
  date: z.string().pipe(z.coerce.date()),
  doctor: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = appointmentSchema.parse(body);

    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);

    if (!pregnancy) {
      return NextResponse.json({ error: "No active pregnancy found" }, { status: 404 });
    }

    const appointmentService = new AppointmentService();
    const appointment = await appointmentService.createAppointment({
      pregnancyId: pregnancy.id,
      ...data,
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);

    if (!pregnancy) {
      return NextResponse.json({ appointments: [] });
    }

    const appointmentService = new AppointmentService();
    const appointments = await appointmentService.getAppointments(pregnancy.id);

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error getting appointments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
