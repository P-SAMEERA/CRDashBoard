import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "PATCH") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { crId, updates } = await req.json();
  const store = getStore("all-cr-info");

  const data = await store.get("data", { type: "json" });

  let updated = false;

  Object.values(data.systems).forEach((system) => {
    system.crs.forEach((cr) => {
      if (cr.crId === crId) {
        Object.assign(cr, updates);
        updated = true;
      }
    });
  });

  if (!updated) {
    return new Response("CR not found", { status: 404 });
  }

  await store.set("data", JSON.stringify(data));

  return new Response(JSON.stringify({ success: true }));
};
