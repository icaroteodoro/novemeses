import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { DocumentService } from "@/modules/documents/document.service";
import { PregnancyService } from "@/modules/pregnancy/pregnancy.service";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const name = formData.get("name") as string;

    if (!file || !category || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate file type against server-side whitelist (do not trust client-provided MIME)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Envie PDF, JPEG, PNG, WebP ou GIF." },
        { status: 400 }
      );
    }

    // Enforce maximum file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Arquivo muito grande. O tamanho máximo permitido é 10 MB." },
        { status: 400 }
      );
    }

    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);

    if (!pregnancy) {
      return NextResponse.json({ error: "No active pregnancy found" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const documentService = new DocumentService();
    const document = await documentService.uploadDocument({
      pregnancyId: pregnancy.id,
      name,
      file: buffer,
      category,
      type: file.type,
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);

    if (!pregnancy) {
      return NextResponse.json({ documents: [] });
    }

    const documentService = new DocumentService();
    const documents = await documentService.getDocumentsByPregnancy(pregnancy.id);

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error getting documents:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
