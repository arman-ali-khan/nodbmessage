// AES-GCM encryption utilities
export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;

  // Generate a random key for room-based encryption
  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Export key to string for storage
  static async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return Array.from(new Uint8Array(exported))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Import key from string
  static async importKey(keyString: string): Promise<CryptoKey> {
    const keyBytes = new Uint8Array(
      keyString.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    return await crypto.subtle.importKey(
      'raw',
      keyBytes,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt message content
  static async encrypt(content: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      data
    );

    return {
      encrypted: Array.from(new Uint8Array(encrypted))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      iv: Array.from(iv)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
    };
  }

  // Decrypt message content
  static async decrypt(encryptedContent: string, key: CryptoKey, ivString: string): Promise<string> {
    const encryptedBytes = new Uint8Array(
      encryptedContent.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    const iv = new Uint8Array(
      ivString.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );

    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      encryptedBytes
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Simple password hashing using PBKDF2
  static async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const saltBytes = salt ? 
      new Uint8Array(salt.match(/.{2}/g)!.map(byte => parseInt(byte, 16))) :
      crypto.getRandomValues(new Uint8Array(16));

    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);

    const key = await crypto.subtle.importKey(
      'raw',
      passwordBytes,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      256
    );

    return {
      hash: Array.from(new Uint8Array(derivedBits))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      salt: Array.from(saltBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
    };
  }

  // Verify password
  static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const { hash: newHash } = await this.hashPassword(password, salt);
    return newHash === hash;
  }
}