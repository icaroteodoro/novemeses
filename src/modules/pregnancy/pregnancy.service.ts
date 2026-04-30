import { PregnancyRepository } from "./pregnancy.repository";
import { differenceInDays, addDays } from "date-fns";

export class PregnancyService {
  private pregnancyRepository: PregnancyRepository;

  constructor() {
    this.pregnancyRepository = new PregnancyRepository();
  }

  async createPregnancy(userId: string, startDate: Date, extra?: {
    dueDate?: Date;
    babyName?: string;
    babyNameBoy?: string;
    babyNameGirl?: string;
    babyGender?: string;
    parentRole?: string;
    onboardingDone?: boolean;
    partnerRole?: string;
  }) {
    const dueDate = extra?.dueDate ?? addDays(startDate, 280); // 40 weeks
    return this.pregnancyRepository.create({
      userId,
      startDate,
      dueDate,
      babyName: extra?.babyName,
      babyNameBoy: extra?.babyNameBoy,
      babyNameGirl: extra?.babyNameGirl,
      babyGender: extra?.babyGender ?? "SURPRESA",
      parentRole: extra?.parentRole ?? "MAE",
      partnerRole: extra?.partnerRole,
      onboardingDone: extra?.onboardingDone,
    });
  }

  async updatePregnancy(id: string, data: {
    startDate?: Date;
    dueDate?: Date;
    babyName?: string;
    babyNameBoy?: string;
    babyNameGirl?: string;
    babyGender?: string;
    parentRole?: string;
    onboardingDone?: boolean;
  }) {
    return this.pregnancyRepository.update(id, data);
  }

  calculateProgress(startDate: Date): { weeks: number; days: number } {
    const daysDiff = differenceInDays(new Date(), startDate);
    const weeks = Math.floor(daysDiff / 7);
    const days = daysDiff % 7;
    return {
      weeks: weeks < 0 ? 0 : weeks,
      days: days < 0 ? 0 : days
    };
  }

  async getActivePregnancy(userId: string) {
    const pregnancy = await this.pregnancyRepository.findByUserId(userId);
    if (!pregnancy) return null;

    const progress = this.calculateProgress(pregnancy.startDate);

    const userRole = pregnancy.userId === userId ? pregnancy.parentRole : pregnancy.partnerRole;

    return {
      ...pregnancy,
      currentWeek: progress.weeks,
      currentDays: progress.days,
      userRole
    };
  }
}
