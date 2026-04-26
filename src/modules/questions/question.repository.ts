import { prisma } from "@/infra/db/prisma";

export class QuestionRepository {
  async create(data: { pregnancyId: string; content: string }) {
    return prisma.question.create({
      data,
    });
  }

  async findByPregnancyId(pregnancyId: string) {
    return prisma.question.findMany({
      where: { pregnancyId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.question.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: { content?: string; status?: string; answer?: string }) {
    return prisma.question.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.question.delete({
      where: { id },
    });
  }
}
