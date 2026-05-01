import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { InvitationService } from "@/modules/pregnancy/invitation.service";
import { z } from "zod";

const respondSchema = z.object({
  invitationId: z.string(),
  action: z.enum(["ACEITAR", "RECUSAR"]),
  role: z.enum(["PAI", "MAE"]).optional(),
});

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { invitationId, action, role } = respondSchema.parse(body);

    const invitationService = new InvitationService();
    
    if (action === "ACEITAR") {
      if (!role) {
        return NextResponse.json({ error: "O papel (papai/mamãe) é obrigatório para aceitar o convite" }, { status: 400 });
      }
      await invitationService.acceptInvitation(invitationId, user.id, user.email, role);
    } else {
      await invitationService.rejectInvitation(invitationId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error responding to invitation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
