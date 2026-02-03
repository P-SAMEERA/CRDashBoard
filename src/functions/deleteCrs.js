import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "DELETE") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { crId } = await req.json();
  const store = getStore("all-cr-info");

  const data = await store.get("data", { type: "json" });

  let deleted = false;

  Object.values(data.systems).forEach((system) => {
    const before = system.crs.length;
    system.crs = system.crs.filter((cr) => cr.crId !== crId);

    if (system.crs.length !== before) {
      system.summary.totalCRs -= 1;
      deleted = true;
    }
  });

  if (!deleted) {
    return new Response("CR not found", { status: 404 });
  }

  await store.set("data", JSON.stringify(data));

  return new Response(JSON.stringify({ success: true }));
};
