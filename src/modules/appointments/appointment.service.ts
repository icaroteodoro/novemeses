import { AppointmentRepository } from "./appointment.repository";

export class AppointmentService {
  private appointmentRepository: AppointmentRepository;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
  }

  async createAppointment(data: {
    pregnancyId: string;
    date: Date;
    doctor?: string;
    location?: string;
    notes?: string;
  }) {
    return this.appointmentRepository.create(data);
  }

  async getAppointments(pregnancyId: string) {
    return this.appointmentRepository.findByPregnancyId(pregnancyId);
  }

  async updateAppointment(id: string, data: {
    date?: Date;
    doctor?: string;
    location?: string;
    notes?: string;
  }) {
    return this.appointmentRepository.update(id, data);
  }

  async deleteAppointment(id: string) {
    return this.appointmentRepository.delete(id);
  }

  async getAppointmentById(id: string) {
    return this.appointmentRepository.findById(id);
  }
}
