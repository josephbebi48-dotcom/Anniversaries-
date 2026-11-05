SITE D'ANNIVERSAIRE - MODE D'EMPLOI
1) Installe Node.js (https://nodejs.org) si ce n'est pas fait.
2) Dans ce dossier, ouvre un terminal :
     npm install
     npm run dev
   Le site s'ouvre sur http://localhost:5173
3) Personnalise : src/App.jsx (haut du fichier) -> NAME, FROM, MESSAGE, QUIZ.
4) Musique : mets ton fichier MP3 dans public/music.mp3 (sinon une mélodie
   "Joyeux anniversaire" générée est jouée). La musique démarre au clic sur
   "Ouvrir la surprise" (les navigateurs interdisent l'autoplay sans clic).
5) Pour publier en ligne : npm run build -> dossier dist/ (Netlify, Vercel...).

NOTE : au gâteau, le micro sert à détecter le souffle (autorisation demandée par le navigateur, fonctionne sur localhost). Sinon, toucher le gâteau ou le bouton souffle les bougies.
