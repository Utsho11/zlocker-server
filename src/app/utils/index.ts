import crypto from "crypto";
import config from "../config";

const getEncryptionKey = (): Buffer => {
  const secret = config.secret_key || "default_insecure_secret_key_32_bytes_len!";
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, "hex");
  }
  // Deterministically create 32-byte key from any secret string
  return crypto.createHash("sha256").update(secret).digest();
};

const algorithm = "aes-256-ecb";

export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(algorithm, key, null);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    return text;
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(algorithm, key, null);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error (returning raw content):", error);
    return encryptedText;
  }
}
