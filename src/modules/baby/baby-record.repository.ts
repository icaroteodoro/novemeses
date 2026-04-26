import { prisma } from "@/infra/db/prisma";

export class BabyRecordRepository {
  async create(data: { pregnancyId: string; week: number; weight?: number; size?: number; notes?: string }) {
    return prisma.babyRecord.create({
      data,
    });
  }

  async findByPregnancyId(pregnancyId: string) {
    return prisma.babyRecord.findMany({
      where: { pregnancyId },
      orderBy: { week: "asc" },
    });
  }

  async delete(id: string) {
    return prisma.babyRecord.delete({
      where: { id },
    });
  }
}
