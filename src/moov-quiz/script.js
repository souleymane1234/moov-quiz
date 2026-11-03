
/* ====== CONTENUS À COMPLÉTER ======
   Modifiez simplement ces tableaux pour mettre à jour les sections. */

// Thèmes du quiz (Catégories)
const UNIVERS = [
  {titre:"Voix", texte:"Appels, forfaits et bonus voix.", couleur:"#0B5CAD", icone:"i-phone"},
  {titre:"SMS", texte:"Forfaits et services SMS.", couleur:"#F28C1B", icone:"i-sms"},
  {titre:"Data", texte:"Internet mobile et forfaits data.", couleur:"#1E9E5A", icone:"i-wifi"},
  {titre:"Mobile Money", texte:"Transferts, paiements et services Moov Money.", couleur:"#E4354F", icone:"i-money"},
  {titre:"Équipements", texte:"Téléphones et équipements connectés.", couleur:"#7A4CC2", icone:"i-gift"}
];

// Actualités — ajoutez {categorie, date, titre, resume, image (data: URI), lien}
const ACTUALITES = [
  {categorie:"Gagnants", date:"Publication Facebook", titre:"Ils ont gagné à Moov Quiz", resume:"Retour en images sur la remise des gains à nos gagnants. Le prochain, c'est peut-être toi !", image:"/moov-quiz/asset-2.jpg", lien:"https://www.facebook.com/photo/?fbid=3708026235932690&set=a.455712306586096"},
  {categorie:"Gagnants", date:"1 octobre 2026", titre:"150 000 FCFA à gagner cette semaine", resume:"Le meilleur score de la semaine remporte 150 000 FCFA en cash. Le prochain gagnant, c'est peut-être toi !", poster:{grand:"150 000", petit:"FCFA chaque semaine", g:"linear-gradient(150deg,#F28C1B,#E4354F)"},
   texte:"Chaque semaine, le joueur qui termine avec le meilleur score remporte 150 000 FCFA en cash. Pour être dans la course, réponds chaque jour à tes 3 questions : chaque bonne réponse te rapporte 100 points. Les gagnants sont contactés par Moov Africa Côte d'Ivoire, en présence de l'huissier désigné pour le jeu."},
  {categorie:"Annonces", date:"1 octobre 2026", titre:"L'application Moov Quiz est disponible", resume:"Joue, suis tes points et regarde les Reels depuis ton téléphone, sur Android et iOS.", poster:{grand:"L'app", petit:"Android & iOS", g:"linear-gradient(150deg,#1673D1,#062B5C)"},
   texte:"Moov Quiz s'installe dans ta poche. Avec l'application, tu joues à ton quiz du jour, tu retrouves tes points dans ton profil et tu regardes les vidéos des challenges dans les Reels. Elle est disponible sur Google Play et sur l'App Store."},
  {categorie:"Le jeu", date:"1 octobre 2026", titre:"7 jours pour tester gratuitement", resume:"Abonne-toi en ligne avec ton numéro Moov ou envoie OUI au 7002 : ta première semaine est offerte.", poster:{grand:"7 jours", petit:"offerts", g:"linear-gradient(150deg,#062B5C,#0B5CAD)"},
   texte:"Ta première semaine sur Moov Quiz est offerte. Abonne-toi en ligne en saisissant ton numéro Moov, ou envoie OUI au 7002. Tu reçois 50 points de bienvenue, puis tes 3 questions chaque jour. Après les 7 jours gratuits, le service coûte 100 FCFA par jour, et tu peux arrêter à tout moment en envoyant STOP au 7002."},
  {categorie:"Le jeu", date:"1 octobre 2026", titre:"Chaque bonne réponse vaut 100 points", resume:"Réponds chaque jour : +100 points à la réception de ton quiz et +100 points par bonne réponse.", poster:{grand:"+100", petit:"points par bonne réponse", g:"linear-gradient(150deg,#7A4CC2,#062B5C)"},
   texte:"Le barème de Moov Quiz est simple : 50 points de bienvenue à l'abonnement, 100 points à la réception du quiz du jour et 100 points par bonne réponse. Une réponse fausse ne rapporte rien, mais ne te fait pas perdre de points. En cas d'égalité, c'est le premier à atteindre le top score qui l'emporte."},
  {categorie:"Compétitions", date:"1 octobre 2026", titre:"Deviens la star de la pub Moov", resume:"Le challenge vidéo arrive : filme ta meilleure pub d'un produit Moov et fais voter tes proches.", poster:{grand:"Pub Star", petit:"challenge vidéo", g:"linear-gradient(150deg,#E4354F,#7A4CC2)"},
   texte:"Moov Quiz lance ses émissions challenge. Premier rendez-vous : le challenge vidéo. Choisis un produit ou un service Moov, filme ta meilleure publicité, poste-la et appelle ton entourage à voter. La vidéo qui récolte le plus de likes remporte la récompense. Les candidatures sont ouvertes sur la page Compétitions."}
];

// Sponsoring — offres provisoires, à valider
const OFFRES = [
  {titre:"Sponsorisez le quiz", couleur:"#0B5CAD", icone:"i-mega", texte:"Associez votre marque au jeu et apparaissez dans la communication Moov Quiz.", points:["Visibilité auprès des abonnés Moov","Présence sur la plateforme","Mention dans les supports du jeu"]},
  {titre:"Offrez un lot", couleur:"#F28C1B", icone:"i-gift", texte:"Complétez la dotation hebdomadaire avec vos produits ou services.", points:["Lot à votre nom","Annonce auprès des gagnants","Valorisation de votre offre"]},
  {titre:"Parrainez un thème", couleur:"#7A4CC2", icone:"i-bulb", texte:"Associez votre marque à une thématique de questions.", points:["Thème nommé à votre marque","Questions liées à votre univers","Visibilité dans la section Thèmes"]},
  {titre:"Animez la communauté", couleur:"#B8860B", icone:"i-users", texte:"Accompagnez les joueurs au-delà du quiz.", points:["Activations et jeux spéciaux","Rencontres avec les gagnants","Contenus sur les réseaux sociaux"]}
];

// Partenaires — remplacez par {nom, logo (data: URI)}
const PARTENAIRES = [{nom:"moov africa", moov:true},{nom:"Logo partenaire"},{nom:"Logo partenaire"},{nom:"Logo partenaire"},{nom:"Logo partenaire"}];

/* ====== RENDU ====== */
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

document.getElementById("bubbles").innerHTML = UNIVERS.map(u => `
  <div class="bubble${u.bientot?" soon":""}" style="--c:${u.couleur}">
    <svg aria-hidden="true"><use href="#${u.icone}"/></svg>
    <h3>${esc(u.titre)}</h3><p>${esc(u.texte)}</p>
    ${u.bientot ? "" : `<a href="#jouer">En savoir plus</a>`}
  </div>`).join("");

function newsCardHTML(n){
  const i = ACTUALITES.indexOf(n);
  const visual = n.image ? `<img src="${n.image}" alt="">` : n.poster ? `<div class="poster" style="background:${n.poster.g}"><i>?</i><b>${esc(n.poster.grand)}</b><span>${esc(n.poster.petit)}</span></div>` : "?";
  const more = n.lien ? `<a href="${n.lien}" target="_blank" rel="noopener">Voir la publication</a>` : `<button class="more" data-news="${i}">Lire la suite</button>`;
  return `<article class="news-card"><div class="news-img">${visual}<span class="tag">${esc(n.categorie)}</span></div>
    <div class="news-body"><div class="news-date">${esc(n.date)}</div><h3>${esc(n.titre)}</h3><p>${esc(n.resume)}</p>${more}</div></article>`;
}
document.getElementById("newsGrid").innerHTML = ACTUALITES.slice(0,4).map(newsCardHTML).join("");
document.addEventListener("click", e => {
  const b = e.target.closest("[data-news]"); if (!b) return; const n = ACTUALITES[+b.dataset.news];
  document.getElementById("newsDetail").innerHTML = `<button class="close" data-close aria-label="Fermer" style="top:8px; right:8px; background:rgba(4,22,48,.55); color:#fff; z-index:2">×</button>
    <div class="news-img">${n.poster ? `<div class="poster" style="background:${n.poster.g}"><i>?</i><b>${esc(n.poster.grand)}</b><span>${esc(n.poster.petit)}</span></div>` : ""}<span class="tag">${esc(n.categorie)}</span></div>
    <div class="news-date">${esc(n.date)}</div><h3 style="font-size:26px">${esc(n.titre)}</h3><p style="margin:0">${esc(n.texte || n.resume)}</p>`;
  const d = document.getElementById("m-news"); d.querySelector("[data-close]").onclick = () => d.close(); d.showModal();
});

document.getElementById("offers").innerHTML = OFFRES.map(o => `
  <article class="offer" style="--c:${o.couleur}">
    <div class="offer-head"><span class="ico"><svg><use href="#${o.icone}"/></svg></span><h4>${esc(o.titre)}</h4></div>
    <p>${esc(o.texte)}</p>
    <ul>${o.points.map(p=>`<li>${esc(p)}</li>`).join("")}</ul>
    <a href="#partenariat">En savoir plus</a>
  </article>`).join("");

const slots = PARTENAIRES.map(p => p.logo
  ? `<div class="logo-slot" style="border:0"><img src="${p.logo}" alt="${esc(p.nom)}" style="max-height:56px"></div>`
  : `<div class="logo-slot${p.moov?" moov":""}">${esc(p.nom)}</div>`).join("");
document.getElementById("track").innerHTML = slots + slots;

/* Titre rotatif du hero */
const lines = ["Réponds à 3 questions par jour","Cumule tes points","Gagne 150 000 FCFA chaque semaine"];
const rot = document.getElementById("rotator");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduce) {
  let i = 0;
  setInterval(() => {
    rot.classList.add("out");
    setTimeout(() => { i = (i + 1) % lines.length; rot.textContent = lines[i]; rot.classList.remove("out"); }, 450);
  }, 3600);
}

/* Modales */
document.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => document.getElementById(b.dataset.open).showModal()));
document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => b.closest("dialog").close()));
document.querySelectorAll("dialog").forEach(d => d.addEventListener("click", e => { if (e.target === d) d.close(); }));
/* ====== DONNÉES DES PAGES ====== */
const CATEGORIES_ACTU = ["Gagnants","Le jeu","Instant Quiz"];

// Publications du fil Actualités — {categorie, titre, image, texte}
// Dans texte : retours à la ligne conservés, **gras**, #hashtags liés à Facebook.
const PUBLICATIONS = [
  {categorie:"Gagnants", titre:"Moov Quiz continue de faire des heureux", image:"/moov-quiz/e5fdaa43b6.jpg",
   texte:"Famille Moov Africa CI, #MOOVQUIZ continue de faire des heureux gagnants pour le bonheur de tous.\nPour tenter aussi votre chance, envoyez :\n« OUI » via SMS au 7002\n#JMMoovAfricaCI"},
  {categorie:"Gagnants", titre:"Les gagnants Moov Quiz de la semaine", image:"/moov-quiz/86d6689171.jpg",
   texte:"Famille Moov Africa CI, nous avons eu le plaisir de récompenser nos gagnants du jeu MOOV QUIZ de la semaine.\nIl s'agit de :\n- Monsieur KOFFI KOUAKOU avec un score de 58 500 points et qui remporte la somme de 150 000 F\n- Monsieur ASSEMIEN KESSE PAUL avec un score de 53 050 points et qui remporte la somme de 100 000 F\n**Tentez votre chance chaque semaine et gagnez jusqu'à 150 000 F. Envoyez OUI au 7002.**\n#JMMoovAfricaCI"},
  {categorie:"Gagnants", titre:"Vos amis gagnent 150 000 F chaque semaine", image:"/moov-quiz/5719b12d7a.jpg",
   texte:"Famille Moov Africa CI, vos amis gagnent 150 000 F chaque semaine avec #MOOVQUIZ, et puis vous êtes là ça vous dit rien, on doit tout vous dire quoi hum !\n**Tentez votre chance chaque semaine et gagnez jusqu'à 150 000 F. Envoyez OUI au 7002.**\n#JMMoovAfricaCI"},
  {categorie:"Gagnants", titre:"Mme Koffi Akissi Nathalie remporte 150 000 F", image:"/moov-quiz/7cf93dbfa2.jpg",
   texte:"Faites comme Mme Koffi Akissi Nathalie (7100 pts), gagnante du #MOOVQUIZ.\nElle remporte 150.000 Fcfa.\nPS : ça peut être vous le prochain.\nAvec MOOV QUIZ, tentez de gagner 150.000 Fcfa chaque semaine et 2.000.000 Fcfa chaque 2 mois en envoyant OUI par SMS au 7002.\n#JMMoovAfricaCI"},
  {categorie:"Gagnants", titre:"M. Kouadio Kouamé remporte 150 000 F", image:"/moov-quiz/04db24e98b.jpg",
   texte:"Famille Moov Africa CI, faites comme M. Kouadio Kouamé qui remporte **150 000 F** à #MOOVQUIZ.\n**Envoyez OUI au 7002 et tentez votre chance chaque semaine.**\n#JMMoovAfricaCI"},
  {categorie:"Gagnants", titre:"Nos heureux gagnants de la semaine", image:"/moov-quiz/d272521c31.jpg",
   texte:"Famille Moov Africa CI, chaque semaine, tentez de gagner **150 000 F** à #MOOVQUIZ. C'est le cas de nos heureux gagnants de la semaine.\n**Tentez votre chance chaque semaine et gagnez jusqu'à 150 000 F. Envoyez OUI au 7002.**\n#JMMoovAfricaCI"},
  {categorie:"Le jeu", titre:"150 000 F à gagner chaque semaine", image:"/moov-quiz/fa27ca3b31.jpg",
   texte:"Famille Moov Africa CI, saviez-vous que chaque semaine, #MOOVQUIZ vous donne la possibilité de gagner **150 000 F** ?\n**Tentez votre chance** en envoyant maintenant **OUI au 7002**.\n#JMMoovAfricaCI"},
  {categorie:"Gagnants", titre:"M. Zeanhoulo remporte 150 000 F", image:"/moov-quiz/5719b12d7a.jpg",
   texte:"Famille Moov Africa CI, faites comme M. Zeanhoulo qui remporte **150 000 F** à #MOOVQUIZ.\n**Envoyez OUI au 7002 et tentez votre chance chaque semaine.**\n#JMMoovAfricaCI"},
  {categorie:"Instant Quiz", titre:"Instant Quiz : connaissez-vous les forfaits Moov Folie ?", image:"/moov-quiz/c27575e80a.jpg",
   texte:"Instant Quiz\nConnaissez-vous les forfaits Moov Folie ? **Envoyez OUI au 7002 et tentez de gagner jusqu'à 150 000 F chaque semaine.** #TousGagnants"}
];

// Encarts insérés dans le fil sur petit écran (les colonnes latérales y sont masquées)
const INLINE_ADS = [
  `<div class="ad ad-blue ad-inline"><span class="ad-label">Quiz du jour</span><div class="ad-big">3</div><h4>questions t'attendent</h4><p>+100 points par bonne réponse.</p><a class="btn btn-orange" href="#/play">Jouer maintenant</a></div>`,
  `<div class="ad ad-grad ad-inline"><span class="ad-label">Abonnement</span><h4>7 jours gratuits</h4><p>Abonne-toi en ligne ou envoie OUI au 7002, puis 100 FCFA/jour.</p><a class="btn btn-orange" href="#/play" data-scroll="abo">S'abonner gratuitement</a></div>`
];

// Alertes — type : info | gagnants | competitions | rappel
const ALERTES = [
  {id:"a1", type:"info", titre:"150 000 FCFA à gagner chaque semaine", texte:"Le joueur qui termine la semaine avec le meilleur score remporte 150 000 FCFA en cash."},
  {id:"a2", type:"competitions", titre:"Les compétitions arrivent", texte:"Moov Pub Star et Le Grand Duel : découvre les concepts et dépose ta candidature."},
  {id:"a3", type:"rappel", titre:"Suis ton score", texte:"Envoie SCORE au 7002 pour connaître tes points cumulés de la semaine."},
  {id:"a4", type:"info", titre:"Besoin d'aide ?", texte:"Envoie AIDE au 7002 pour toute information sur le service."}
];
const TYPES_ALERTE = {
  info:{label:"Info service", couleur:"#0B5CAD", icone:"i-bell"},
  gagnants:{label:"Gagnants", couleur:"#F28C1B", icone:"i-trophy"},
  competitions:{label:"Compétitions", couleur:"#7A4CC2", icone:"i-duel"},
  rappel:{label:"Rappels", couleur:"#062B5C", icone:"i-clock"}
};

// Questions du quiz en ligne (tirées des règles officielles du service)
const QUESTIONS = [
  {q:"Quel est le numéro court du service Moov Quiz ?", r:["7002","7020","1111","700"], ok:0},
  {q:"Combien de questions reçois-tu chaque jour ?", r:["1","3","5","10"], ok:1},
  {q:"Combien de jours gratuits à l'inscription ?", r:["3 jours","5 jours","7 jours","14 jours"], ok:2},
  {q:"Quel mot-clé envoyer pour connaître ton score ?", r:["POINTS","TOTAL","INFO","SCORE"], ok:3},
  {q:"Combien de points rapporte une bonne réponse ?", r:["100 points","10 points","50 points","200 points"], ok:0},
  {q:"Combien de points de bienvenue reçois-tu ?", r:["0 point","50 points","100 points","150 points"], ok:1},
  {q:"Quel est le lot hebdomadaire de Moov Quiz ?", r:["50 000 FCFA","100 000 FCFA","150 000 FCFA","1 500 000 FCFA"], ok:2},
  {q:"Quel mot-clé permet de se réabonner ?", r:["OUI","REVENIR","MOOV","RETOUR"], ok:3},
  {q:"Pour se désabonner, on envoie au 7002 :", r:["STOP","FIN","NON","QUITTER"], ok:0},
  {q:"Combien coûte le service après la période gratuite ?", r:["50 FCFA par jour","100 FCFA par jour","150 FCFA par jour","200 FCFA par jour"], ok:1},
  {q:"En cas d'égalité, qui l'emporte en premier ?", r:["Le plus ancien abonné","Un tirage au sort","Le premier à atteindre le top score","Le plus jeune joueur"], ok:2},
  {q:"Combien de points pour une mauvaise réponse ?", r:["−50 points","−100 points","10 points","0 point"], ok:3},
  {q:"Quel code permet d'emprunter du crédit avec Moov Crédit Secours ?", r:["*444#","*155#","*303#","*101#"], ok:0, exp:"Crédit Secours : compose *444# quand ton crédit est insuffisant."},
  {q:"Quel code ouvre le menu Moov Money ?", r:["*155#","*444#","*700*2#","*303#"], ok:0},
  {q:"Quel service Moov permet de payer ses factures CIE et SODECI ?", r:["Moov Money","Crédit Secours","Maxi Data","Folie Mix"], ok:0}
];
const QCM = [
  {q:"Quels mots-clés peux-tu envoyer au 7002 pour gérer ton Moov Quiz ?", r:["SCORE","STOP","BONUS","CADEAU"], ok:[0,1], exp:"Les commandes du 7002 sont OUI, SCORE, AIDE, STOP et RETOUR."},
  {q:"Comment peux-tu t'abonner à Moov Quiz ?", r:["En envoyant OUI au 7002","En composant *700*2#","En ligne avec ton numéro Moov","Par e-mail"], ok:[0,1,2]},
  {q:"Lesquelles sont des offres internet Moov ?", r:["Maxi Data","Fibre à la maison","Green Pay","Moov Money Card"], ok:[0,1], exp:"Green Pay sert au paiement marchand et la Moov Money Card est une carte de paiement."},
  {q:"Qu'est-ce qui te rapporte des points à Moov Quiz ?", r:["L'abonnement (points de bienvenue)","La réception du quiz du jour","Une bonne réponse","Une mauvaise réponse"], ok:[0,1,2], exp:"50 points de bienvenue, +100 à la réception du quiz du jour, +100 par bonne réponse."}
];
const AUDIO_Q = [
  {audio:"/moov-quiz/f9ac36d39f.mp3", q:"Quel est le numéro court pour jouer à Moov Quiz ?", r:["7002","7001","1111","155"], ok:0},
  {audio:"/moov-quiz/8a26ec0a8f.mp3", q:"Avec quel code peux-tu emprunter du crédit, grâce au Crédit Secours de Moov ?", r:["*444#","*155#","*303#","*101#"], ok:0},
  {audio:"/moov-quiz/feeadecf16.mp3", q:"Combien de points rapporte chaque bonne réponse à Moov Quiz ?", r:["100 points","50 points","10 points","200 points"], ok:0},
  {audio:"/moov-quiz/171cde04e3.mp3", q:"Quel service Moov permet d'envoyer de l'argent depuis ton téléphone ?", r:["Moov Money","Maxi Data","Folie Mix","Moov Quiz"], ok:0}
];
const IMAGE_Q = [
  {img:"/moov-quiz/6062cc7e65.jpg", alt:"Téléphone affichant le code *155# sur le clavier", q:"Ce code ouvre le menu de quel service ?", r:["Moov Money","Crédit Secours","Moov Quiz","Forfaits internet"], ok:0},
  {img:"/moov-quiz/84c4ce2012.jpg", alt:"Affiche Moov Quiz", q:"D'après l'affiche, combien coûte Moov Quiz par jour ?", r:["100 FCFA","50 FCFA","150 FCFA","200 FCFA"], ok:0},
  {img:"/moov-quiz/e68065f005.jpg", alt:"Gagnant Moov Quiz tenant une enveloppe", q:"Combien ce gagnant a-t-il remporté à Moov Quiz ?", r:["150 000 F","100 000 F","50 000 F","1 500 000 F"], ok:0},
  {img:"/moov-quiz/11de47392d.jpg", alt:"SMS OUI envoyé au 7002", q:"Que se passe-t-il quand tu envoies ce SMS au 7002 ?", r:["Tu t'abonnes à Moov Quiz","Tu consultes ton score","Tu te désabonnes","Tu empruntes du crédit"], ok:0}
];
const VIDEO_Q = [
  {video:"/moov-quiz/c0ac750f6a.mp4", q:"Quelle est la syntaxe pour emprunter du crédit avec Moov Crédit Secours ?", r:["*444#","*155#","*303#","*700*2#"], ok:0, exp:"Avec Crédit Secours, Koffi compose *444# et peut appeler sa maman."},
  {video:"/moov-quiz/6523be93a1.mp4", q:"Quel code permet d'acheter un forfait internet Moov ?", r:["*303#","*155#","*444#","*101#"], ok:0, exp:"Avec *303#, Awa achète un forfait internet et reprend son épisode."},
  {video:"/moov-quiz/e2c14730b3.mp4", q:"Quel service Moov permet à Yao de payer sa facture CIE depuis son téléphone ?", r:["Moov Money","Crédit Secours","Maxi Data","Moov Quiz"], ok:0, exp:"Avec Moov Money, Yao paie sa facture CIE sans faire la queue."}
];
const MODES = {
  qcu:{label:"QCU", sub:"Choix unique", desc:"Une seule bonne réponse", icon:"i-radio", bank:() => QUESTIONS},
  qcm:{label:"QCM", sub:"Choix multiple", desc:"Plusieurs bonnes réponses", icon:"i-boxes", bank:() => QCM},
  audio:{label:"Quiz Audio", sub:"Écoute et réponds", desc:"La question est lue à voix haute", icon:"i-audio", bank:() => AUDIO_Q},
  image:{label:"Quiz Image", sub:"Observe et réponds", desc:"La réponse est dans l'image", icon:"i-image", bank:() => IMAGE_Q},
  video:{label:"Quiz Vidéo", sub:"Regarde et réponds", desc:"Un mini-cartoon, une question", icon:"i-video", bank:() => VIDEO_Q}
};

// Reels — ajoutez {video:"url ou /_blob/id"} pour afficher une vraie vidéo
const REELS = [
  {titre:"Gagnant Moov Quiz", texte:"M. Zeanhoulo remporte 150 000 FCFA à Moov Quiz. Le prochain gagnant, c'est peut-être toi !", auteur:"@moovquiz", tag:"#MOOVQUIZ #JMMoovAfricaCI", g:"#0B5CAD", video:"/moov-quiz/55efe59d41.mp4", likes:0},
  {titre:"Gagnant Moov Quiz", texte:"M. Kouadio Kouamé remporte 150 000 FCFA à Moov Quiz. Envoie OUI au 7002 et tente ta chance !", auteur:"@moovquiz", tag:"#MOOVQUIZ #JMMoovAfricaCI", g:"#0B5CAD", video:"/moov-quiz/79d40ed247.mp4", likes:0},
  {titre:"Gagnante Moov Quiz", texte:"Une nouvelle gagnante remporte 150 000 FCFA à Moov Quiz. Et toi, tu attends quoi ?", auteur:"@moovquiz", tag:"#MOOVQUIZ #JMMoovAfricaCI", g:"#0B5CAD", video:"/moov-quiz/c92ee3e6e6.mp4", likes:0},
  {titre:"Moov Quiz", texte:"3 questions par jour, 150 000 FCFA chaque semaine. 7 jours gratuits pour essayer !", auteur:"@moovquiz", tag:"#MoovQuiz", g:"#0B5CAD", video:"/moov-quiz/a6786d2124.mp4", likes:0},
  {titre:"Le prochain gagnant", texte:"Le prochain gagnant de la semaine, c'est peut-être toi. Abonne-toi gratuitement !", auteur:"@moovquiz", tag:"#MoovQuiz #Gagnant", g:"#F28C1B", video:"/moov-quiz/afe7548cdf.mp4", likes:0},
  {titre:"Les points", texte:"+50 de bienvenue, +100 à la réception du quiz, +100 par bonne réponse. Suis ton score !", auteur:"@moovquiz", tag:"#MoovQuiz #Points", g:"#062B5C", video:"/moov-quiz/f3d2e2df6a.mp4", likes:0},
  {titre:"Moov Pub Star", texte:"Filme ta meilleure pub d'un produit ou service Moov, poste-la et récolte un max de likes.", auteur:"@moovquiz", tag:"#MoovPubStar", g:"linear-gradient(160deg,#F28C1B,#E4354F)", icone:"i-cam", cta:"pub"},
  {titre:"Le Grand Duel", texte:"Les top vainqueurs de Moov Quiz s'affrontent pour le giga lot.", auteur:"@moovquiz", tag:"#LeGrandDuel", g:"linear-gradient(160deg,#7A4CC2,#062B5C)", icone:"i-duel", cta:"duel"}
];

/* ====== Stockage local (préférences de l'appareil) ====== */
const MEM = {};
const store = {
  get(k, d){ try { const v = localStorage.getItem("mq-"+k); if (v) return JSON.parse(v); } catch(e){} return k in MEM ? JSON.parse(MEM[k]) : d; },
  set(k, v){ MEM[k] = JSON.stringify(v); try { localStorage.setItem("mq-"+k, MEM[k]); } catch(e){} }
};

/* ====== Actualités (page) ====== */
let newsFilter = "Toutes";
function renderNewsPage(){
  document.getElementById("newsFilters").innerHTML = ["Toutes", ...CATEGORIES_ACTU].map(c =>
    `<button class="fchip" aria-pressed="${c===newsFilter}" data-nf="${esc(c)}">${esc(c)}</button>`).join("");
  const list = PUBLICATIONS.filter(p => newsFilter==="Toutes" || p.categorie===newsFilter);
  let out = ""; list.forEach((p, k) => { out += postHTML(p); if (k === 2) out += INLINE_ADS[0]; if (k === 5) out += INLINE_ADS[1]; });
  document.getElementById("newsFeed").innerHTML = out || `<div class="empty-state"><div class="ok"><svg><use href="#i-news"/></svg></div><h3>Aucune actualité</h3><p>Aucune publication dans cette catégorie pour le moment.</p></div>`;
}
function richText(t){
  return esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/#([A-Za-zÀ-ÿ0-9_]+)/g, (m, tag) => `<a class="hash" href="https://www.facebook.com/hashtag/${tag.toLowerCase()}" target="_blank" rel="noopener">#${tag}</a>`);
}
function postHTML(p){
  const i = PUBLICATIONS.indexOf(p); const liked = !!store.get("postlikes", {})[i];
  return `<article class="post" id="post-${i}">
    <header class="post-head"><svg class="post-av" aria-hidden="true"><use href="#logo-quiz"/></svg>
      <div><b>Moov Quiz</b><span>Moov Africa Côte d'Ivoire · ${esc(p.categorie)}</span></div></header>
    <div class="post-text">${richText(p.texte)}</div>
    <img class="post-img" src="${p.image}" alt="${esc(p.titre)}" loading="lazy">
    <div class="post-bar">
      <button class="${liked ? "liked" : ""}" data-plike="${i}" aria-pressed="${liked}"><svg><use href="#i-heart"/></svg>J'aime${liked ? " · 1" : ""}</button>
      <button data-pshare="${i}"><svg><use href="#i-share"/></svg>Partager</button>
      <a href="sms:7002?body=OUI"><svg><use href="#i-sms"/></svg>OUI au 7002</a>
    </div>
  </article>`;
}
document.getElementById("newsFilters").addEventListener("click", e => {
  const b = e.target.closest("[data-nf]"); if (!b) return; newsFilter = b.dataset.nf; renderNewsPage();
});
document.getElementById("newsFeed").addEventListener("click", async e => {
  const l = e.target.closest("[data-plike]");
  if (l) { const likes = store.get("postlikes", {}); const i = l.dataset.plike; likes[i] = !likes[i]; store.set("postlikes", likes);
    l.classList.toggle("liked", likes[i]); l.setAttribute("aria-pressed", likes[i]); l.lastChild.textContent = "J'aime" + (likes[i] ? " · 1" : ""); return; }
  const s = e.target.closest("[data-pshare]");
  if (s) { const p = PUBLICATIONS[+s.dataset.pshare]; const text = p.texte.replace(/\*\*/g, "");
    try { if (navigator.share) await navigator.share({title:p.titre, text}); else { await navigator.clipboard.writeText(text); s.lastChild.textContent = "Texte copié"; } } catch(err) {} }
});

/* ====== Alertes ====== */
let alertFilter = "toutes";
const readSet = () => new Set(store.get("read", []));
const prefs = () => Object.assign({info:true,gagnants:true,competitions:true,rappel:true}, store.get("prefs", {}));
function visibleAlerts(){ const p = prefs(); return ALERTES.filter(a => p[a.type]); }
function updateBadge(){
  const r = readSet(); const n = visibleAlerts().filter(a => !r.has(a.id)).length;
  const b = document.getElementById("alertBadge"); b.textContent = n; b.hidden = n === 0;
}
function renderAlerts(){
  const r = readSet();
  document.getElementById("alertFilters").innerHTML = [["toutes","Toutes"], ...Object.entries(TYPES_ALERTE).map(([k,v]) => [k,v.label])]
    .map(([k,l]) => `<button class="fchip" aria-pressed="${k===alertFilter}" data-af="${k}">${l}</button>`).join("");
  const list = visibleAlerts().filter(a => alertFilter==="toutes" || a.type===alertFilter);
  document.getElementById("alertList").innerHTML = list.length ? list.map(a => { const t = TYPES_ALERTE[a.type]; return `
    <button class="alert${r.has(a.id)?"":" unread"}" style="--c:${t.couleur}" data-aid="${a.id}">
      <span class="ai"><svg><use href="#${t.icone}"/></svg></span>
      <span><span class="ty">${t.label}</span><b>${esc(a.titre)}</b><p>${esc(a.texte)}</p></span>
      <span class="udot" aria-label="${r.has(a.id)?"":"Non lue"}"></span>
    </button>`; }).join("") : `
    <div class="empty-state"><div class="ok"><svg><use href="#i-bell"/></svg></div><h3>Aucune alerte</h3><p>Tu n'as aucune alerte dans cette catégorie. Vérifie tes préférences à droite.</p></div>`;
  const p = prefs();
  document.getElementById("prefList").innerHTML = Object.entries(TYPES_ALERTE).map(([k,v]) => `
    <label class="toggle"><span>${v.label}</span><input type="checkbox" class="switch" data-pref="${k}" ${p[k]?"checked":""}></label>`).join("");
  updateBadge();
}
document.getElementById("alertFilters").addEventListener("click", e => { const b = e.target.closest("[data-af]"); if (!b) return; alertFilter = b.dataset.af; renderAlerts(); });
document.getElementById("alertList").addEventListener("click", e => {
  const b = e.target.closest("[data-aid]"); if (!b) return; const r = readSet(); r.add(b.dataset.aid); store.set("read", [...r]); renderAlerts();
});
document.getElementById("readAll").addEventListener("click", () => { store.set("read", ALERTES.map(a => a.id)); renderAlerts(); });
document.getElementById("prefList").addEventListener("change", e => {
  const k = e.target.dataset.pref; if (!k) return; const p = prefs(); p[k] = e.target.checked; store.set("prefs", p); renderAlerts();
});

let currentPage = "home";
/* ====== Compte abonné ======
   Compte email : authentifié par l'API (window.mqAuth). Compte numéro : démo locale. */
const auth = window.mqAuth;
const DAY = 864e5;
const today = () => new Date().toISOString().slice(0,10);
const getAcc = () => store.get("account", null);
const isLogged = () => { const a = getAcc(); return !!a && store.get("session", false) && (!a.email || auth.hasSession()); };
const cleanTel = v => v.replace(/\D/g, "");
const fmtTel = t => t.replace(/(\d{2})(?=\d)/g, "$1 ");
const accName = a => a.email ? (a.nom || a.email) : fmtTel(a.tel);
async function closeSession(){
  const a = getAcc(); store.set("session", false);
  if (a && a.email) await auth.logout();
}
function telError(t){
  if (t.length !== 10) return "Saisis ton numéro Moov à 10 chiffres.";
  if (!t.startsWith("01")) return "Ce numéro n'est pas un numéro Moov. Les numéros Moov commencent par 01.";
  return "";
}
function refreshAccountUI(){
  document.querySelectorAll(".acc-label").forEach(l => l.textContent = isLogged() ? "Mon profil" : "Connexion");
  renderAbo(); if (currentPage === "profil") renderProfile();
}
function renderAbo(){
  const box = document.getElementById("aboBox");
  if (isLogged()) {
    const a = getAcc();
    box.innerHTML = `<div class="success" style="text-align:left; padding:0">
      <div class="free-note" style="background:var(--tint-blue)"><svg><use href="#i-check"/></svg><span>${a.email ? `Connecté avec ${esc(a.email)}` : `Abonné avec le ${fmtTel(a.tel)}`}</span></div>
      <p style="color:var(--muted); margin:0 0 14px">Ton quiz du jour t'attend à droite. Tes points sont dans ton profil.</p>
      <a class="btn btn-blue" href="#/profil" style="width:100%; justify-content:center">Voir mon profil</a></div>`;
    return;
  }
  box.innerHTML = `<div class="free-note"><svg><use href="#i-gift"/></svg><span>Gratuit pendant 7 jours, puis 100 FCFA/jour</span></div>
    <form class="form" id="aboForm" novalidate>
      <label>Ton numéro Moov<input name="tel" type="tel" inputmode="numeric" placeholder="01 XX XX XX XX" autocomplete="tel" required></label>
      <p class="err" id="aboErr"></p>
      <button class="btn btn-orange" type="submit" style="justify-content:center">S'abonner gratuitement</button>
      <p class="hint" style="margin:0">Renouvellement automatique. Désabonnement à tout moment.</p>
    </form>`;
  document.getElementById("aboForm").onsubmit = e => {
    e.preventDefault(); const t = cleanTel(e.target.tel.value); const err = telError(t);
    if (err) { document.getElementById("aboErr").textContent = err; e.target.tel.focus(); return; }
    const a = getAcc();
    if (!a || a.tel !== t) store.set("account", {tel:t, depuis:Date.now(), points:50, jours:0, bonnes:0, last:null});
    store.set("session", true); refreshAccountUI(); gameStart();
  };
}
function renderProfile(){
  const box = document.getElementById("profileBox");
  if (!isLogged()) {
    box.innerHTML = `<div class="empty-state"><div class="ok"><svg><use href="#i-user"/></svg></div><h3>Connecte-toi pour voir tes points</h3>
      <p>Ton profil affiche tes points, tes jours de jeu et ton abonnement.</p>
      <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap"><button class="btn btn-blue" data-account>Se connecter</button><a class="btn btn-orange" href="#/play" data-scroll="abo">S'abonner gratuitement</a></div></div>`;
    return;
  }
  const a = getAcc(); const fin = new Date(a.depuis + 7*DAY); const gratuit = Date.now() < fin.getTime();
  const finTxt = fin.toLocaleDateString("fr-FR", {day:"numeric", month:"long"});
  const played = a.last === today();
  box.innerHTML = `<div class="profile">
    <div class="id-card"><div class="avatar"><svg><use href="#i-user"/></svg></div>
      <div style="font-size:14px; color:#C9DAF0">Abonné Moov Quiz</div><div class="num">${esc(accName(a))}</div>${a.email && a.nom ? `<div style="font-size:14px; color:#C9DAF0">${esc(a.email)}</div>` : ""}
      <span class="status${gratuit ? " free" : ""}">${gratuit ? "Gratuit jusqu'au " + finTxt : "Abonné · 100 FCFA/jour"}</span></div>
    <div>
      <div class="kpis">
        <div class="kpi main"><b>${a.points}</b><span>points cumulés</span></div>
        <div class="kpi"><b>${a.jours}</b><span>jours joués</span></div>
        <div class="kpi"><b>${a.bonnes}</b><span>bonnes réponses</span></div>
      </div>
      <div class="panel" style="margin-top:16px; padding:20px">
        <b>${played ? "Quiz du jour terminé" : "Ton quiz du jour est disponible"}</b>
        <p style="margin:4px 0 0; color:var(--muted)">${played ? "Reviens demain pour tes 3 nouvelles questions." : "3 questions, jusqu'à 400 points à gagner aujourd'hui."}</p>
      </div>
      <div class="prof-actions">
        ${played ? "" : `<a class="btn btn-orange" href="#/play">Jouer le quiz du jour</a>`}
        <button class="btn btn-line" id="logoutBtn">Se déconnecter</button>
        <button class="btn btn-line" id="unsubBtn">Se désabonner</button>
      </div>
    </div></div>`;
  document.getElementById("logoutBtn").onclick = async () => { await closeSession(); refreshAccountUI(); gameStart(); go("#/"); };
  document.getElementById("unsubBtn").onclick = async () => {
    if (!confirm("Confirmer le désabonnement de Moov Quiz ? Tu pourras revenir en envoyant RETOUR au 7002.")) return;
    await closeSession(); delete MEM.account; try { localStorage.removeItem("mq-account"); } catch(e){} refreshAccountUI(); gameStart(); go("#/");
  };
}
const mLogin = document.getElementById("m-login");
function setAuthTab(tab){
  mLogin.querySelectorAll("[data-auth-tab]").forEach(b => b.setAttribute("aria-pressed", b.dataset.authTab === tab));
  mLogin.querySelectorAll("[data-auth-panel]").forEach(p => p.hidden = p.dataset.authPanel !== tab);
}
function setEmailMode(mode){
  const reg = mode === "register";
  document.getElementById("t-login").textContent = reg ? "Inscription" : "Connexion";
  document.getElementById("emailLoginForm").hidden = reg;
  document.getElementById("emailRegisterForm").hidden = !reg;
  document.getElementById("toRegister").hidden = reg;
  document.getElementById("toLogin").hidden = !reg;
}
mLogin.addEventListener("click", e => {
  const t = e.target.closest("[data-auth-tab]"); if (t) { setAuthTab(t.dataset.authTab); if (t.dataset.authTab === "tel") setEmailMode("login"); return; }
  const m = e.target.closest("[data-email-mode]"); if (m) setEmailMode(m.dataset.emailMode);
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-account]"); if (!b) return;
  if (isLogged()) { go("#/profil"); return; }
  mLogin.querySelectorAll("form").forEach(f => f.reset());
  mLogin.querySelectorAll(".err").forEach(p => p.textContent = "");
  setAuthTab("email"); setEmailMode("login");
  mLogin.showModal();
});
function openEmailSession(u){
  const a = getAcc();
  const nom = [u.firstName, u.lastName].filter(Boolean).join(" ");
  if (!a || a.email !== u.email) store.set("account", {email:u.email, id:u.id, nom, depuis:Date.now(), points:50, jours:0, bonnes:0, last:null});
  else store.set("account", Object.assign(a, {id:u.id, nom: nom || a.nom}));
  store.set("session", true); mLogin.close(); refreshAccountUI(); gameStart(); go("#/profil");
}
async function runAuth(form, errId, label, fn){
  const btn = form.querySelector('button[type="submit"]'); if (btn.disabled) return;
  const out = document.getElementById(errId); out.textContent = "";
  const txt = btn.textContent; btn.disabled = true; btn.textContent = label;
  try { openEmailSession(await fn()); }
  catch (err) { out.textContent = auth.errorMessage(err, "Une erreur est survenue. Réessaie."); }
  finally { btn.disabled = false; btn.textContent = txt; }
}
document.getElementById("emailLoginForm").onsubmit = e => {
  e.preventDefault(); const f = e.target; const out = document.getElementById("emailLoginErr");
  const email = f.email.value.trim();
  if (!emailOk(email)) { out.textContent = "Saisis une adresse email valide."; f.email.focus(); return; }
  if (!f.password.value) { out.textContent = "Saisis ton mot de passe."; f.password.focus(); return; }
  runAuth(f, "emailLoginErr", "Connexion…", () => auth.loginWithEmail({email, password:f.password.value}));
};
document.getElementById("emailRegisterForm").onsubmit = e => {
  e.preventDefault(); const f = e.target; const out = document.getElementById("emailRegisterErr");
  const email = f.email.value.trim();
  if (!emailOk(email)) { out.textContent = "Saisis une adresse email valide."; f.email.focus(); return; }
  if (f.password.value.length < 8) { out.textContent = "Le mot de passe doit contenir au moins 8 caractères."; f.password.focus(); return; }
  if (f.password.value !== f.confirm.value) { out.textContent = "Les mots de passe ne correspondent pas."; f.confirm.focus(); return; }
  runAuth(f, "emailRegisterErr", "Création…", () => auth.registerWithEmail({email, password:f.password.value, firstName:f.firstName.value, lastName:f.lastName.value}));
};
addEventListener(auth.eventName, () => { const a = getAcc(); if (a && a.email && !auth.hasSession() && store.get("session", false)) { store.set("session", false); refreshAccountUI(); gameStart(); } });
document.getElementById("loginForm").onsubmit = e => {
  e.preventDefault(); const t = cleanTel(e.target.tel.value); const err = telError(t); const out = document.getElementById("loginErr");
  if (err) { out.textContent = err; return; }
  const a = getAcc();
  if (!a || a.tel !== t) { out.textContent = "Ce numéro n'est pas encore abonné à Moov Quiz. Abonne-toi gratuitement ci-dessous."; return; }
  store.set("session", true); mLogin.close(); refreshAccountUI(); go("#/profil");
};
document.addEventListener("click", e => { if (e.target.closest("[data-closeall]")) document.querySelectorAll("dialog[open]").forEach(d => d.close()); });

/* ====== Play : quiz en ligne, 5 modes ====== */
const game = document.getElementById("game");
let G = null, gameMode = null;
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dailyOpen = () => isLogged() && getAcc().last !== today();
function gameTop(label){
  const left = `<div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap"><span class="tagd">${label || (dailyOpen() ? "Quiz du jour" : "Mode entraînement")}</span>${gameMode && G ? `<button class="tagd mode-back" id="modeBack">Changer de mode</button>` : ""}</div>`;
  if (isLogged()) { const a = getAcc();
    return `<div class="game-top">${left}<div class="scorebox"><div><b>${a.points}</b>points cumulés</div><div><b>${a.jours}</b>jours joués</div></div></div>`; }
  const s = store.get("score", {total:0, manches:0});
  return `<div class="game-top">${left}<div class="scorebox"><div><b>${s.total}</b>points d'entraînement</div><div><b>${s.manches}</b>manches</div></div></div>`;
}
function bindTop(){ const b = document.getElementById("modeBack"); if (b) b.onclick = () => { stopMedia(); G = null; gameStart(); }; }
function stopMedia(){ game.querySelectorAll("audio,video").forEach(m => { try { m.pause(); } catch(e){} }); }
function gameStart(){
  stopMedia(); gameMode = null; G = null;
  const daily = dailyOpen(), done = isLogged() && !daily;
  const intro = daily ? `<p class="mode-intro"><b>Ta prochaine manche compte pour ton quiz du jour</b> : +100 points à la réception et +100 points par bonne réponse. Choisis ton mode de jeu.</p>`
    : done ? `<p class="mode-intro"><b>Quiz du jour terminé ✓</b> Reviens demain pour cumuler des points. En attendant, entraîne-toi dans le mode de ton choix.</p>`
    : `<p class="mode-intro">Entraîne-toi librement. <b>Abonne-toi gratuitement</b> pour que tes points comptent dans la course aux 150 000 FCFA.</p>`;
  game.innerHTML = gameTop() + `<h3 style="margin-bottom:6px">Choisis ton mode de jeu</h3>${intro}
    <div class="modes">${Object.entries(MODES).map(([id,m]) => `<button class="mode" data-mode="${id}"><span class="mode-ico"><svg><use href="#${m.icon}"/></svg></span><b>${m.label}</b><span>${m.desc}</span></button>`).join("")}</div>`;
  game.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => newRound(b.dataset.mode));
}
function newRound(mode){
  gameMode = mode || gameMode || "qcu"; const bank = MODES[gameMode].bank();
  G = {mode:gameMode, qs: shuffle(bank.map((_,i) => i)).slice(0,3), i:0, res:[], daily:dailyOpen(), sel:new Set()};
  showQ();
}
function mediaHTML(q){
  if (G.mode === "audio") return `<div class="q-audio"><audio id="qMedia" src="${q.audio}" preload="auto"></audio>
      <button class="play-big" id="playBtn" aria-label="Écouter la question"><svg><use href="#i-play"/></svg></button>
      <div class="wave" aria-hidden="true">${Array.from({length:18}, (_, i) => `<i style="animation-delay:${(i%6)*0.1}s"></i>`).join("")}</div>
      <div><b>Écoute la question</b><button class="linkbtn light" id="showTxt">Afficher le texte</button></div></div>`;
  if (G.mode === "image") return `<div class="q-media"><img src="${q.img}" alt="${esc(q.alt || "")}"></div>`;
  if (G.mode === "video") return `<div class="q-media q-video"><video id="qMedia" src="${q.video}" playsinline muted autoplay preload="auto"></video>
      <div class="vid-actions"><button class="tagd" id="replayBtn"><svg><use href="#i-replay"/></svg>Revoir</button><button class="tagd" id="skipBtn">Passer à la question</button></div></div>`;
  return "";
}
function showQ(){
  const q = MODES[G.mode].bank()[G.qs[G.i]]; const order = shuffle(q.r.map((_,i) => i)); G.sel = new Set();
  const multi = G.mode === "qcm", locked = G.mode === "audio" || G.mode === "video";
  game.innerHTML = gameTop(MODES[G.mode].label + (G.daily ? " · Quiz du jour" : "")) + `
    <div class="progress">${[0,1,2].map(k => `<i class="${k < G.i ? "done" : ""}"></i>`).join("")}</div>
    <div style="font-size:14px; font-weight:800; color:#C9DAF0; margin-bottom:6px">Question ${G.i + 1} sur 3${multi ? " · Plusieurs réponses possibles" : ""}</div>
    ${mediaHTML(q)}
    <h3 id="qText" ${locked ? 'class="veiled"' : ""}>${esc(q.q)}</h3>
    <div class="answers${locked ? " locked" : ""}" id="answers">${order.map(k => `<button class="ans${multi ? " multi" : ""}" data-k="${k}" ${multi ? 'aria-pressed="false"' : ""} ${locked ? "disabled" : ""}>${multi ? '<span class="box"></span>' : ""}${esc(q.r[k])}</button>`).join("")}</div>
    ${locked ? `<p class="unlock-hint" id="unlockHint">${G.mode === "video" ? "Regarde la vidéo jusqu'au bout pour répondre." : "Écoute la question pour débloquer les réponses."}</p>` : ""}
    ${multi ? `<button class="btn btn-orange" id="validBtn" disabled style="margin-top:16px">Valider mes réponses</button>` : ""}
    <div class="feedback" id="fb"></div>`;
  bindTop();
  const unlock = () => {
    game.querySelectorAll(".ans").forEach(b => b.disabled = false);
    const a = document.getElementById("answers"); if (a) a.classList.remove("locked");
    const t = document.getElementById("qText"); if (t) t.classList.remove("veiled");
    const hnt = document.getElementById("unlockHint"); if (hnt) hnt.remove();
  };
  if (G.mode === "audio") {
    const au = document.getElementById("qMedia"), pb = document.getElementById("playBtn"), box = game.querySelector(".q-audio");
    const setIcon = () => { pb.innerHTML = `<svg><use href="#${au.paused ? "i-play" : "i-pause"}"/></svg>`; box.classList.toggle("playing", !au.paused); };
    pb.onclick = () => { if (au.paused) au.play().catch(() => unlock()); else au.pause(); };
    au.onplay = setIcon; au.onpause = setIcon; au.onended = () => { setIcon(); unlock(); };
    document.getElementById("showTxt").onclick = unlock;
  }
  if (G.mode === "video") {
    const v = document.getElementById("qMedia");
    v.onended = unlock; v.onerror = unlock;
    document.getElementById("skipBtn").onclick = () => { v.pause(); unlock(); };
    document.getElementById("replayBtn").onclick = () => { v.currentTime = 0; v.play().catch(() => {}); };
    v.play().catch(() => {});
  }
  game.querySelectorAll(".ans").forEach(b => b.onclick = () => {
    const k = +b.dataset.k;
    if (multi) { G.sel.has(k) ? G.sel.delete(k) : G.sel.add(k); b.setAttribute("aria-pressed", G.sel.has(k)); document.getElementById("validBtn").disabled = G.sel.size === 0; }
    else answer(k);
  });
  if (multi) document.getElementById("validBtn").onclick = () => answer([...G.sel]);
  if (!locked) { const f = game.querySelector(".ans"); if (f) f.focus({preventScroll:true}); }
}
function answer(k){
  const q = MODES[G.mode].bank()[G.qs[G.i]];
  const okSet = new Set(Array.isArray(q.ok) ? q.ok : [q.ok]);
  const picked = new Set(Array.isArray(k) ? k : [k]);
  const good = okSet.size === picked.size && [...okSet].every(x => picked.has(x));
  stopMedia();
  game.querySelectorAll(".ans").forEach(b => { b.disabled = true; const v = +b.dataset.k; if (okSet.has(v)) b.classList.add("good"); else if (picked.has(v)) b.classList.add("bad"); });
  const vb = document.getElementById("validBtn"); if (vb) vb.remove();
  const repTxt = [...okSet].map(i => q.r[i]).join(" · ");
  document.getElementById("fb").innerHTML = (good ? "Bonne réponse ! +100 points" : `Mauvaise réponse. ${okSet.size > 1 ? "Les bonnes réponses étaient" : "La bonne réponse était"} : ${esc(repTxt)}`)
    + (q.exp ? `<span class="exp">${esc(q.exp)}</span>` : "")
    + `<button class="btn btn-orange" id="nextBtn" style="margin-top:14px">${G.i < 2 ? "Question suivante" : "Voir mon résumé"}</button>`;
  G.res.push({q:q.q, good, rep:repTxt});
  const nb = document.getElementById("nextBtn"); nb.focus({preventScroll:true});
  nb.onclick = () => { G.i++; G.i < 3 ? showQ() : endRound(); };
}
function endRound(){
  const bonnes = G.res.filter(r => r.good).length; let pts, extra = "";
  const counts = G.daily && isLogged() && getAcc().last !== today();
  if (counts) {
    pts = 100 + bonnes * 100; const a = getAcc(); a.points += pts; a.jours++; a.bonnes += bonnes; a.last = today(); store.set("account", a);
    extra = `<p style="color:#C9DAF0; margin:-10px 0 20px">Dont 100 points pour la réception de ton quiz du jour.</p><div style="display:flex; gap:12px; flex-wrap:wrap"><a class="btn btn-orange" href="#/profil">Voir mon profil</a><button class="btn btn-ghost" id="modesBtn">Continuer à m'entraîner</button></div>`;
  } else {
    pts = bonnes * 100; const s = store.get("score", {total:0, manches:0}); s.total += pts; s.manches++; store.set("score", s);
    extra = `<div style="display:flex; gap:12px; flex-wrap:wrap"><button class="btn btn-orange" id="againBtn">Rejouer en ${MODES[G.mode].label}</button><button class="btn btn-ghost" id="modesBtn">Changer de mode</button>${isLogged() ? "" : `<a class="btn btn-ghost" href="#/play" data-scroll="abo">S'abonner pour que ça compte</a>`}</div>`;
  }
  const mode = G.mode;
  game.innerHTML = gameTop(MODES[mode].label) + `<h3>Résumé ${counts ? "de ton quiz du jour" : "de la manche"}</h3>
    <ul class="recap">${G.res.map(r => `<li>${r.good ? "✅" : "❌"} ${esc(r.q)}${r.good ? "" : ` <br><small style="color:#C9DAF0">Réponse : ${esc(r.rep)}</small>`}</li>`).join("")}</ul>
    <p style="font-weight:800; font-size:20px; margin:0 0 20px">+${pts} points</p>${extra}`;
  G = null;
  const again = document.getElementById("againBtn"); if (again) again.onclick = () => newRound(mode);
  const mb = document.getElementById("modesBtn"); if (mb) mb.onclick = gameStart;
  if (counts) refreshAccountUI();
}

/* ====== Reels ====== */
function renderReels(){
  const likes = store.get("likes", {});
  document.getElementById("reels").innerHTML = REELS.map((r, i) => { const liked = !!likes[i]; return `
    <div class="reel"><div class="reel-card" style="--g:${r.g}">
      ${r.video ? `<video src="${r.video}" loop muted playsinline preload="metadata"></video>` :
        `<div class="ph"><div><svg aria-hidden="true"><use href="#${r.icone}"/></svg><div class="t">${esc(r.titre)}</div></div></div>`}
      <div class="rail">
        <button class="${liked ? "liked" : ""}" data-like="${i}" aria-pressed="${liked}" aria-label="J'aime"><span class="c"><svg><use href="#i-heart"/></svg></span>${(r.likes || 0) + (liked ? 1 : 0)}</button>
        <button data-share="${i}" aria-label="Partager"><span class="c"><svg><use href="#i-share"/></svg></span>Partager</button>
      </div>
      <div class="reel-info"><b>${esc(r.auteur)}</b><p>${esc(r.texte)}</p><span class="hash">${esc(r.tag)}</span>
        ${r.cta ? `<br><button class="btn btn-orange" data-participate="${r.cta}">Participer au challenge</button>` : ""}</div>
    </div></div>`; }).join("");
}
document.getElementById("reels").addEventListener("click", async e => {
  const l = e.target.closest("[data-like]");
  if (l) { const likes = store.get("likes", {}); const i = l.dataset.like; likes[i] = !likes[i]; store.set("likes", likes); renderReels(); return; }
  const s = e.target.closest("[data-share]");
  if (s) { const r = REELS[s.dataset.share]; const data = {title:r.titre, text:r.texte + " " + r.tag};
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.text); s.lastChild.textContent = "Copié"; } } catch(err){} }
});
const reelsObs = new IntersectionObserver(es => es.forEach(e => { const v = e.target.querySelector("video"); if (v) e.isIntersecting ? v.play().catch(()=>{}) : v.pause(); }), {threshold:.6});
renderReels();
document.querySelectorAll(".reel").forEach(r => reelsObs.observe(r));

/* ====== Partenariat ====== */
document.getElementById("offers2").innerHTML = document.getElementById("offers").innerHTML.replaceAll('href="#partenariat"', 'href="#/partenariat" data-scroll="pform"');
document.getElementById("offers").innerHTML = document.getElementById("offers").innerHTML.replaceAll('href="#partenariat"', 'href="#/partenariat"');
document.getElementById("formuleSelect").innerHTML = OFFRES.map(o => `<option>${esc(o.titre)}</option>`).join("") + "<option>Autre / à définir ensemble</option>";
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
document.getElementById("partnerForm").onsubmit = (e => {
  e.preventDefault(); const f = e.target; const err = document.getElementById("partnerErr");
  if (!f.entreprise.value.trim() || !f.contact.value.trim() || !f.tel.value.trim()) { err.textContent = "Renseignez l'entreprise, le nom du contact et le téléphone."; return; }
  if (!emailOk(f.email.value)) { err.textContent = "L'adresse e-mail n'est pas valide. Vérifiez-la, par exemple nom@entreprise.ci."; f.email.focus(); return; }
  document.getElementById("partnerBox").innerHTML = `<div class="success"><div class="ok"><svg><use href="#i-check"/></svg></div>
    <h3 style="font-size:26px">Demande envoyée</h3><p style="color:var(--muted)">Merci ${esc(f.contact.value)}. L'équipe Moov Quiz reviendra vers ${esc(f.entreprise.value)} rapidement.</p></div>`;
});

/* ====== Candidature aux challenges ====== */
const mPart = document.getElementById("m-part"), partBodyHTML = document.getElementById("partBody").innerHTML;
function syncChallenge(){
  const v = document.getElementById("challengeSelect").value;
  document.getElementById("videoField").hidden = v !== "pub";
  document.getElementById("duelNote").hidden = v !== "duel";
}
function bindPartForm(){
  document.getElementById("challengeSelect").onchange = syncChallenge;
  document.getElementById("partForm").onsubmit = e => {
    e.preventDefault(); const f = e.target; const err = document.getElementById("partErr");
    const tel = f.tel.value.replace(/\D/g, "");
    if (!f.nom.value.trim() || !f.prenom.value.trim() || !f.ville.value.trim()) { err.textContent = "Renseigne ton nom, ton prénom et ta ville."; return; }
    if (tel.length !== 10) { err.textContent = "Ton numéro Moov doit comporter 10 chiffres."; f.tel.focus(); return; }
    if (!f.ok.checked) { err.textContent = "Coche la case pour accepter le règlement du challenge."; return; }
    const nomChallenge = f.challenge.value === "pub" ? "Moov Pub Star" : "Le Grand Duel";
    document.getElementById("partBody").innerHTML = `<div class="success"><div class="ok"><svg><use href="#i-check"/></svg></div>
      <h3 style="font-size:26px">Candidature envoyée</h3><p style="color:var(--muted)">Merci ${esc(f.prenom.value)} ! Ta candidature pour ${nomChallenge} est bien reçue. L'équipe Moov Quiz te contactera au numéro indiqué.</p>
      <button class="btn btn-blue" data-close>Fermer</button></div>`;
    document.querySelector("#partBody [data-close]").onclick = () => mPart.close();
  };
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-participate]"); if (!b) return;
  document.getElementById("partBody").innerHTML = partBodyHTML; bindPartForm();
  if (b.dataset.participate) document.getElementById("challengeSelect").value = b.dataset.participate;
  syncChallenge(); mPart.showModal();
});

/* ====== Navigation entre les pages ====== */
const header = document.getElementById("header");
const nav = document.getElementById("nav"), burger = document.getElementById("burger");
const onScroll = () => header.classList.toggle("solid", currentPage !== "home" || scrollY > 40);
addEventListener("scroll", onScroll, {passive:true});
let navPage = "home", navTarget = null;
function go(href){
  if (!href || href[0] !== "#") return;
  if (href.startsWith("#/")) { navPage = href.slice(2) || "home"; navTarget = null; }
  else { navPage = "home"; navTarget = href.length > 1 ? href.slice(1) : null; }
  try { history.replaceState(null, "", href); } catch(e) {}
  route();
}
function route(){
  let page = navPage; const target = navTarget;
  if (!document.querySelector(`.page[data-page="${page}"]`)) page = "home";
  currentPage = page;
  if (page !== "play") stopMedia();
  document.querySelectorAll("dialog[open]").forEach(d => d.close());
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("on", p.dataset.page === page));
  nav.querySelectorAll("a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#/" + (page === "home" ? "" : page)));
  try { if (page === "actualites") renderNewsPage(); } catch(e) { console.error(e); }
  try { if (page === "alertes") renderAlerts(); } catch(e) { console.error(e); }
  try { if (page === "profil") renderProfile(); } catch(e) { console.error(e); }
  document.querySelector("footer").hidden = page === "reels";
  const t = target && document.getElementById(target);
  if (t) t.scrollIntoView(); else scrollTo(0, 0);
  if (page === "reels") document.getElementById("reels").focus({preventScroll:true});
  onScroll();
}
/* Tous les liens internes passent par go() : aucune navigation réelle du navigateur */
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  e.preventDefault();
  const href = a.getAttribute("href"), scrollId = a.dataset.scroll;
  if (scrollId) {
    const samePage = href.startsWith("#/") ? (href.slice(2) || "home") === currentPage : currentPage === "home";
    if (!samePage) go(href);
    const el = document.getElementById(scrollId); if (el) el.scrollIntoView({behavior: reduce ? "auto" : "smooth"});
    return;
  }
  go(href);
});

/* Formulaires gérés par la page (l'envoi natif peut être bloqué par l'afficheur) */
function submitForm(f){ if (typeof f.onsubmit === "function") f.onsubmit({preventDefault(){}, target:f}); }
document.addEventListener("click", e => {
  const b = e.target.closest('form button[type="submit"]'); if (!b) return;
  e.preventDefault(); submitForm(b.form);
});
document.addEventListener("keydown", e => {
  if (e.key !== "Enter" || e.target.tagName !== "INPUT" || e.target.type === "checkbox") return;
  const f = e.target.form; if (!f) return; e.preventDefault(); submitForm(f);
});
burger.addEventListener("click", () => { const o = nav.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", false); }));
updateBadge();
refreshAccountUI();
gameStart();
go(location.hash && location.hash.length > 1 ? location.hash : "#/");

