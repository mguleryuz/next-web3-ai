import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { validateJWT } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/lib/user.mongo";
import { authConfig, extractWalletAddress, type DynamicJwtPayload } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.token as string;
        if (typeof token !== "string" || !token) {
          throw new Error("Token is required");
        }

        const jwtPayload = (await validateJWT(token)) as DynamicJwtPayload | null;

        if (!jwtPayload) {
          return null;
        }

        const walletAddress = extractWalletAddress(jwtPayload);

        if (!walletAddress) {
          console.error("No wallet address found in JWT payload");
          return null;
        }

        // Connect to database and create/find user
        await dbConnect();

        const user = await UserModel.findOrCreateByWallet(walletAddress, {
          dynamic_user_id: jwtPayload.sub,
          email: jwtPayload.email,
          name: jwtPayload.name,
        });

        return {
          id: user._id.toString(),
          name: user.name || "",
          email: user.email || "",
          walletAddress: user.wallet_address,
        };
      },
    }),
  ],
});
