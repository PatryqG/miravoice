/**
 * Generates salted SHA-256 hashes for the administrator credentials.
 *
 * Usage (values are read from the environment, never written to the repo):
 *   ADMIN_LOGIN='...' ADMIN_PASS='...' node scripts/hash-admin.mjs
 *
 * Copy the two printed constants into src/lib/security.ts, then commit only
 * the hashes. Do not commit or share the plaintext values.
 */
import { createHash } from "node:crypto";

const SALT = "miravoice-v1";
const LOGIN_PEPPER = "mira-login";
const PASSWORD_PEPPER = "mira-admin";

const login = process.env.ADMIN_LOGIN?.trim().toLowerCase() ?? "";
const password = process.env.ADMIN_PASS ?? "";

if (!login || !password) {
  console.error("Ustaw zmienne środowiskowe ADMIN_LOGIN i ADMIN_PASS.");
  console.error("Przykład: ADMIN_LOGIN='...' ADMIN_PASS='...' node scripts/hash-admin.mjs");
  process.exit(1);
}

if (password.length < 10) {
  console.error("Hasło powinno mieć co najmniej 10 znaków.");
  process.exit(1);
}

const hash = (value) => createHash("sha256").update(value).digest("hex");

console.log("ADMIN_LOGIN_HASH =", `"${hash(`${SALT}::${login}::${LOGIN_PEPPER}`)}"`);
console.log("ADMIN_PASSWORD_HASH =", `"${hash(`${SALT}::${password}::${PASSWORD_PEPPER}`)}"`);
console.log("\nPodmień oba skróty w src/lib/security.ts. Nie commituj danych jawnych.");
