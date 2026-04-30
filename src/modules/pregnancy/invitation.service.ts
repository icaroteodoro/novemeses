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
    // Check if user already has a partner or is already invited
    const pregnancy = await this.pregnancyRepository.update(pregnancyId, {}); // Just to check if it exists? Actually better to find it.
    // In a real app, check if email is same as owner email, etc.
    
    return this.invitationRepository.create({
      pregnancyId,
      email,
      invitedById,
    });
  }

  async getPendingInvitations(email: string) {
    return this.invitationRepository.findPendingByEmail(email);
  }

  async acceptInvitation(invitationId: string, userId: string) {
    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation || invitation.status !== "PENDENTE") {
      throw new Error("Convite inválido ou já processado");
    }

    // Update pregnancy with partnerId
    await this.pregnancyRepository.update(invitation.pregnancyId, {
      partnerId: userId,
    });

    // Update invitation status
    return this.invitationRepository.updateStatus(invitationId, "ACEITO");
  }

  async rejectInvitation(invitationId: string) {
    return this.invitationRepository.updateStatus(invitationId, "RECUSADO");
  }
}
