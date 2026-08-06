import crypto from 'crypto';

function getEncryptionKey(): Buffer {
  const secret = process.env.DB_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) {
    throw new Error('Password-reset encryption is unavailable. Set a strong DB_ENCRYPTION_KEY before enabling this feature.');
  }

  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts cleartext using AES-256-GCM.
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts ciphertext using AES-256-GCM.
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Password reset data is invalid.');
  }
  
  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getEncryptionKey();
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    throw new Error('Password reset data could not be verified.');
  }
}



/**
 * Validates that a string matches a strict email format.
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  // RFC 5322 compliant strict email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}


export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 phone standard format
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
}
