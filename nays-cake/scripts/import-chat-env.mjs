import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(process.argv[2] || path.join(root, "../Bot_Nay/env.txt"));
const destination = path.join(root, ".env");
const incoming = dotenv.parse(fs.readFileSync(source));
const original = fs.existsSync(destination) ? fs.readFileSync(destination, "utf8") : "";
const current = dotenv.parse(original);
const names = ["GEMINI_API_KEY", "GEMINI_MODEL", "GROQ_API_KEY", "GROQ_MODEL", "OPENROUTER_API_KEY", "OPENROUTER_MODEL"];
const additions = [];
for (const name of names) {
  const value = incoming[name]?.trim();
  if (!value) continue;
  const target = "CHAT_" + name;
  if (current[target] !== undefined && current[target] !== value) throw new Error("Konfigurasi berbeda sudah ada: " + target + ". Tidak ditimpa.");
  if (current[target] === value) continue;
  if (/[\r\n\x00']/.test(value)) throw new Error("Format konfigurasi tidak didukung: " + name);
  additions.push({ name: target, line: target + "='" + value + "'" });
}
if (!additions.length) console.log("Tidak ada perubahan konfigurasi chat.");
else {
  const content = original + (original.endsWith("\n") ? "" : "\n") + "\n# AI chat website - server only\n" + additions.map(a => a.line).join("\n") + "\n";
  const temp = destination + ".import-" + randomUUID() + ".tmp";
  try {
    fs.writeFileSync(temp, content, { flag: "wx", mode: 0o600 });
    fs.renameSync(temp, destination);
  } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
  console.log("Konfigurasi lokal ditambahkan: " + additions.map(a => a.name).join(", "));
}
