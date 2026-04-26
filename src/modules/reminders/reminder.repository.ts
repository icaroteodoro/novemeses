import { prisma } from "@/infra/db/prisma";

export class ReminderRepository {
  async create(data: {
    pregnancyId: string;
    appointmentId?: string;
    title: string;
    type: string;
    date: Date;
  }) {
    return prisma.reminder.create({
      data,
    });
  }

  async findByPregnancyId(pregnancyId: string) {
    return prisma.reminder.findMany({
      where: { pregnancyId },
      orderBy: { date: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.reminder.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: {
    title?: string;
    type?: string;
    date?: Date;
    completed?: boolean;
  }) {
    return prisma.reminder.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.reminder.delete({
      where: { id },
    });
  }
}
