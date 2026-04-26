import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { ReminderService } from "@/modules/reminders/reminder.service";
import { z } from "zod";

const updateReminderSchema = z.object({
  title: z.string().optional(),
  type: z.enum(["CONSULTA", "REMEDIO", "EXAME"]).optional(),
  date: z.string().pipe(z.coerce.date()).optional(),
  completed: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const reminderService = new ReminderService();
    const reminder = await reminderService.getReminderById(id);

    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error("Error getting reminder:", error);
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
    const data = updateReminderSchema.parse(body);

    const reminderService = new ReminderService();
    const reminder = await reminderService.updateReminder(id, data);

    return NextResponse.json({ reminder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error updating reminder:", error);
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
    const reminderService = new ReminderService();
    await reminderService.deleteReminder(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
