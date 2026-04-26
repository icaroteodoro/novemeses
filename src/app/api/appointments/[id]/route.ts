import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { AppointmentService } from "@/modules/appointments/appointment.service";
import { z } from "zod";

const updateAppointmentSchema = z.object({
  date: z.string().pipe(z.coerce.date()).optional(),
  doctor: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const appointmentService = new AppointmentService();
    const appointment = await appointmentService.getAppointmentById(id);

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Error getting appointment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateAppointmentSchema.parse(body);

    const appointmentService = new AppointmentService();
    const appointment = await appointmentService.updateAppointment(id, data);

    return NextResponse.json({ appointment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const appointmentService = new AppointmentService();
    await appointmentService.deleteAppointment(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
