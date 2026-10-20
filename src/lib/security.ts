const SALT = "miravoice-v1";
const ADMIN_PEPPER = "mira-admin";

/**
 * Administrator credentials are stored only as salted SHA-256 hashes.
 * The login and password are intentionally NOT rendered anywhere in the UI.
 */
export const ADMIN_LOGIN_HASH =
  "026794ab0325035c2adae60998d9694a56aa60c645d7e269d72b05311a8ddd78";
export const ADMIN_PASSWORD_HASH =
  "66c30f82061841eac6b9ed8c8046a53c75a2ef2a5aaf9eb9445f7005b20c2dcf";
export const ADMIN_SESSION_MINUTES = 20;
export const MAX_ADMIN_ATTEMPTS = 5;
export const LOCKOUT_SECONDS = 120;

const encoder = new TextEncoder();

/** Compact synchronous SHA-256 fallback for contexts without Web Crypto (non-secure HTTP). */
function sha256Fallback(ascii: string): string {
  const rightRotate = (value: number, amount: number) =>
    (value >>> amount) | (value << (32 - amount));
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = "";
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate += 1) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) isComposite[i] = true;
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter += 1;
    }
  }
  ascii += "\x80";
  while ((ascii.length % 64) - 56) ascii += "\x00";
  for (let i = 0; i < ascii.length; i += 1) {
    const charCode = ascii.charCodeAt(i);
    words[i >> 2] |= charCode << ((3 - (i % 4)) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;
  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (let i = 0; i < 64; i += 1) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (let i = 0; i < 8; i += 1) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (let i = 0; i < 8; i += 1) {
    for (let j = 3; j + 1; j -= 1) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return result;
}

export async function sha256(value: string): Promise<string> {
  try {
    if (crypto?.subtle) {
      const bytes = await crypto.subtle.digest("SHA-256", encoder.encode(value));
      return Array.from(new Uint8Array(bytes))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    // Fall through to the pure-JS implementation on insecure contexts.
  }
  return sha256Fallback(value);
}

export async function verifyAdminCredentials(login: string, password: string) {
  const normalized = login.trim().toLowerCase();
  if (!normalized || !password) return false;
  const [loginHash, passwordHash] = await Promise.all([
    sha256(`${SALT}::${normalized}::mira-login`),
    sha256(`${SALT}::${password}::${ADMIN_PEPPER}`),
  ]);
  // Both comparisons run regardless of which value was wrong.
  const loginOk = timingSafeEqual(loginHash, ADMIN_LOGIN_HASH);
  const passwordOk = timingSafeEqual(passwordHash, ADMIN_PASSWORD_HASH);
  return loginOk && passwordOk;
}

/** Constant-time comparison of two hex digests. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function createSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Removes HTML control characters and clamps length. React also escapes output. */
export function sanitizeText(value: string, max = 500): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim()) && value.length < 160;
}

export function safeHex(value: string, fallback: string): string {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

/** Only secure images. Data URLs are accepted for locally picked avatars only. */
export function safeImageUrl(value: string, allowData = false): string | null {
  const trimmed = value.trim();
  if (allowData && /^data:image\/(png|jpe?g|webp|gif);base64,[a-zA-Z0-9+/=]+$/i.test(trimmed)) {
    return trimmed.length < 2_500_000 ? trimmed : null;
  }
  // Bundled, same-origin asset paths such as /icon.svg — never protocol-relative.
  if (/^\/(?!\/)[\w./-]+$/.test(trimmed) && !trimmed.includes("..")) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function safeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function makeId(prefix: string): string {
  try {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  } catch {
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    return `${prefix}_${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
  }
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".", ",")} mln`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1).replace(".", ",")} tys.`;
  return String(value);
}

export function timeAgo(iso: string): string {
  const parsed = new Date(iso).getTime();
  if (Number.isNaN(parsed)) return "teraz";
  const diff = Math.max(0, Date.now() - parsed);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "teraz";
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} dni temu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mies. temu`;
  return `${Math.floor(months / 12)} lat temu`;
}

export function dateLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

export function relativeLockRemaining(until: number): number {
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}
