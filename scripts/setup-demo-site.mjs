import fs from "node:fs";

const res = await fetch("http://localhost:3033/api/v1/websites");
const sites = await res.json();
if (!sites.length) throw new Error("No website found. Start the backend first.");
const key = sites[0].site_key;

const file = "demo-site/index.html";
let html = fs.readFileSync(file, "utf8");
html = html.replace("__REPLACE_SITE_KEY__", key);
fs.writeFileSync(file, html);
console.log("Demo site configured with Site Key:", key);
