import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/infra/auth/firebase-admin.config";
import { UserService } from "@/modules/users/user.service";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return NextResponse.json({ error: "Email missing from token" }, { status: 400 });
    }

    const userService = new UserService();
    const user = await userService.syncUser({
      firebaseUid: uid,
      email: email,
      name: name,
      avatarUrl: picture,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
