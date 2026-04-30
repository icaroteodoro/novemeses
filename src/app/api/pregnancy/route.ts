import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { PregnancyService } from "@/modules/pregnancy/pregnancy.service";
import { z } from "zod";

const createPregnancySchema = z.object({
  startDate: z.union([z.date(), z.string().transform((v) => (v ? new Date(v) : null))]).optional(),
  dueDate: z.union([z.date(), z.string().transform((v) => (v ? new Date(v) : null))]).optional(),
  babyName: z.string().optional().nullable(),
  babyNameBoy: z.string().optional().nullable(),
  babyNameGirl: z.string().optional().nullable(),
  babyGender: z.enum(["MENINO", "MENINA", "SURPRESA"]).optional(),
  parentRole: z.enum(["PAI", "MAE"]).optional(),
  onboardingDone: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = createPregnancySchema.parse(body);

    if (!data.startDate) {
      return NextResponse.json({ error: "Start date is required" }, { status: 400 });
    }

    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.createPregnancy(user.id, data.startDate, data as any);

    return NextResponse.json({ pregnancy });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating pregnancy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = createPregnancySchema.partial().parse(body);

    const pregnancyService = new PregnancyService();
    const existing = await pregnancyService.getActivePregnancy(user.id);
    if (!existing) {
      return NextResponse.json({ error: "No pregnancy found" }, { status: 404 });
    }

    // Detect if user is owner or partner
    const isOwner = existing.userId === user.id;
    
    // Filter out null/undefined values to avoid prisma errors on required fields
    const updateData: any = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== null && v !== undefined)
    );

    // If role is provided, ensure it updates the correct field
    if (data.parentRole) {
        if (!isOwner) {
            updateData.partnerRole = data.parentRole;
            delete updateData.parentRole;
        }
    }

    console.log("Updating pregnancy for user:", user.id, "Data:", updateData);
    const pregnancy = await pregnancyService.updatePregnancy(existing.id, updateData);
    console.log("Updated pregnancy result:", pregnancy);
    return NextResponse.json({ pregnancy });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error updating pregnancy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);

    return NextResponse.json({ pregnancy });
  } catch (error) {
    console.error("Error getting pregnancy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
