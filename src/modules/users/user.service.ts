import { UserRepository } from "./user.repository";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async syncUser(data: { firebaseUid: string; email: string; name?: string; avatarUrl?: string }) {
    const existingUser = await this.userRepository.findByFirebaseUid(data.firebaseUid);

    if (existingUser) {
      return existingUser;
    }

    return this.userRepository.create(data);
  }

  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }

  async updateUser(id: string, data: { name?: string; avatarUrl?: string }) {
    return this.userRepository.update(id, data);
  }

  async deleteUser(id: string) {
    return this.userRepository.delete(id);
  }
}
