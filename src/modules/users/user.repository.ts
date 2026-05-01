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
          take: 1,
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            partner: { select: { id: true, name: true, email: true, avatarUrl: true } }
          }
        },
        partnerPregnancies: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            partner: { select: { id: true, name: true, email: true, avatarUrl: true } }
          }
        }
      }
    });
  }

  async update(id: string, data: { name?: string; avatarUrl?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        pregnancies: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            partner: { select: { id: true, name: true, email: true, avatarUrl: true } }
          }
        },
        partnerPregnancies: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            partner: { select: { id: true, name: true, email: true, avatarUrl: true } }
          }
        }
      }
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}
