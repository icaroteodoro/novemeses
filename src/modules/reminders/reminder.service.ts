import { ReminderRepository } from "./reminder.repository";

export class ReminderService {
  private reminderRepository: ReminderRepository;

  constructor() {
    this.reminderRepository = new ReminderRepository();
  }

  async createReminder(data: {
    pregnancyId: string;
    appointmentId?: string;
    title: string;
    type: string;
    date: Date;
  }) {
    return this.reminderRepository.create(data);
  }

  async getReminders(pregnancyId: string) {
    return this.reminderRepository.findByPregnancyId(pregnancyId);
  }

  async updateReminder(id: string, data: {
    title?: string;
    type?: string;
    date?: Date;
    completed?: boolean;
  }) {
    return this.reminderRepository.update(id, data);
  }

  async deleteReminder(id: string) {
    return this.reminderRepository.delete(id);
  }

  async getReminderById(id: string) {
    return this.reminderRepository.findById(id);
  }
}
