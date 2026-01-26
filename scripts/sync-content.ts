import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const docsPath = resolve("docs/CONTENT_AUTHORING.md");

const docs = readFileSync(docsPath, "utf-8");

console.log("Content sync is not implemented yet.");
console.log("Follow the structure below when adding content:\n");
console.log(docs.split("\n").slice(0, 14).join("\n"));
