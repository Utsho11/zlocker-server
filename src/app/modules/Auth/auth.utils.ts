import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { VerificationCode } from "./varification.model";

export const createToken = (
  jwtPayload: { username?: string; email?: string; role: string },
  secret: Secret,
  expiresIn: SignOptions["expiresIn"]
): string => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(jwtPayload, secret, options);
};

export const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const generateUnique6DigitCode = async (
  email: string
): Promise<string> => {
  let code: string;
  let exists: boolean;

  do {
    // Generate random 6-digit code
    code = Math.floor(100000 + Math.random() * 900000).toString();

    exists = !!(await VerificationCode.findOne({ code }));
  } while (exists);

  // Remove previous codes for this email
  await VerificationCode.deleteMany({ email });

  // Save the new unique code
  await VerificationCode.create({ email, code });

  return code;
};
