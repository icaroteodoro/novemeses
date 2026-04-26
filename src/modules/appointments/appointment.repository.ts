import { prisma } from "@/infra/db/prisma";

export class AppointmentRepository {
  async create(data: { pregnancyId: string; date: Date; doctor?: string; location?: string; notes?: string }) {
    return prisma.appointment.create({
      data,
    });
  }

  async findByPregnancyId(pregnancyId: string) {
    return prisma.appointment.findMany({
      where: { pregnancyId },
      orderBy: { date: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: { date?: Date; doctor?: string; location?: string; notes?: string }) {
    return prisma.appointment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.appointment.delete({
      where: { id },
    });
  }
}
