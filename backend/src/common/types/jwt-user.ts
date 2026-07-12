import { RoleName } from "@prisma/client";

export type JwtUser = {
  sub: string;
  email: string;
  name: string;
  roles: RoleName[];
};

