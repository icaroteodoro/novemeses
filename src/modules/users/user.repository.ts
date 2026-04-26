import { prisma } from "@/infra/db/prisma";

export class UserRepository {
  async findByFirebaseUid(firebaseUid: string) {
    return prisma.user.findUnique({
      where: { firebaseUid },
    });
  }

  async create(data: { firebaseUid: string; email: string; name?: string; avatarUrl?: string }) {
    return prisma.user.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        pregnancies: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });
  }

  async update(id: string, data: { name?: string; avatarUrl?: string }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
