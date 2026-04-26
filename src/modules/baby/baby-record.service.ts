import { BabyRecordRepository } from "./baby-record.repository";

export class BabyRecordService {
  private babyRecordRepository: BabyRecordRepository;

  constructor() {
    this.babyRecordRepository = new BabyRecordRepository();
  }

  async addRecord(data: {
    pregnancyId: string;
    week: number;
    weight?: number;
    size?: number;
    notes?: string;
  }) {
    return this.babyRecordRepository.create(data);
  }

  async getHistory(pregnancyId: string) {
    return this.babyRecordRepository.findByPregnancyId(pregnancyId);
  }

  async deleteRecord(id: string) {
    return this.babyRecordRepository.delete(id);
  }
}
