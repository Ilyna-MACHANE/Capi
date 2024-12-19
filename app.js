/**
 * @file app.js
 * @brief Fichier principal pour l'application Planning Poker.
 * @details Ce fichier contient toutes les fonctions principales pour gérer les votes, les joueurs et les tâches.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Éléments HTML
    const btnDemarrer = document.getElementById('demarrerJeu');
    const sectionJeu = document.getElementById('jeu');
    const sectionMenu = document.getElementById('menu');
    const inputNbJoueurs = document.getElementById('nbJoueurs');
    const zoneNomsJoueurs = document.getElementById('zoneNomsJoueurs');
    const btnValiderJoueurs = document.getElementById('validerJoueurs');
    const cartes = document.querySelectorAll('.carte');
    const btnValiderVote = document.getElementById('validerVote');
    const resultatVote = document.getElementById('resultatVote');
    const btnSuivant = document.getElementById('recommencerTour');
    const btnNouvellePartie = document.getElementById('nouvellePartie');
    const btnChargerBacklog = document.getElementById('chargerBacklog');
    const backlogFileInput = document.getElementById("backlogFile");
    const missionActuelle = document.getElementById("missionActuelle");
    const btnTelechargerResultats = document.getElementById('telechargerResultats');
    const btnReprendrePartie = document.getElementById('reprendrePartie');
    const fichierProgressionInput = document.getElementById('fichierProgression');
    const btnActiverBoutons = document.getElementById('activerBoutons');
    
  

    // Variables globales
    let joueurs = [];
    let votesJoueurs = {};
    let joueurActuelIndex = 0;
    let modeJeu = 'moyenne';
    let tour = 1;

    let backlog = [];
    let backlogIndex = 0;
    let resultatFinal = [];


    btnValiderJoueurs.disabled = true;
    btnChargerBacklog.disabled = true;


/**
 * @brief Active ou désactive certains boutons de l'interface utilisateur.
 * @details
 * - Active les boutons suivants :
 *   - "Valider Joueurs"
 *   - "Charger Backlog"
 * - Désactive les boutons suivants :
 *   - "Reprendre une Partie"
 *   - "Activer Boutons"
 */
    btnActiverBoutons.addEventListener('click', () => {
        btnValiderJoueurs.disabled = false; // Active le bouton "Valider Joueurs"
        btnChargerBacklog.disabled = false; // Active le bouton "Charger Backlog"
        btnReprendrePartie.disabled = true; 
        btnActiverBoutons.disabled = true; 
    });
    

/**
 * @brief Ouvre un sélecteur de fichier JSON pour reprendre une partie sauvegardée.
 * @details
 * ouvre une boîte de dialogue pour choisir un fichier JSON contenant une progression.
 */
    btnReprendrePartie.addEventListener('click', () => {
        fichierProgressionInput.click();
    });
    

/**
 * @brief Charge la progression sauvegardée depuis un fichier JSON.
 * @details
 * S'execute lors de la élection d'un fichier via `fichierProgressionInput`.
 * Elle effectue les actions suivantes :
 * - Lit le fichier JSON sélectionné.
 * - Vérifie le contenu du fichier.
 * - Recharge les données sauvegardées dans les variables globales :
 *   - `joueurs` : Liste des joueurs.
 *   - `votesJoueurs` : Votes enregistrés.
 *   - `backlog` : Liste des tâches.
 *   - `backlogIndex` : Indice de la tâche actuelle.
 *   - `modeJeu` : Mode de jeu sélectionné.
 * - Met à jour l'interface utilisateur pour reprendre la partie là où elle a été arrêtée.
 */
    fichierProgressionInput.addEventListener('change', (event) => {
        const fichier = event.target.files[0];
        if (!fichier) return;
    
        const reader = new FileReader();
        reader.onload = ({ target }) => {
            try {
                const progression = JSON.parse(target.result);
    
                // Recharge les données de la partie
                joueurs = progression.joueurs;
                votesJoueurs = progression.votesJoueurs;
                backlog = progression.backlog;
                backlogIndex = progression.backlogIndex;
                modeJeu = progression.modeJeu;
    
                // Affiche la mission actuelle
                sectionMenu.style.display = 'none';
                sectionJeu.style.display = 'block';
                afficherMissionActuelle();
                resultatVote.innerHTML = `${joueurs[joueurActuelIndex]}, c'est à vous de voter.`;
                btnValiderVote.disabled = true;
    
                alert("Progression chargée avec succès !");
            } catch (error) {
                console.error("Erreur lors du chargement de la progression :", error);
                alert("Fichier de progression invalide."); 
        }};
        reader.readAsText(fichier);
    });
    

/**
 * @brief Affiche la mission actuelle à partir du backlog.
 * @details
 * Cette fonction gère l'affichage de la tâche actuelle :
 * - Si des missions restent à traiter :
 *   - Affiche la description de la mission actuelle.
 *   - Active le bouton "Valider Vote" pour permettre aux joueurs de voter.
 * - Si toutes les missions sont terminées :
 *   - Affiche un message indiquant la fin des missions.
 *   - Appelle `afficherFinDePartie()` pour gérer la fin des tâches.
 */
  function afficherMissionActuelle() {
    if (backlogIndex < backlog.length) {
        const mission = backlog[backlogIndex];
        missionActuelle.innerHTML = `
            <p><strong>Tache :</strong> ${mission.feature}</p>
        `;
        btnValiderVote.disabled = false;
    } else {
        missionActuelle.innerHTML = "<p>Toutes les missions sont terminées.</p>";
        afficherFinDePartie();
    }
}


/**
 * @brief Configure l'interface pour saisir les pseudos des joueurs.
 * @details
 * S'execute lorsque l'on clique sur ValiderJoueur :
 * - Récupère la valeur du nombre de joueurs saisi.
 * - Valide que la valeur est un nombre entier supérieur ou égal à 2.
 * - Si la validation réussit :
 *   - Vide la zone contenant les champs de pseudos.
 *   - Crée dynamiquement un champ d'entrée pour chaque joueur.
 *   - Affiche la zone de saisie des pseudos et le bouton "Démarrer".
 * });
 */
    btnValiderJoueurs.addEventListener('click', () => {
        const nbJoueurs = parseInt(inputNbJoueurs.value);

        if (!isNaN(nbJoueurs) && nbJoueurs >= 2) {  //Changement v2
            zoneNomsJoueurs.innerHTML = '';
            for (let i = 0; i < nbJoueurs; i++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Pseudo joueur ${i + 1}`;
                input.classList.add('inputPseudo');
                zoneNomsJoueurs.appendChild(input);
            }
            zoneNomsJoueurs.style.display = 'block';
            btnDemarrer.style.display = 'inline-block';
        } else {
            alert("Veuillez entrer un nombre valide de joueurs (au moins 2) !");
        }
    });


    /**
 * @brief Initialisation d'une nouvelle partie.
 * @details
 * Cette fonction est exécutée lorsqu'un utilisateur clique sur le bouton "Démarrer".
 * - Récupère les pseudos des joueurs à partir des champs d'entrée.
 * - Récupère le mode de jeu sélectionné dans la liste déroulante.
 * - Valide que :
 *   - Au moins deux joueurs sont enregistrés.
 *   - Un backlog a été chargé.
 * - Si les conditions ne sont pas remplies, affiche un message d'erreur.
 */
    btnDemarrer.addEventListener('click', () => {
        const inputsNoms = document.querySelectorAll('.inputPseudo');
        joueurs = Array.from(inputsNoms).map(input => input.value.trim()).filter(nom => nom);

        modeJeu = document.getElementById('modeJeu').value;

        if (joueurs.length >= 2 && backlog.length > 0) { //Cnagement
            joueurActuelIndex = 0;
            votesJoueurs = {};
            tour = 1;

            sectionMenu.style.display = 'none';
            sectionJeu.style.display = 'block';
            resultatVote.innerHTML = `${joueurs[joueurActuelIndex]}, c'est à vous de voter.`;
            btnValiderVote.disabled = false;
            afficherMissionActuelle();
        } else {
            alert("Veuillez entrer tous les pseudos et charger un backlog !");
        }
    });


/**
 * @brief Gère le chargement d'un fichier JSON pour le backlog.
 * @details
 * Cette fonction est exécutée lorsqu'un utilisateur clique sur le bouton "Charger Backlog".
 * Elle effectue les actions suivantes :
 * - Vérifie si un fichier a été sélectionné.
 * - Lit le fichier JSON en utilisant un `FileReader`.
 * - Valide que le contenu du fichier est un tableau non vide.
 * - Met à jour la variable globale `backlog` avec les données du fichier.
 * - Affiche des messages d'erreur ou de succès selon le cas.
 * @throws {Error} Si le fichier JSON est vide ou mal formaté.
 */
    btnChargerBacklog.addEventListener("click", () => {
        const backlogFile = backlogFileInput.files[0];
        if (!backlogFile) {
            alert("Veuillez sélectionner un fichier JSON.");
            console.error("Aucun fichier sélectionné.");
            return;
        }
        const reader = new FileReader();
        reader.onload = ({ target }) => {
            try {
                const data = JSON.parse(target.result);
                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error("Le fichier JSON est vide ou mal formaté.");
                }
                backlog = data;
                alert("Backlog chargé avec succès !");
            } catch (error) {
                console.error("Erreur lors du chargement du fichier JSON :", error);
                alert(error.message);
            }
        };
        reader.readAsText(backlogFile);
    });


/**
 * @brief Gère la sélection des cartes pour voter.
 * @details
 * Cette fonction permet de :
 * - Sélectionner une carte et appliquer un style visuel.
 * - Enregistrer le vote correspondant à la carte sélectionnée :
 *   - Si la **Carte Café** est sélectionnée :
 *     - Enregistre "café" comme vote pour le joueur actuel.
 *     - Vérifie si tous les joueurs ont voté pour la pause café :
 *       - Si oui, enregistre la tâche actuelle avec la note "café".
 *       - Met la partie en pause en appelant `demanderPause()`.
 * - Pour les cartes numérotées, extrait et enregistre la valeur de la carte.
 * - Active le bouton "Valider Vote".
 */
    cartes.forEach(carte => {
        carte.addEventListener('click', () => {
        cartes.forEach(c => c.classList.remove('selectionnee'));
        carte.classList.add('selectionnee');

            if (carte.alt === "Carte Café") {
                votesJoueurs[joueurs[joueurActuelIndex]] = "café";
                if (Object.values(votesJoueurs).every(v => v === "café") && Object.keys(votesJoueurs).length === joueurs.length) {
                    // Enregistrer la tâche et les votes actuels
                    resultatFinal.push({
                        tache: backlog[backlogIndex]?.feature || "Tâche inconnue",
                        note: "café", // Spécifie que c'est une pause pour la tâche
                    });
                    demanderPause(); // Mettre en pause
                }
            } else {
                votesJoueurs[joueurs[joueurActuelIndex]] = parseFloat(carte.alt.split(' ')[1]);
            }
            btnValiderVote.disabled = false; // Activer le bouton de vote
        });
    });
    

/**
 * @brief Bouton "Valider Vote".
 * @details
 * Lorsque l'on clique sur le bouton valider le vote :
 * - Vérifie si le joueur actuel a soumis un vote valide.
 *   - Si aucun vote n'est trouvé, affiche un message d'erreur.
 * - Si le vote est valide :
 *   - Passe au joueur suivant en incrémentant `joueurActuelIndex`.
 *   - Si tous les joueurs ont voté :
 *     - Traite les votes en fonction du mode de jeu :
 *       - **Mode "strict"** : Appelle `gererUnanimite()` pour vérifier l'unanimité.
 *       - **Mode "moyenne"** : Appelle `gererMoyenne()` pour calculer la moyenne.
 */
    btnValiderVote.addEventListener('click', () => {
        if (votesJoueurs[joueurs[joueurActuelIndex]] !== undefined) {
            joueurActuelIndex++;
            if (joueurActuelIndex >= joueurs.length) {
                if (modeJeu === 'strict') {
                    gererUnanimite();
                } else if (modeJeu === 'moyenne') {
                    gererMoyenne();
                }
            } else {
                resultatVote.innerHTML = `${joueurs[joueurActuelIndex]}, c'est à vous de voter.`;
            }
        } else {
            resultatVote.innerHTML = "Vous devez sélectionner une carte avant de voter.";
        }
    });


/**
 * @brief Gère le mode "Unanimité" pour les votes.
 * @details
 * Cette fonction traite les votes des joueurs dans le mode "unanimité".
 * - Si les votes diffèrent (pas d'unanimité) :
 *   - Identifie les joueurs ayant voté les valeurs minimum et maximum.
 *   - Affiche un message invitant à discuter.
 *   - Lance un minuteur de 30 secondes pour permettre une discussion.
 * - Si tous les votes sont identiques (unanimité) :
 *   - Enregistre la tâche actuelle et la note unanime dans les résultats finaux.
 *   - Affiche un message indiquant l'unanimité.
 *   - Passe à la gestion de fin de partie via `afficherFinDePartie()`.
 */
function gererUnanimite() {
    const votes = Object.values(votesJoueurs);
    const minVote = Math.min(...votes);
    const maxVote = Math.max(...votes);

    // Cas où il n'y a pas unanimité
    if (minVote !== maxVote) {
        // Trouver les joueurs ayant voté min et max
        const joueurMin = obtenirJoueurParVote(votesJoueurs, minVote);
        const joueurMax = obtenirJoueurParVote(votesJoueurs, maxVote);

        if (joueurMin && joueurMax) {
            resultatVote.innerHTML = `<p>${joueurMin} (min) et ${joueurMax} (max), discutez et revotez !</p>`;
        }

        // Démarrer un minuteur de 30 secondes pour redémarrer le vote
        demarrerMinuteur(30, () => {
            joueurActuelIndex = 0; // Réinitialise l'index des joueurs
            votesJoueurs = {}; // Réinitialise les votes
            resultatVote.innerHTML = `C'est au tour de ${joueurs[joueurActuelIndex]} de voter.`;
        });
    } 
    // Cas où il y a unanimité
    else {
        const unanimite = minVote;
        resultatFinal.push({
            tache: backlog[backlogIndex].feature,
            note: unanimite
        });

        resultatVote.innerHTML = `<p>Tous les joueurs sont d'accord : ${unanimite}.</p>`;
        afficherFinDePartie();
    }
}


/**
 * @brief Gère le mode de jeu basé sur la moyenne des votes.
 * @details
 * Cette fonction est utilisée pour gérer le mode "moyenne" du jeu. Elle se déroule en deux étapes :
 * 
 * - **Premier tour :**
 *   - Calcule le vote minimum et maximum parmi les votes des joueurs.
 *   - Identifie les joueurs ayant donné ces votes.
 *   - Affiche un message invitant les joueurs à discuter avant le deuxième tour.
 *   - Démarre un minuteur de 30 secondes après lequel :
 *     - Le jeu passe au deuxième tour.
 *     - Les votes sont réinitialisés.
 *     - L'indice du joueur actuel est réinitialisé.
 * 
 * - **Deuxième tour :**
 *   - Calcule la moyenne des votes donnés par les joueurs.
 *   - Enregistre cette moyenne avec la tâche actuelle dans `resultatFinal`.
 *   - Affiche la moyenne des votes et appelle `afficherFinDePartie()` pour conclure.
 */
function gererMoyenne() {
    if (tour === 1) {
        const votes = Object.values(votesJoueurs);
        const minVote = Math.min(...votes);
        const maxVote = Math.max(...votes);
        const joueurMin = obtenirJoueurParVote(votesJoueurs, minVote);
        const joueurMax = obtenirJoueurParVote(votesJoueurs, maxVote);

        resultatVote.innerHTML = `<p>${joueurMin} (min) et ${joueurMax} (max), discutez avant le 2e tour.</p>`;
        tour = 2;
        joueurActuelIndex = 0;
        votesJoueurs = {};
        
        // Démarre un minuteur de 30 secondes
        demarrerMinuteur(30, () => {
            tour = 2; // Passe au 2e tour
            joueurActuelIndex = 0;
            votesJoueurs = {};
        });
    } else if (tour === 2) {
        const votes = Object.values(votesJoueurs);
        const moyenne = (votes.reduce((somme, vote) => somme + vote, 0) / votes.length).toFixed(2);

        resultatVote.innerHTML = `<p>La moyenne des votes est : ${moyenne}.</p>`;
        afficherFinDePartie();
    }
}


/**
* @brief Obtient le nom du joueur par son vote.
* @param vote Vote du joueur.
* @return Le pseudo du joueur ayant effectué ce vote.
 */
function obtenirJoueurParVote(votesJoueurs, voteRecherche) {
    for (const [joueur, vote] of Object.entries(votesJoueurs)) {
        if (vote === voteRecherche) {
            return joueur;
        }
    }
    return null;
}

/**
 * @brief Gère un minuteur pendant lequel les joueurs discutent.
 * @param {number} duree - La durée du minuteur en secondes.
 * @param {Function} callback - Fonction à exécuter une fois le minuteur écoulé.
 */
    function demarrerMinuteur(duree, callback) {
        const resultatVote = document.getElementById('resultatVote');
        const btnValiderVote = document.getElementById('validerVote');
        let tempsRestant = duree;

    // Bloque le bouton de vote
        btnValiderVote.disabled = true;

    // Met à jour le texte pour afficher le temps restant
     const interval = setInterval(() => {
        resultatVote.innerHTML = `Discussion en cours... ${tempsRestant} secondes restantes.`;
        tempsRestant--;

        if (tempsRestant < 0) {
            clearInterval(interval);
            resultatVote.innerHTML = `Temps écoulé ! Vous pouvez voter.`;
            
            // Réactive le bouton de vote
            btnValiderVote.disabled = false;

            // Exécute le callback si défini
            if (typeof callback === 'function') {
                callback();
            }
        }
            }, 1000); // Exécute toutes les secondes
                                        }
 


/**
 * @brief Passe à la tâche suivante. 
 * @details
 * Gèrer la progression à travers les tâches du backlog.
 * - Incrémente l'indice du backlog (`backlogIndex`).
 * - Réinitialise les données nécessaires pour la nouvelle tâche :
 *   - Efface les votes des joueurs.
 *   - Réinitialise l'indice du joueur actuel et le compteur de tours.
 * - Met à jour l'interface a jour pour une nouvelle tache.
 * Si toutes les tâches ont été complétées, la fonction :
 * - Affiche un message indiquant la fin des missions.
 * - Appelle `afficherFinDePartie()`.
 */
    function afficherTacheSuivante() {
    
        backlogIndex++; 
        if (backlogIndex < backlog.length) {
            const mission = backlog[backlogIndex];
    
            votesJoueurs = {}; 
            joueurActuelIndex = 0; 
            tour = 1; 
    
            cartes.forEach(carte => carte.classList.remove('selectionnee'));
            missionActuelle.innerHTML = `
                <p><strong>Mission :</strong> ${mission.feature}</p>
            `;
            resultatVote.innerHTML = `
                <p>${joueurs[joueurActuelIndex]}, c'est à vous de voter.</p>
            `;
            btnValiderVote.disabled = true; 
        } else {
            missionActuelle.innerHTML = "<p>Toutes les missions sont terminées.</p>";
            afficherFinDePartie();
        }
    }
    

/**
 * @brief Gestionnaire d'événement pour le bouton "Suivant".
 * @details
 * - Passe à la tâche suivante en appelant `afficherTacheSuivante()`.
 * - Recharge les informations de la tâche actuelle via `afficherMissionActuelle()`.
 * Ce gestionnaire est utilisé pour naviguer entre les différentes tâches
 */
    btnSuivant.addEventListener("click", () => {
        
            afficherTacheSuivante(); // Passe à la tâche suivante
            afficherMissionActuelle(); // Réinitialise sur la tâche actuelle
    });
    

/**
 * @brief fin de la partie.
 * @details
 * Est utilisé quand la partie est terminée :
 * - Désactive le bouton "Valider Vote" pour empêcher tout nouveau vote.
 * - Affiche les boutons "Suivant" et "Nouvelle Partie".
 * - Si toutes les missions sont terminées, désactive le bouton "Suivant".
 * - Affiche le bouton "Télécharger Résultats" pour permettre de sauvegarder les résultats finaux.
 */
    function afficherFinDePartie() {
        
        btnValiderVote.disabled = true;
        btnSuivant.style.display = "block";
        btnNouvellePartie.style.display = "block";
        if (missionActuelle.innerHTML === "<p>Toutes les missions sont terminées.</p>") {
            btnSuivant.disabled = true; // Active le bouton
            const btnTelecharger = document.getElementById("telechargerResultats");
            btnTelecharger.style.display = "block";
            btnTelecharger.addEventListener("click", sauvegarderResultats); // Ajouter l'événement ici
        }   
       
    }
    


    btnTelechargerResultats.addEventListener("click", sauvegarderResultats);



/**
 * @brief Réinitialise le jeu pour démarrer une nouvelle partie.
 * @details 
 * Cette fonction s'est exécutée lorsqu'on clique sur le bouton "Nouvelle Partie".
 * - Affiche le menu principal
 * - Réinitialise les données du jeu : votes, joueurs et indices.
 * - Réinitialise les éléments visuels comme les champs de saisie des joueurs.
 */
    // Gestion du bouton "Nouvelle Partie"
    btnNouvellePartie.addEventListener('click', () => {
        sectionMenu.style.display = 'block';
        sectionJeu.style.display = 'none';
        // Réinitialisation des données du jeu
        votesJoueurs = {};
        joueurs = [];
        joueurActuelIndex = 0;
        // Réinitialisation des éléments visuels
        zoneNomsJoueurs.innerHTML = '';
        zoneNomsJoueurs.style.display = 'none';
        btnDemarrer.style.display = 'none';
        // Mise à jour de l'état des boutons
        [btnValiderJoueurs, btnChargerBacklog].forEach(btn => btn.disabled = true);
        [btnActiverBoutons, btnReprendrePartie].forEach(btn => btn.disabled = false);
    });


/**
 * @brief Sauvegarde les résultats finaux dans un fichier JSON.
 * @details
 * Les étapes sont les suivantes :
 * - Créer et convertir les données importantes en chaîne JSON formatée.
 * - Créer un fichier (Blob) contenant les données JSON.
 * - Déclencher automatiquement le téléchargement.
 * @note Le fichier est nommé "resultat_final.json".
 */
    function sauvegarderResultats() {
        const dataStr = JSON.stringify(resultatFinal, null, 2); // Convertit le tableau en JSON formaté
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
    
        const a = document.createElement("a");
        a.href = url;
        a.download = "resultat_final.json"; // Nom du fichier téléchargé
        a.click();
        URL.revokeObjectURL(url); // Nettoie l'URL temporaire
    }


/**
 * @brief Met la partie en pause si tous les joueurs ont sélectionné la carte café.
 * @details
 * - Demande une confirmation pour mettre la reunions en pause.
 * - Lance la sauvagrde pour la progression si confirmé.
 * - Avertir les utilisateurs qu'un fichier JSON est téléchargé.
 */
    function demanderPause() {
        const confirmation = confirm("Tous les joueurs ont sélectionné la carte café. Voulez-vous mettre la partie en pause ?");
        if (confirmation) {
            sauvegarderProgression(); // Sauvegarde la progression actuelle
            alert("Partie mise en pause. Téléchargez le fichier JSON pour reprendre plus tard.");
        }
    }


/**
 * @brief Pour la carte Cafe : permet de sauvegarder la progression dans un fichier JSON.
 * @details
 * Les étapes sont les suivantes :
 * - Créer et convertir les données importantes en chaîne JSON formatée.
 * - Créer un fichier (Blob) contenant les données JSON.
 * - Déclencher automatiquement le téléchargement.
 * @note Le fichier JSON téléchargé est nommé "progression.json".
 */
    function sauvegarderProgression() {
        const progression = {
            joueurs,
            votesJoueurs,
            backlog,
            backlogIndex,
            modeJeu,
            tacheActuelle: backlog[backlogIndex]?.feature || null,
            notesJouees: resultatFinal,
        };
        const blob = new Blob([JSON.stringify(progression, null, 2)], { type: "application/json" });
        const a = Object.assign(document.createElement("a"), {
            href: URL.createObjectURL(blob),
            download: "progression.json",
        });
        a.click();
        URL.revokeObjectURL(a.href); // Libère l'URL temporaire
    }
});