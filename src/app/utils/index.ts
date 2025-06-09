import crypto from "crypto";

const keyHex = process.env.SECRET_KEY!; // hex string (64 chars)
const key = Buffer.from(keyHex, "hex"); // convert to 32-byte Buffer

const algorithm = "aes-256-ecb";

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, null);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decrypt(encryptedText: string): string {
  const decipher = crypto.createDecipheriv(algorithm, key, null);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
