import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { InvitationService } from "@/modules/pregnancy/invitation.service";
import { PregnancyService } from "@/modules/pregnancy/pregnancy.service";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { email } = inviteSchema.parse(body);

    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);

    if (!pregnancy) {
      return NextResponse.json({ error: "Nenhuma gestação ativa encontrada" }, { status: 404 });
    }

    if (pregnancy.userId !== user.id) {
        return NextResponse.json({ error: "Apenas o administrador da gestação pode convidar parceiros" }, { status: 403 });
    }

    if (pregnancy.partnerId) {
      return NextResponse.json({ error: "Esta gestação já possui um parceiro vinculado" }, { status: 400 });
    }

    const invitationService = new InvitationService();
    const invitation = await invitationService.sendInvitation(pregnancy.id, email, user.id);

    return NextResponse.json({ invitation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error sending invitation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
