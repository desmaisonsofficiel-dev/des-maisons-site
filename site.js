// Code partagé : vidéo YouTube, infolettre, vote, compteur.
(function(){
  // Vidéo YouTube : on charge le lecteur seulement au clic (page plus rapide)
  document.querySelectorAll(".video[data-yt]").forEach(v=>{
    const b=v.querySelector("button");if(!b)return;
    const sortie=v.dataset.sortie?Date.parse(v.dataset.sortie):0;
    const heure=sortie?new Date(sortie).toLocaleTimeString("fr-CA",{timeZone:"America/Toronto",hour:"numeric"}):"";
    const attente=()=>sortie&&Date.now()<sortie;
    if(attente()){
      v.classList.add("bientot");
      v.querySelector(".titre-v").textContent="Vidéo disponible à "+heure;
      setTimeout(()=>{v.classList.remove("bientot");v.querySelector(".titre-v").textContent="▶ Regarder l’épisode"},sortie-Date.now()+1000);
    }
    b.addEventListener("click",()=>{
      if(attente())return;
      const f=document.createElement("iframe");
      f.src="https://www.youtube-nocookie.com/embed/"+v.dataset.yt+"?autoplay=1&rel=0";
      f.title=v.dataset.titre||"Épisode Des Maisons";
      f.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen=true;
      v.innerHTML="";v.appendChild(f);
      compter("video/"+v.dataset.yt,"Lecture vidéo");
    });
  });

  // Infolettre (Netlify Forms)
  document.querySelectorAll("form[name=infolettre]").forEach(f=>{
    f.addEventListener("submit",async e=>{
      e.preventDefault();
      const msg=f.parentElement.querySelector(".retour-msg"),btn=f.querySelector("button");
      const c=f.querySelector("input[type=email]");
      if(!/^\S+@\S+\.\S+$/.test(c.value.trim())){msg.textContent="Vérifie ton adresse courriel.";msg.hidden=false;return}
      btn.disabled=true;
      let ok=false;
      try{const r=await fetch("/",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(new FormData(f)).toString()});ok=r.ok}catch(x){}
      btn.disabled=false;
      if(ok){f.hidden=true;msg.textContent="C’est noté ✓ Tu vas recevoir le prochain épisode avant tout le monde.";compter("infolettre/inscription","Inscription infolettre")}
      else msg.textContent="Oups, ça n’a pas marché. Réessaie dans un instant, ou écris à desmaisonsofficiel@gmail.com.";
      msg.hidden=false;
    });
  });

  // Compteur de jours en vente (ex. Erin)
  const jours=d=>Math.max(0,Math.floor((Date.now()-new Date(d+"T00:00:00"))/86400000));
  document.querySelectorAll("[data-depuis]").forEach(e=>{
    const n=jours(e.dataset.depuis),nb=e.querySelector(".cv-nb");
    if(nb)nb.textContent=n;else e.textContent="En vente depuis "+n+" jours";
  });

  // Vote : un vote par mois, tous ouverts, résultats en direct (fonction Netlify /api/vote)
  const moisCourant=new Date().toLocaleDateString("en-CA",{timeZone:"America/Toronto"}).slice(0,7);
  document.querySelectorAll("[data-mois]").forEach(e=>e.textContent=new Date().toLocaleDateString("fr-CA",{month:"long",year:"numeric"}));
  const panneaux=[...document.querySelectorAll(".panneau-vote[data-vote-mois]")];
  function brancherVote(p){
    const k=p.dataset.voteMois,cle="vote-"+k;
    const boutons=[...p.querySelectorAll("button.vote[data-vote]")];
    const msg=p.querySelector(".vote-msg"),podium=p.querySelector(".podium");
    const dire=t=>{if(msg){msg.textContent=t;msg.hidden=false}};
    let deja=null;try{deja=localStorage.getItem(cle)}catch(x){}
    function afficher(votes){
      const total=Object.values(votes).reduce((a,b)=>a+b,0),max=Math.max(0,...boutons.map(b=>votes[b.dataset.vote]||0));
      boutons.forEach(b=>{
        const n=votes[b.dataset.vote]||0;
        b.querySelector(".nb").textContent=n+(n>1?" votes":" vote");
        b.querySelector(".jauge b").style.width=(max?n/max*100:0)+"%";
        b.classList.toggle("en-tete",max>0&&n===max);
      });
      const top=boutons.map(b=>({nom:b.dataset.nom,slug:b.dataset.vote,n:votes[b.dataset.vote]||0})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,3);
      podium.hidden=!top.length;
      podium.innerHTML=`<div class="label">En direct · ${total} vote${total>1?"s":""}</div>`+top.map((x,i)=>`<div class="rang"><span class="pos">${i+1}</span><a href="/${x.slug}/">${x.nom}</a><b>${x.n}</b></div>`).join("");
    }
    async function charger(){try{const r=await fetch("/api/vote?mois="+k,{cache:"no-store"});if(r.ok)afficher((await r.json()).votes||{})}catch(x){}}
    function fige(slug){
      boutons.forEach(b=>{b.disabled=true;b.setAttribute("aria-pressed",b.dataset.vote===slug)});
      const b=boutons.find(x=>x.dataset.vote===slug);
      dire("Ton vote est compté ✓ "+(b?b.dataset.nom+". ":"")+"Reviens voir le classement, il bouge en direct.");
    }
    boutons.forEach(b=>b.addEventListener("click",async()=>{
      boutons.forEach(x=>x.disabled=true);
      try{
        const r=await fetch("/api/vote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({slug:b.dataset.vote,mois:k})});
        const d=await r.json().catch(()=>({}));
        if(d.votes)afficher(d.votes);
        if(r.ok||r.status===429){
          try{localStorage.setItem(cle,b.dataset.vote)}catch(x){}
          fige(b.dataset.vote);
          if(r.status===429)dire("Tu as déjà voté pour ce mois-là. Le classement est juste en haut.");
          compter("vote/"+k+"/"+b.dataset.vote,"Vote : "+b.dataset.nom);
          return;
        }
      }catch(x){}
      boutons.forEach(x=>x.disabled=false);
      dire("Oups, le vote n’est pas passé. Réessaie dans un instant.");
    }));
    if(deja)fige(deja);
    charger();
    return charger;
  }
  const rafraichir=panneaux.map(brancherVote);
  if(panneaux.length){
    const tout=()=>{if(!document.hidden)panneaux.forEach((p,i)=>{if(!p.hidden)rafraichir[i]()})};
    setInterval(tout,15000);
    document.addEventListener("visibilitychange",tout);
    document.querySelectorAll("[data-onglet]").forEach(b=>b.addEventListener("click",()=>setTimeout(tout,0)));
  }

  function compter(path,title){
    try{if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path,title,event:true})}catch(x){}
  }
})();
