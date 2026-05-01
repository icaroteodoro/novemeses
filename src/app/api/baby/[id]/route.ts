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
    const record = await babyRecordService.getRecordById(id);

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // VUL-12: Verify ownership
    const { PregnancyService } = await import("@/modules/pregnancy/pregnancy.service");
    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);
    if (!pregnancy || record.pregnancyId !== pregnancy.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await babyRecordService.deleteRecord(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting baby record:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
