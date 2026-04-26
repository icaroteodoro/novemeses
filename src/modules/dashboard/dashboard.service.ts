import { PregnancyService } from "@/modules/pregnancy/pregnancy.service";
import { AppointmentService } from "@/modules/appointments/appointment.service";
import { ReminderService } from "@/modules/reminders/reminder.service";
import { QuestionService } from "@/modules/questions/question.service";
import { BabyRecordService } from "@/modules/baby/baby-record.service";

export class DashboardService {
  private pregnancyService: PregnancyService;
  private appointmentService: AppointmentService;
  private reminderService: ReminderService;
  private questionService: QuestionService;
  private babyRecordService: BabyRecordService;

  constructor() {
    this.pregnancyService = new PregnancyService();
    this.appointmentService = new AppointmentService();
    this.reminderService = new ReminderService();
    this.questionService = new QuestionService();
    this.babyRecordService = new BabyRecordService();
  }

  async getSummary(userId: string) {
    const pregnancy = await this.pregnancyService.getActivePregnancy(userId);

    if (!pregnancy) {
      return { hasActivePregnancy: false };
    }

    const [appointments, reminders, questions, babyRecords] = await Promise.all([
      this.appointmentService.getAppointments(pregnancy.id),
      this.reminderService.getReminders(pregnancy.id),
      this.questionService.getQuestions(pregnancy.id),
      this.babyRecordService.getHistory(pregnancy.id),
    ]);

    // Simple aggregation logic
    const nextAppointment = appointments.find(a => new Date(a.date) > new Date());
    const pendingReminders = reminders.filter(r => !r.completed);
    const pendingQuestions = questions.filter(q => q.status === "PENDENTE");
    const lastBabyRecord = babyRecords[babyRecords.length - 1];

    return {
      hasActivePregnancy: true,
      pregnancy,
      summary: {
        nextAppointment,
        pendingRemindersCount: pendingReminders.length,
        pendingQuestionsCount: pendingQuestions.length,
        lastBabyRecord,
      },
    };
  }
}
