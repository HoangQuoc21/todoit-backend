import { hash, compare } from "bcrypt";

export const passwordHelper = {
  hashPassword: async (password: string) => {
    const hashedPassword = await hash(
      password,
      Number(process.env.HASHING_SALT!),
    );

    return hashedPassword;
  },

  comparePasswords: async (password: string, hashedPassword: string) => {
    const isMatch = await compare(password, hashedPassword);
    return isMatch;
  },
};
