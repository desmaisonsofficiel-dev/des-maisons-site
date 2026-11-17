// Listes « Les maisons » et « Le carnet » : aperçu sur l'accueil (data-limite), liste complète sur /maisons/ et /carnet/
(function(){
  // Façade dessinée en attendant une vraie photo
  function facade(cv,seed){
    const r=n=>{seed=(seed*9301+49297)%233280;return seed/233280*n};
    const w=cv.width=400,h=cv.height=300,c=cv.getContext("2d");
    c.fillStyle=["#2c2925","#3a2f22","#1f2a2e"][Math.floor(r(3))];c.fillRect(0,0,w,h);
    c.fillStyle="#181614";c.fillRect(0,h*.78,w,h);
    const bx=60+r(40),bw=w-bx*2,by=h*.38+r(20);
    c.fillStyle="#efe6d2";c.globalAlpha=.14;c.fillRect(bx,by,bw,h*.78-by);
    c.beginPath();c.moveTo(bx-14,by);c.lineTo(w/2,by-50-r(40));c.lineTo(bx+bw+14,by);c.fill();
    c.globalAlpha=1;c.fillStyle="#f5c51a";
    const n=2+Math.floor(r(3));
    for(let i=0;i<n;i++){c.globalAlpha=.4+r(.5);c.fillRect(bx+20+i*(bw-40)/n,by+24,22,26)}
    c.globalAlpha=1;
  }
  const norm=t=>String(t||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
  document.querySelectorAll("[data-nb-maisons]").forEach(e=>e.textContent=MAISONS.length);
  document.querySelectorAll("[data-nb-carnet]").forEach(e=>e.textContent=CARNET.length);

  // Boutons de filtre + recherche (seulement sur les pages complètes)
  function outils(cont,liste,cle,rendre){
    const etat={filtre:"Tout",q:""};
    if(!cont)return etat;
    const f=cont.querySelector(".filtres"),q=cont.querySelector("input[type=search]");
    if(f){
      const cats=["Tout",...new Set(liste.map(x=>x[cle]))];
      if(cats.length<3)f.hidden=true;
      cats.forEach(t=>{const b=document.createElement("button");b.type="button";b.textContent=t;b.setAttribute("aria-pressed",t==="Tout");
        b.onclick=()=>{etat.filtre=t;f.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));rendre()};f.appendChild(b)});
    }
    if(q)q.addEventListener("input",()=>{etat.q=norm(q.value.trim());rendre()});
    return etat;
  }
  const garder=(etat,x,cle)=>(etat.filtre==="Tout"||x[cle]===etat.filtre)&&(!etat.q||norm(x.nom+" "+x.lieu).includes(etat.q));

  // LES MAISONS
  const sm=document.getElementById("maisons"),grille=document.getElementById("grille");
  if(sm&&grille){
    const lim=+sm.dataset.limite||0;
    const em=outils(sm.querySelector(".outils"),MAISONS,"theme",rendreM);
    function rendreM(){
      grille.innerHTML="";
      let l=MAISONS.filter(m=>garder(em,m,"theme"));
      if(lim)l=l.slice(0,lim);
      if(!l.length){grille.innerHTML='<p class="vide-inv">Aucune maison ne correspond. Essaie un autre mot.</p>';return}
      l.forEach(m=>{
        const n=MAISONS.indexOf(m),pret=m.statut==="En ligne",el=document.createElement("article");el.className="maison";
        const attente=m.sortie&&Date.now()<Date.parse(m.sortie);
        el.innerHTML=`<div class="photo">${m.photo?`<img src="${m.photo}" alt="${m.nom}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"><span class="credit">${m.credit||""}</span>`:"<canvas></canvas>"}${attente?`<span class="prix">VIDÉO DISPONIBLE À ${new Date(m.sortie).toLocaleTimeString("fr-CA",{timeZone:"America/Toronto",hour:"numeric"}).replace(" h"," H").toUpperCase()}</span>`:`<span class="prix ${pret?"":"bientot"}">${pret?"EN LIGNE":"BIENTÔT"}</span>`}</div>
          <div class="corps"><div class="label">${m.theme}${m.lieu?" · "+m.lieu:""}</div><h3><a href="/${m.slug}/" style="text-decoration:none;color:inherit">${m.nom}</a></h3>${m.enVente?`<span class="cv-mini">En vente depuis ${Math.max(0,Math.floor((Date.now()-new Date(m.enVente+"T00:00:00"))/864e5))} jours</span>`:""}<p>${m.texte}</p>
          ${m.prix?`<div class="label" style="color:var(--jaune)">${m.prix}${m.annee?" · "+m.annee:""}</div>`:""}
          <div class="fiche"><span class="label">${m.episode?"Épisode du "+m.episode:"Fiche "+String(n+1).padStart(3,"0")}</span><span style="display:flex;gap:14px;flex-wrap:wrap">${m.annonce?`<a href="${m.annonce}" target="_blank" rel="noopener">L’annonce</a>`:""}${pret?`<a href="/${m.slug}/">La fiche + l’épisode →</a>`:'<span class="label">À venir</span>'}</span></div></div>`;
        grille.appendChild(el);
        const cv=el.querySelector("canvas");if(cv)facade(cv,n*977+13);
      });
    }
    rendreM();
  }

  // LE CARNET
  const sc=document.getElementById("carnet"),cl=document.getElementById("carnet-liste");
  if(sc&&cl){
    const lim=+sc.dataset.limite||0,court=!!lim;
    const ec=outils(sc.querySelector(".outils"),CARNET,"cat",rendreC);
    function rendreC(){
      cl.innerHTML="";
      let l=CARNET.filter(b=>garder(ec,b,"cat"));
      if(lim)l=l.slice(0,lim);
      if(!l.length){cl.innerHTML='<p class="vide-inv">Aucun billet ne correspond. Essaie un autre mot.</p>';return}
      l.forEach(b=>{
        const n=CARNET.indexOf(b),el=document.createElement("article");el.className="billet"+(court?" court":"");
        const dernier=b.lignes.length-1;
        const lignes=b.lignes.map((x,i)=>x===""?'<p class="vide"></p>':`<p class="${i===dernier?"sincere":""}">${x}</p>`).join("");
        el.innerHTML=`<div class="photo">${b.photo?`<img src="${b.photo}" alt="${b.nom}, ${b.lieu}" loading="lazy"><span class="credit">${b.credit||""}</span>`:"<canvas></canvas>"}<span class="prix">${b.annee.toUpperCase()}</span></div>
          <div class="corps"><div class="label">${b.cat} · ${b.lieu}</div><h3><a href="/${b.slug}/" style="text-decoration:none;color:inherit">${b.nom}</a></h3><p class="accroche">${b.accroche}</p>
          ${court?`<a class="lire" href="/${b.slug}/">Lire la fiche →</a>`:`<div class="texte" id="texte-${n}" hidden>${lignes}</div>
          <button class="lire" type="button" aria-expanded="false" aria-controls="texte-${n}">Lire la fiche</button>
          <div class="infos">${b.infos.map(x=>`<span>${x}</span>`).join("")}<span>Billet n° ${String(n+1).padStart(3,"0")}</span><a href="/${b.slug}/" style="color:var(--creme)">Page de la maison →</a>${b.lien?`<a href="${b.lien}" target="_blank" rel="noopener" style="color:var(--jaune)">Voir l’annonce →</a>`:""}</div>`}</div>`;
        cl.appendChild(el);
        const cv=el.querySelector("canvas");if(cv)facade(cv,n*313+71);
        const btn=el.querySelector("button.lire"),tx=el.querySelector(".texte");
        if(btn)btn.onclick=()=>{const o=tx.hidden;tx.hidden=!o;btn.setAttribute("aria-expanded",o);btn.textContent=o?"Refermer":"Lire la fiche"};
      });
    }
    rendreC();
  }
})();
