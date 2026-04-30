import { prisma } from "@/infra/db/prisma";

export class InvitationRepository {
  async create(data: {
    pregnancyId: string;
    email: string;
    invitedById: string;
  }) {
    return prisma.pregnancyInvitation.create({
      data: {
        ...data,
        status: "PENDENTE",
      },
      include: {
        invitedBy: true,
        pregnancy: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.pregnancyInvitation.findUnique({
      where: { id },
      include: {
        pregnancy: true,
      },
    });
  }

  async findPendingByEmail(email: string) {
    return prisma.pregnancyInvitation.findMany({
      where: {
        email,
        status: "PENDENTE",
      },
      include: {
        invitedBy: true,
        pregnancy: true,
      },
    });
  }

  async updateStatus(id: string, status: "ACEITO" | "RECUSADO") {
    return prisma.pregnancyInvitation.update({
      where: { id },
      data: { status },
    });
  }
}
