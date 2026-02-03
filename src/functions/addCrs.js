import { getStore } from "@netlify/blobs";

export default async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const newCR = await req.json();
    const store = getStore("all-cr-info");

    let data = await store.get("data", { type: "json" });

    if (!data) {
      return new Response(
        "Blob not seeded yet",
        { status: 500 }
      );
    }

    const system = newCR.application.toUpperCase();

    if (!data.systems[system]) {
      data.systems[system] = {
        summary: { totalCRs: 0 },
        crs: [],
      };
    }

    data.systems[system].crs.push(newCR);
    data.systems[system].summary.totalCRs++;

    await store.set("data", JSON.stringify(data));

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ addCR failed:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
};
