import type { DefaultSession } from "next-auth";
import type { PermissionMatrix } from "@/services/PermissionService";

declare module "next-auth" {
  interface User {
    id?: string;
    roleKey?: string;
    permissions?: PermissionMatrix;
  }

  interface Session {
    user: {
      id: string;
      roleKey: string;
      permissions: PermissionMatrix;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    roleKey?: string;
  }
}
