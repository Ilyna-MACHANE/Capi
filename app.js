/**
 * @file jeu.js
 * @brief Gestionnaire du jeu basé sur les votes.
 * @details Ce script configure et gère les différentes étapes d'un jeu interactif
 *          où les joueurs votent et les résultats sont calculés selon le mode choisi.
 *          Il inclut la gestion des joueurs, des votes, et des conditions de fin de partie.
 */

/**
 * @brief Initialisation du jeu après chargement du DOM.
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
    const btnRecommencer = document.getElementById('recommencerTour');
    const btnNouvellePartie = document.getElementById('nouvellePartie');

    // Variables globales
    let joueurs = []; /**< @brief Liste des pseudos des joueurs. */
    let votesJoueurs = {}; /**< @brief Votes des joueurs (clé : pseudo, valeur : vote). */
    let joueurActuelIndex = 0; /**< @brief Index du joueur en cours de jeu. */
    let modeJeu = 'moyenne'; /**< @brief Mode de jeu sélectionné (moyenne ou unanimité). */
    let tour = 1; /**< @brief Compteur du nombre de tours (utile pour le mode moyenne). */

    /**
     * @brief Gère la validation du nombre de joueurs et affiche les champs de saisie.
     */
    btnValiderJoueurs.addEventListener('click', () => {
        const nbJoueurs = parseInt(inputNbJoueurs.value);
        if (nbJoueurs >= 2) {
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
     * @brief Démarre le jeu avec les noms des joueurs et le mode de jeu sélectionné.
     */
    btnDemarrer.addEventListener('click', () => {
        const inputsNoms = document.querySelectorAll('.inputPseudo');
        joueurs = Array.from(inputsNoms).map(input => input.value.trim()).filter(nom => nom);

        modeJeu = document.getElementById('modeJeu').value;

        if (joueurs.length >= 2) {
            joueurActuelIndex = 0;
            votesJoueurs = {};
            tour = 1;

            sectionMenu.style.display = 'none';
            sectionJeu.style.display = 'block';
            resultatVote.innerHTML = `${joueurs[joueurActuelIndex]}, c'est à vous de voter.`;
            btnValiderVote.disabled = false;
        } else {
            alert("Veuillez entrer tous les pseudos !");
        }
    });

    /**
     * @brief Gère la sélection d'une carte par un joueur.
     */
    cartes.forEach(carte => {
        carte.addEventListener('click', () => {
            cartes.forEach(c => c.classList.remove('selectionnee'));
            carte.classList.add('selectionnee');
            votesJoueurs[joueurs[joueurActuelIndex]] = parseFloat(carte.alt.split(' ')[1]);
            btnValiderVote.disabled = false;
        });
    });

    /**
     * @brief Valide le vote d'un joueur et passe au joueur suivant ou au traitement des votes.
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
     * @brief Gère le mode unanimité.
     */
    function gererUnanimite() {
        const votes = Object.values(votesJoueurs);
        const minVote = Math.min(...votes);
        const maxVote = Math.max(...votes);
    
        if (minVote !== maxVote) {
            const joueurMin = obtenirJoueurParVote(votesJoueurs, minVote);
            const joueurMax = obtenirJoueurParVote(votesJoueurs, maxVote);
    
            resultatVote.innerHTML = `<p>${joueurMin} (min) et ${joueurMax} (max), discutez !</p>`;
            
            // Démarre un minuteur de 30 secondes
            demarrerMinuteur(30, () => {
                joueurActuelIndex = 0; // Réinitialise pour le prochain vote
                votesJoueurs = {}; // Réinitialise les votes
            });
        } else {
            resultatVote.innerHTML = `<p>Tous les joueurs sont d'accord : ${minVote}.</p>`;
            afficherFinDePartie();
        }
    }
    

    /**
     * @brief Gère le mode moyenne.
     */
    function gererMoyenne() {
        if (tour === 1) {
            const votes = Object.values(votesJoueurs);
            const minVote = Math.min(...votes);
            const maxVote = Math.max(...votes);
    
            const joueurMin = obtenirJoueurParVote(votesJoueurs, minVote);
            const joueurMax = obtenirJoueurParVote(votesJoueurs, maxVote);
    
            resultatVote.innerHTML = `<p>${joueurMin} (min) et ${joueurMax} (max), discutez avant le 2e tour.</p>`;
            
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
    function obtenirJoueurParVote(vote) {
        return Object.keys(votesJoueurs).find(joueur => votesJoueurs[joueur] === vote);
    }

    /**
     * @brief Affiche les boutons de fin de partie.
     */
    function afficherFinDePartie() {
        btnValiderVote.disabled = true;
        btnRecommencer.style.display = 'block';
        btnNouvellePartie.style.display = 'block';
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
     * @brief Redémarre le tour actuel.
     */
    btnRecommencer.addEventListener('click', () => {
        joueurActuelIndex = 0;
        votesJoueurs = {};
        resultatVote.innerHTML = `${joueurs[joueurActuelIndex]}, c'est à vous de voter.`;
        btnRecommencer.style.display = 'none';
        btnNouvellePartie.style.display = 'none';
        btnValiderVote.disabled = false;
    });

    /**
     * @brief Réinitialise le jeu pour une nouvelle partie.
     */
    btnNouvellePartie.addEventListener('click', () => {
        sectionMenu.style.display = 'block';
        sectionJeu.style.display = 'none';
        votesJoueurs = {};
        joueurs = [];
        joueurActuelIndex = 0;
        zoneNomsJoueurs.innerHTML = '';
        zoneNomsJoueurs.style.display = 'none';
        btnDemarrer.style.display = 'none';
    });
});
