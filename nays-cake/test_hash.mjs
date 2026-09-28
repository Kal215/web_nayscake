import { createHash } from "node:crypto";
const email = "admin@nayscake.com";
const key = createHash("sha256").update(email).digest("hex");
console.log(key);
