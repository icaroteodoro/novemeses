import { prisma } from "@/infra/db/prisma";

export class DocumentRepository {
  async create(data: { pregnancyId: string; name: string; url: string; category: string; type: string }) {
    return prisma.document.create({
      data,
    });
  }

  async findByPregnancyId(pregnancyId: string) {
    return prisma.document.findMany({
      where: { pregnancyId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.document.findUnique({ where: { id } });
  }

  async updateName(id: string, name: string) {
    return prisma.document.update({ where: { id }, data: { name } });
  }

  async delete(id: string) {
    return prisma.document.delete({ where: { id } });
  }
}
