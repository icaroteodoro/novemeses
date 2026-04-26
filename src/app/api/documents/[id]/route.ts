import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { DocumentRepository } from "@/modules/documents/document.repository";
import { StorageService } from "@/infra/storage/storage.service";

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

    // Delete from Supabase Storage first
    await storageService.deleteFile(doc.url);

    // Then remove from database
    await documentRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
