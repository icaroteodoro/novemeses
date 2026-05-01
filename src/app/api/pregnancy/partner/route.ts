import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { PregnancyService } from "@/modules/pregnancy/pregnancy.service";

export async function DELETE(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);

    if (!pregnancy) {
      return NextResponse.json({ error: "Nenhuma gestação ativa encontrada" }, { status: 404 });
    }

    if (pregnancy.userId !== user.id) {
      return NextResponse.json({ error: "Apenas o dono da gestação pode remover o parceiro" }, { status: 403 });
    }

    if (!pregnancy.partnerId) {
      return NextResponse.json({ error: "Nenhum parceiro vinculado para remover" }, { status: 400 });
    }

    await pregnancyService.updatePregnancy(pregnancy.id, {
      partnerId: null,
      partnerRole: null,
    } as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing partner:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
