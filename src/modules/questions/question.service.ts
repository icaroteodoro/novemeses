import { QuestionRepository } from "./question.repository";

export class QuestionService {
  private questionRepository: QuestionRepository;

  constructor() {
    this.questionRepository = new QuestionRepository();
  }

  async createQuestion(pregnancyId: string, content: string) {
    return this.questionRepository.create({ pregnancyId, content });
  }

  async getQuestions(pregnancyId: string) {
    return this.questionRepository.findByPregnancyId(pregnancyId);
  }

  async updateQuestion(id: string, data: { content?: string; status?: string; answer?: string }) {
    return this.questionRepository.update(id, data);
  }

  async deleteQuestion(id: string) {
    return this.questionRepository.delete(id);
  }

  async getQuestionById(id: string) {
    return this.questionRepository.findById(id);
  }
}
