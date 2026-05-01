import { InvitationRepository } from "./invitation.repository";
import { PregnancyRepository } from "./pregnancy.repository";

export class InvitationService {
  private invitationRepository: InvitationRepository;
  private pregnancyRepository: PregnancyRepository;

  constructor() {
    this.invitationRepository = new InvitationRepository();
    this.pregnancyRepository = new PregnancyRepository();
  }

  async sendInvitation(pregnancyId: string, email: string, invitedById: string) {
    return this.invitationRepository.create({
      pregnancyId,
      email,
      invitedById,
    });
  }

  async getPendingInvitations(email: string) {
    return this.invitationRepository.findPendingByEmail(email);
  }

  async acceptInvitation(invitationId: string, userId: string, userEmail: string, role: string) {
    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation || invitation.status !== "PENDENTE") {
      throw new Error("Convite inválido ou já processado");
    }

    // Ensure only the intended recipient can accept the invitation
    if (invitation.email !== userEmail) {
      throw new Error("Este convite não pertence a você");
    }

    if (invitation.pregnancy.partnerId) {
      throw new Error("Esta gestação já possui um parceiro vinculado");
    }

    // Update pregnancy with partnerId and partnerRole
    await this.pregnancyRepository.update(invitation.pregnancyId, {
      partnerId: userId,
      partnerRole: role,
    });

    // Update invitation status
    return this.invitationRepository.updateStatus(invitationId, "ACEITO");
  }

  async rejectInvitation(invitationId: string) {
    return this.invitationRepository.updateStatus(invitationId, "RECUSADO");
  }
}
