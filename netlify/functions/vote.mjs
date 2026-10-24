// Vote « La pire maison du mois » : GET = résultats, POST = voter.
// Les votes sont gardés dans Netlify Blobs (un objet par mois).
import { getStore } from "@netlify/blobs";
import SLUGS from "./slugs.mjs";

const MAX_PAR_IP = 3; // votes par adresse IP par mois (maisons partagées, bureaux…)
const mois = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" }).slice(0, 7);
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json", "cache-control": "no-store" }
});

async function hash(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s + "des-maisons"));
  return [...new Uint8Array(b)].slice(0, 12).map(x => x.toString(16).padStart(2, "0")).join("");
}

export default async (req, context) => {
  const store = getStore({ name: "votes", consistency: "strong" });
  const m = mois();

  if (req.method === "GET") {
    const votes = (await store.get(m, { type: "json" })) || {};
    return json({ mois: m, votes });
  }
  if (req.method !== "POST") return json({ erreur: "méthode" }, 405);

  let slug;
  try { slug = (await req.json()).slug; } catch { return json({ erreur: "requête" }, 400); }
  if (!SLUGS.includes(slug)) return json({ erreur: "maison inconnue" }, 400);

  // Limite par IP
  const ipKey = `ip/${m}/${await hash(context.ip || "inconnu")}`;
  const deja = Number(await store.get(ipKey)) || 0;
  if (deja >= MAX_PAR_IP) {
    const votes = (await store.get(m, { type: "json" })) || {};
    return json({ mois: m, votes, limite: true }, 429);
  }

  // Incrément sans perdre de votes si deux personnes votent en même temps
  for (let essai = 0; essai < 8; essai++) {
    const r = await store.getWithMetadata(m, { type: "json" });
    const votes = r?.data || {};
    votes[slug] = (votes[slug] || 0) + 1;
    const res = r
      ? await store.setJSON(m, votes, { onlyIfMatch: r.etag })
      : await store.setJSON(m, votes, { onlyIfNew: true });
    if (res?.modified !== false) {
      await store.set(ipKey, String(deja + 1));
      return json({ mois: m, votes });
    }
  }
  return json({ erreur: "occupé, réessaie" }, 503);
};

export const config = { path: "/api/vote" };
