const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function encrypt(text: string): Promise<string> {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(text)
  );

  return `${bufferToBase64(iv)}.${bufferToBase64(new Uint8Array(encrypted))}`;
}

export async function decrypt(encryptedText: string): Promise<string> {
  const key = await getCryptoKey();
  const [ivBase64, dataBase64] = encryptedText.split('.');
  
  if (!ivBase64 || !dataBase64) {
    throw new Error('Invalid session format');
  }

  const iv = base64ToBuffer(ivBase64);
  const data = base64ToBuffer(dataBase64);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return decoder.decode(decrypted);
}

// Helpers
function bufferToBase64(buffer: ArrayBuffer|Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

// Key management
let cryptoKey: CryptoKey | null = null;

async function getCryptoKey(): Promise<CryptoKey> {
  if (!cryptoKey) {
    const secret = process.env.SESSION_SECRET_KEY;
    if (!secret) throw new Error('SESSION_SECRET_KEY missing in .env');
    
    const keyBytes = base64ToBuffer(secret);
    if (keyBytes.length !== 32) {
      throw new Error('SESSION_SECRET_KEY must be 32-byte Base64 string');
    }

    cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }
  return cryptoKey;
}