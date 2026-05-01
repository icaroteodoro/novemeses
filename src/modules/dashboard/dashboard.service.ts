import { PregnancyService } from "@/modules/pregnancy/pregnancy.service";
import { AppointmentService } from "@/modules/appointments/appointment.service";
import { ReminderService } from "@/modules/reminders/reminder.service";
import { QuestionService } from "@/modules/questions/question.service";
import { BabyRecordService } from "@/modules/baby/baby-record.service";
import { UserRepository } from "@/modules/users/user.repository";

export class DashboardService {
  private pregnancyService: PregnancyService;
  private appointmentService: AppointmentService;
  private reminderService: ReminderService;
  private questionService: QuestionService;
  private babyRecordService: BabyRecordService;
  private userRepository: UserRepository;

  constructor() {
    this.pregnancyService = new PregnancyService();
    this.appointmentService = new AppointmentService();
    this.reminderService = new ReminderService();
    this.questionService = new QuestionService();
    this.babyRecordService = new BabyRecordService();
    this.userRepository = new UserRepository();
  }

  async getSummary(userId: string) {
    const [pregnancy, user] = await Promise.all([
      this.pregnancyService.getActivePregnancy(userId),
      this.userRepository.findById(userId),
    ]);

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
      pregnancy: {
        id: pregnancy.id,
        startDate: pregnancy.startDate,
        dueDate: pregnancy.dueDate,
        currentWeek: pregnancy.currentWeek,
        currentDays: (pregnancy as any).currentDays,
        babyName: pregnancy.babyName,
        babyGender: pregnancy.babyGender,
        userRole: (pregnancy as any).userRole,
      },
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        avatarUrl: user?.avatarUrl,
      },
      summary: {
        nextAppointment,
        pendingRemindersCount: pendingReminders.length,
        pendingQuestionsCount: pendingQuestions.length,
        lastBabyRecord,
      },
    };
  }
}
