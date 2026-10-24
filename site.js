// Code partagé : vidéo YouTube, infolettre, vote, compteur.
(function(){
  // Vidéo YouTube : on charge le lecteur seulement au clic (page plus rapide)
  document.querySelectorAll(".video[data-yt]").forEach(v=>{
    const b=v.querySelector("button");if(!b)return;
    b.addEventListener("click",()=>{
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

  // Vote : la pire maison du mois (compté dans GoatCounter)
  const mois=new Date().toLocaleDateString("fr-CA",{month:"long",year:"numeric"});
  const cle="vote-"+new Date().toISOString().slice(0,7);
  let deja=null;try{deja=localStorage.getItem(cle)}catch(x){}
  document.querySelectorAll("[data-mois]").forEach(e=>e.textContent=mois);
  const boutons=document.querySelectorAll("button.vote[data-vote]");
  function fige(slug){
    boutons.forEach(b=>{b.disabled=true;b.setAttribute("aria-pressed",b.dataset.vote===slug)});
    document.querySelectorAll(".vote-msg").forEach(m=>{m.hidden=false;
      const nom=[...boutons].find(b=>b.dataset.vote===slug);
      m.textContent="Ton vote est compté ✓ "+(nom?nom.dataset.nom+". ":"")+"Le verdict sort dans un épisode à la fin du mois.";});
  }
  boutons.forEach(b=>b.addEventListener("click",()=>{
    compter("vote/"+cle.slice(5)+"/"+b.dataset.vote,"Vote : "+b.dataset.nom);
    try{localStorage.setItem(cle,b.dataset.vote)}catch(x){}
    fige(b.dataset.vote);
  }));
  if(deja&&boutons.length)fige(deja);

  function compter(path,title){
    try{if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path,title,event:true})}catch(x){}
  }
})();
