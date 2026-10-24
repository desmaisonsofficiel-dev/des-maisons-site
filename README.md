# desmaisons.ca

Site de Des Maisons, hébergé sur Netlify (mise à jour automatique à chaque push sur `main`).

## Ajouter une maison
1. Mettre la photo dans `images/`.
2. Ajouter un bloc dans `data.js` (MAISONS = épisodes, CARNET = maisons sans vidéo). Le `slug` devient l'adresse : desmaisons.ca/<slug>/
3. Lancer `node build.js` (génère les pages par maison, sitemap.xml, robots.txt et la liste des maisons pour le vote).
4. Commit + push.

## Fichiers
- `index.html` : page d'accueil
- `data.js` : toutes les maisons
- `style.css` : styles partagés
- `site.js` : vidéo, infolettre, vote, compteur
- `build.js` : générateur des pages maison
- Formulaires Netlify : soumission-maison, commandite, infolettre
- Votes en direct : fonction Netlify `netlify/functions/vote.mjs` (/api/vote) + Netlify Blobs
- Statistiques : GoatCounter (desmaisons.goatcounter.com)
