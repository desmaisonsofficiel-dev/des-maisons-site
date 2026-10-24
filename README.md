# desmaisons.ca

Site de Des Maisons, hébergé sur Netlify (mise à jour automatique à chaque push sur `main`).

## Ajouter une maison
1. Mettre la photo dans `images/`.
2. Ajouter un bloc dans `data.js` (MAISONS = épisodes, CARNET = maisons sans vidéo). Le `slug` devient l'adresse : desmaisons.ca/<slug>/
3. Lancer `node build.js` (génère les pages par maison, sitemap.xml et robots.txt).
4. Commit + push.

## Fichiers
- `index.html` : page d'accueil
- `data.js` : toutes les maisons
- `style.css` : styles partagés
- `site.js` : vidéo, infolettre, vote, compteur
- `build.js` : générateur des pages maison
- Formulaires Netlify : soumission-maison, commandite, infolettre
- Statistiques et votes : GoatCounter (desmaisons.goatcounter.com)
