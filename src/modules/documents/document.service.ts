import { DocumentRepository } from "./document.repository";
import { StorageService } from "@/infra/storage/storage.service";

export class DocumentService {
  private documentRepository: DocumentRepository;
  private storageService: StorageService;

  constructor() {
    this.documentRepository = new DocumentRepository();
    this.storageService = new StorageService();
  }

  async uploadDocument(data: {
    pregnancyId: string;
    name: string;
    file: Buffer | Blob | Uint8Array;
    category: string;
    type: string;
  }) {
    const filePath = `documents/${data.pregnancyId}/${Date.now()}-${data.name}`;
    const url = await this.storageService.uploadFile(filePath, data.file, data.type);

    return this.documentRepository.create({
      pregnancyId: data.pregnancyId,
      name: data.name,
      url,
      category: data.category,
      type: data.type,
    });
  }

  async getDocumentsByPregnancy(pregnancyId: string) {
    return this.documentRepository.findByPregnancyId(pregnancyId);
  }
}
