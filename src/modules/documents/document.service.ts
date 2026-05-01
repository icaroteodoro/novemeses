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
    files: { buffer: Buffer | Blob | Uint8Array; type: string; originalName: string }[];
    category: string;
  }) {
    const uploadedFiles = await Promise.all(data.files.map(async (file) => {
      const filePath = `documents/${data.pregnancyId}/${Date.now()}-${file.originalName}`;
      const url = await this.storageService.uploadFile(filePath, file.buffer, file.type);
      return { url, type: file.type };
    }));

    const doc = await this.documentRepository.create({
      pregnancyId: data.pregnancyId,
      name: data.name,
      category: data.category,
      files: uploadedFiles,
    });

    // Generate signed URLs for the return object
    const filesWithSignedUrls = await Promise.all((doc as any).files.map(async (f: any) => ({
      ...f,
      url: await this.storageService.getSignedUrl(f.url),
    })));

    return {
      ...doc,
      files: filesWithSignedUrls,
    };
  }

  async getDocumentsByPregnancy(pregnancyId: string) {
    const docs = await this.documentRepository.findByPregnancyId(pregnancyId);
    
    // Generate signed URLs for each file in each document
    return Promise.all(docs.map(async (doc) => {
      const filesWithSignedUrls = await Promise.all((doc as any).files.map(async (f: any) => ({
        ...f,
        url: await this.storageService.getSignedUrl(f.url),
      })));

      return {
        ...doc,
        files: filesWithSignedUrls,
      };
    }));
  }
}
