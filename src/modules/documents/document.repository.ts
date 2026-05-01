import { prisma } from "@/infra/db/prisma";

export class DocumentRepository {
  async create(data: { 
    pregnancyId: string; 
    name: string; 
    category: string; 
    files: { url: string; type: string }[] 
  }) {
    return prisma.document.create({
      data: {
        pregnancyId: data.pregnancyId,
        name: data.name,
        category: data.category,
        files: {
          create: data.files
        }
      },
      include: { files: true }
    });
  }

  async findByPregnancyId(pregnancyId: string) {
    return prisma.document.findMany({
      where: { pregnancyId },
      include: { files: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.document.findUnique({ 
      where: { id },
      include: { files: true }
    });
  }

  async updateName(id: string, name: string) {
    return prisma.document.update({ 
      where: { id }, 
      data: { name },
      include: { files: true }
    });
  }

  async delete(id: string) {
    return prisma.document.delete({ where: { id } });
  }
}
