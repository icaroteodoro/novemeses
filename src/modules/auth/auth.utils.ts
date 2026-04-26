import { NextRequest } from "next/server";
import { adminAuth } from "@/infra/auth/firebase-admin.config";
import { UserRepository } from "@/modules/users/user.repository";

export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userRepository = new UserRepository();
    return userRepository.findByFirebaseUid(decodedToken.uid);
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}
