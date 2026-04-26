import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { BabyRecordService } from "@/modules/baby/baby-record.service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const babyRecordService = new BabyRecordService();
    await babyRecordService.deleteRecord(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting baby record:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
