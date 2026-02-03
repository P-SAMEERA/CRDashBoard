import { getStore } from "@netlify/blobs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export default async () => {
  try {
    const store = getStore("all-cr-info");

    // Try blob first
    let data = await store.get("data", { type: "json" });

    // Auto-seed if empty
    if (!data) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      const dataPath = path.resolve(
        __dirname,
        "../assets/data.json"
      );

      const raw = fs.readFileSync(dataPath, "utf-8");
      data = JSON.parse(raw);

      await store.set("data", JSON.stringify(data));
      console.log("✅ Blob seeded from data.json");
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ getCRs failed:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
};
