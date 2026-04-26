import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { ReminderService } from "@/modules/reminders/reminder.service";
import { PregnancyService } from "@/modules/pregnancy/pregnancy.service";
import { z } from "zod";

const reminderSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["CONSULTA", "REMEDIO", "EXAME"]),
  date: z.string().pipe(z.coerce.date()),
  appointmentId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = reminderSchema.parse(body);

    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);

    if (!pregnancy) {
      return NextResponse.json({ error: "No active pregnancy found" }, { status: 404 });
    }

    const reminderService = new ReminderService();
    const reminder = await reminderService.createReminder({
      pregnancyId: pregnancy.id,
      ...data,
    });

    return NextResponse.json({ reminder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating reminder:", error);
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
      return NextResponse.json({ reminders: [] });
    }

    const reminderService = new ReminderService();
    const reminders = await reminderService.getReminders(pregnancy.id);

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("Error getting reminders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
