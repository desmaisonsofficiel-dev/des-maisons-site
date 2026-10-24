// Génère une page par maison (desmaisons.ca/<slug>/) + sitemap.xml
// Utilisation : node build.js
const fs=require("fs"),path=require("path");
const {MAISONS,CARNET}=require("./data.js");
const SITE="https://desmaisons.ca";
const GOATCOUNTER="desmaisons"; // nom du compte GoatCounter

const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const ytId=u=>{if(!u)return null;const m=u.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);return m?m[1]:null};

const tout=[
  ...MAISONS.map(m=>({...m,type:"episode"})),
  ...CARNET.map(c=>({...c,type:"carnet",texte:c.accroche,prix:c.annee}))
];

function tete({titre,desc,image,url}){
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:site_name" content="Des Maisons.">
<meta property="og:title" content="${esc(titre)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="article">
<meta property="og:locale" content="fr_CA">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/images/edd9d7ae11.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;600;800&family=IBM+Plex+Mono:wght@500&display=swap">
<link rel="stylesheet" href="/style.css">
<style>[hidden]{display:none!important}img{max-width:100%}</style>
<script data-goatcounter="https://${GOATCOUNTER}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</head>`;
}

function infolettre(){
  return `<div class="infolettre">
  <div class="label">L’infolettre</div>
  <h3>Le prochain épisode, avant tout le monde.</h3>
  <p>Une maison weird dans ta boîte courriel, de temps en temps. Pas de spam. Juste du café puis des maisons.</p>
  <form name="infolettre" method="POST" data-netlify="true" netlify-honeypot="bot-field">
    <input type="hidden" name="form-name" value="infolettre">
    <p hidden><label>Ne pas remplir <input name="bot-field"></label></p>
    <label class="label" for="courriel-il" hidden>Ton courriel</label>
    <input id="courriel-il" type="email" name="courriel" placeholder="ton@courriel.com" autocomplete="email" required>
    <button class="btn" type="submit">Je m’inscris</button>
  </form>
  <p class="retour-msg" hidden></p>
</div>`;
}

function page(m){
  const url=`${SITE}/${m.slug}/`,yt=ytId(m.video);
  const desc=m.type==="carnet"?m.accroche:m.texte;
  const titre=`${m.nom} · ${m.lieu} | Des Maisons.`;
  const label=`${m.type==="episode"?m.theme:m.cat} · ${m.lieu}`;
  let corps="";
  if(m.type==="carnet"){
    const der=m.lignes.length-1;
    corps=`<div class="texte-maison"><p class="accroche">${m.accroche}</p>${m.lignes.map((l,i)=>l===""?'<p class="vide"></p>':`<p class="${i===der?"sincere":""}">${l}</p>`).join("")}</div>`;
  }else{
    corps=`<div class="texte-maison"><p class="accroche">${m.texte}</p></div>`;
  }
  const video=yt?`<div class="video" data-yt="${yt}" data-titre="${esc(m.nom)}">
      <img src="https://i.ytimg.com/vi/${yt}/hqdefault.jpg" alt="" loading="lazy">
      <button type="button" aria-label="Regarder l’épisode : ${esc(m.nom)}"><span class="jouer"></span><span class="titre-v">▶ Regarder l’épisode</span></button>
    </div>`:"";
  const photo=m.photo?`<div class="photo-grande"><img src="${m.photo}" alt="${esc(m.nom)}, ${esc(m.lieu)}"><span class="credit" style="position:absolute;right:0;bottom:0;background:rgba(13,12,11,.75);color:#efe6d2;font:500 10px var(--mono);padding:3px 6px">${esc(m.credit||"")}</span></div>`:"";
  const infos=[m.type==="episode"?(m.prix+(m.annee?" · construite en "+m.annee:"")):null,...(m.infos||[]),m.episode?"Épisode du "+m.episode:null].filter(Boolean);
  const autres=tout.filter(x=>x.slug!==m.slug).slice(0,3);
  return `${tete({titre,desc,image:SITE+m.photo,url})}
<body>
<div class="wrap barre"><a href="/"><img src="/images/edd9d7ae11.jpg" alt="">Des Maisons.</a><a class="retour" href="/#${m.type==="episode"?"maisons":"carnet"}">← Toutes les maisons</a></div>
<main class="wrap">
  <article class="page-maison">
    <div class="label">${esc(label)}</div>
    <h1>${m.nom}</h1>
    <span class="prix-p">${esc(m.prix)}</span>
    ${video}
    ${photo}
    ${corps}
    <div class="infos-p">${infos.map(i=>`<span>${esc(i)}</span>`).join("")}</div>
    <div class="boutons">
      ${m.annonce||m.lien?`<a class="btn secondaire" href="${m.annonce||m.lien}" target="_blank" rel="noopener">Voir l’annonce →</a>`:""}
      ${yt?`<a class="btn secondaire" href="https://www.youtube.com/watch?v=${yt}" target="_blank" rel="noopener">Ouvrir sur YouTube</a>`:`<a class="btn secondaire" href="https://www.youtube.com/@Des.maisons" target="_blank" rel="noopener">La chaîne YouTube</a>`}
      <a class="btn" href="/#vote">Voter pour la pire maison du mois</a>
    </div>
  </article>
  <section style="padding-block:40px;border-top:0">${infolettre()}</section>
  <section style="padding-block:40px">
    <div class="tete"><div><div class="label">Tant qu’à être ici</div><h2 style="font-size:clamp(36px,7vw,56px)">D’autres maisons.</h2></div></div>
    <div class="autres">${autres.map(a=>`<a class="mini" href="/${a.slug}/"><img src="${a.photo}" alt="" loading="lazy"><span>${a.nom}</span><small>${esc(a.lieu)}</small></a>`).join("")}</div>
  </section>
</main>
<footer class="wrap">
  <span>© 2026 Des Maisons. Une production <a href="https://boulayphotographie.ca" target="_blank" rel="noopener">Boulay Photographie</a>.</span>
  <span><a href="/">desmaisons.ca</a></span>
</footer>
<script src="/site.js"></script>
</body>
</html>
`;
}

for(const m of tout){
  if(!m.slug)throw new Error("slug manquant pour "+m.nom);
  fs.mkdirSync(path.join(__dirname,m.slug),{recursive:true});
  fs.writeFileSync(path.join(__dirname,m.slug,"index.html"),page(m));
}
fs.writeFileSync(path.join(__dirname,"netlify/functions/slugs.mjs"),"export default "+JSON.stringify(tout.map(m=>m.slug))+";\n");
const urls=[SITE+"/",...tout.map(m=>`${SITE}/${m.slug}/`)];
fs.writeFileSync(path.join(__dirname,"sitemap.xml"),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(__dirname,"robots.txt"),`User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log("Pages générées :",tout.map(m=>"/"+m.slug).join(" "));
