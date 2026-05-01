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

  async findPendingByPregnancyAndEmail(pregnancyId: string, email: string) {
    return prisma.pregnancyInvitation.findFirst({
      where: {
        pregnancyId,
        email,
        status: "PENDENTE",
      },
    });
  }

  async updateStatus(id: string, status: "ACEITO" | "RECUSADO") {
    const { count } = await prisma.pregnancyInvitation.updateMany({
      where: { 
        id,
        status: "PENDENTE"
      },
      data: { status },
    });

    if (count === 0) {
      throw new Error("Convite já processado ou inexistente");
    }

    return { success: true };
  }
}
