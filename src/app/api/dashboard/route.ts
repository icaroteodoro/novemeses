import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { DashboardService } from "@/modules/dashboard/dashboard.service";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const dashboardService = new DashboardService();
    const summary = await dashboardService.getSummary(user.id);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error getting dashboard summary:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
