import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { DocumentRepository } from "@/modules/documents/document.repository";
import { StorageService } from "@/infra/storage/storage.service";
import { PregnancyService } from "@/modules/pregnancy/pregnancy.service";

const documentRepository = new DocumentRepository();
const storageService = new StorageService();

// PATCH /api/documents/[id] — rename
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const doc = await documentRepository.findById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Verify ownership — document must belong to the user's active pregnancy
    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);
    if (!pregnancy || doc.pregnancyId !== pregnancy.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await documentRepository.updateName(id, name.trim());
    return NextResponse.json({ document: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/documents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const doc = await documentRepository.findById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Verify ownership before deleting
    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);
    if (!pregnancy || doc.pregnancyId !== pregnancy.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete all files from Storage first
    await Promise.all((doc as any).files.map((f: any) => storageService.deleteFile(f.url)));

    // Then remove from database
    await documentRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
