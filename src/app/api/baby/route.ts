import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { BabyRecordService } from "@/modules/baby/baby-record.service";
import { PregnancyService } from "@/modules/pregnancy/pregnancy.service";
import { z } from "zod";

const babyRecordSchema = z.object({
  week: z.number().min(1).max(42),
  weight: z.number().optional(),
  size: z.number().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = babyRecordSchema.parse(body);

    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);

    if (!pregnancy) {
      return NextResponse.json({ error: "No active pregnancy found" }, { status: 404 });
    }

    const babyRecordService = new BabyRecordService();
    const record = await babyRecordService.addRecord({
      pregnancyId: pregnancy.id,
      ...data,
    });

    return NextResponse.json({ record });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating baby record:", error);
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
      return NextResponse.json({ records: [] });
    }

    const babyRecordService = new BabyRecordService();
    const records = await babyRecordService.getHistory(pregnancy.id);

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error getting baby records:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
