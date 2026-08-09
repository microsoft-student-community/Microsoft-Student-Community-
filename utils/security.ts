import crypto from 'crypto';

function getEncryptionKey(): Buffer {
  const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY;
  if (!ENCRYPTION_KEY) {
    throw new Error('DB_ENCRYPTION_KEY is not set');
  }
  const key = Buffer.from(ENCRYPTION_KEY);
  if (key.length !== 32) {
    throw new Error('DB_ENCRYPTION_KEY must be exactly 32 bytes long');
  }
  return key;
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
  } catch (err) {
    throw new Error('Failed to decrypt database payload.');
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
