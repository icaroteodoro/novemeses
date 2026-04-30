import { prisma } from "@/infra/db/prisma";

export class PregnancyRepository {
  async create(data: {
    userId: string;
    startDate: Date;
    dueDate?: Date;
    babyName?: string;
    babyNameBoy?: string;
    babyNameGirl?: string;
    babyGender?: string;
    parentRole?: string;
    onboardingDone?: boolean;
    partnerId?: string;
    partnerRole?: string;
  }) {
    const existing = await this.findByUserId(data.userId);

    if (existing) {
      return prisma.pregnancy.update({
        where: { id: existing.id },
        data: {
          startDate: data.startDate,
          dueDate: data.dueDate,
          babyName: data.babyName,
          babyNameBoy: data.babyNameBoy,
          babyNameGirl: data.babyNameGirl,
          babyGender: data.babyGender,
          parentRole: data.parentRole,
          onboardingDone: data.onboardingDone,
          partnerId: data.partnerId,
          partnerRole: data.partnerRole,
        },
      });
    }

    return prisma.pregnancy.create({
      data,
    });
  }

  async findByUserId(userId: string) {
    return prisma.pregnancy.findFirst({
      where: {
        OR: [
          { userId },
          { partnerId: userId }
        ]
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: {
    startDate?: Date;
    dueDate?: Date;
    babyName?: string;
    babyNameBoy?: string;
    babyNameGirl?: string;
    babyGender?: string;
    parentRole?: string;
    onboardingDone?: boolean;
    partnerId?: string;
    partnerRole?: string;
  }) {
    return prisma.pregnancy.update({
      where: { id },
      data,
    });
  }
}
