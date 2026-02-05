# RUNLINE - Textes du Questionnaire & Pages d'inscription

> Ce document contient **tous les textes visibles** dans l'application RUNLINE (questionnaire, inscription, paiement).
> Modifiez directement le texte dans la colonne **"Texte actuel"** ou ajoutez votre version dans **"Nouveau texte"**.

---

## Navigation / Boutons globaux

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Bouton continuer | Continuer | |
| Bouton retour | Retour | |
| Bouton terminer (step 9) | Terminer | |
| Bouton suivant (step 3b-goal) | Suivant | |

---

## ETAPE 1 - Objectif principal

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Titre | Quel est votre **objectif principal** ? | |
| Option 1 | Commencer la course | |
| Option 2 | Reprendre la course | |
| Option 3 | Preparer une course | |
| Option 4 | Autre | |
| Placeholder "Autre" | Precisez votre objectif... | |

---

## ETAPE 2 - Informations personnelles

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Titre | Parlez-nous de **vous** | |
| Label email | Email | |
| Placeholder email | votre@email.com | |
| Label nom | Nom Prenom | |
| Placeholder nom | Jean Dupont | |
| Label sexe | Sexe | |
| Option homme | Homme | |
| Option femme | Femme | |
| Label age | Votre age | |

---

## ETAPE 3 - Poids / Taille

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Titre | Votre **morphologie** | |
| Sous-titre | Ces informations nous aident a personnaliser votre plan d'entrainement. | |
| Label poids | POIDS (KG) | |
| Label taille | TAILLE (CM) | |

> Apres cette etape, le parcours se divise selon l'objectif choisi :
> - **"Commencer"** ou **"Autre"** -> va directement a l'Etape 4
> - **"Reprendre"** -> va a l'Etape 3a
> - **"Preparer une course"** -> va a l'Etape 3b-goal puis 3b

---

## ETAPE 3a - Reprise (conditionnel : objectif = "Reprendre")

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Titre | Depuis combien de temps **avez-vous arrete** ? | |
| Sous-titre | Cela nous aide a adapter votre reprise en douceur. | |
| Label records | Record(s) personnel(s) **(Optionnel)** | |
| Sous-texte records | Ex: 5km en 25min, 10km en 55min, Semi en 2h... | |
| Placeholder records | Vos meilleurs temps... | |

> Le selecteur de duree de pause contient : 1-4 semaines, 1-11 mois, 1-10 ans, + de 10 ans

---

## ETAPE 3b-goal - Details de l'objectif (conditionnel : objectif = "Preparer une course")

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Titre | Details de **votre objectif** | |
| Sous-titre | Personnalisez votre plan pour votre prochaine course. | |
| Label distance | Quelle distance preparez-vous ? | |
| Option 5km | 5 km | |
| Option 10km | 10 km | |
| Option semi | Semi | |
| Option marathon | Marathon | |
| Option autre | Autre distance | |
| Label picker autre | CHOISIR LA DISTANCE (KM) | |
| Label date | Date de la course | |
| Placeholder date | Choisir une date | |
| Indication date | Nous calculerons votre plan a partir de cette date. | |
| Bouton annuler (date picker iOS) | Annuler | |
| Bouton OK (date picker iOS) | OK | |

---

## ETAPE 3b - Objectifs de course (conditionnel : objectif = "Preparer une course")

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Pre-label | PREPARER | |
| Titre | Vos **objectifs de course** | |
| Sous-titre | Partagez-nous vos objectifs pour creer un plan adapte. | |
| Label objectifs | Objectif(s) intermediaire(s) **(Optionnel)** | |
| Sous-texte objectifs | Distance(s) et date(s) a preciser | |
| Placeholder objectifs | Ex: 10km en mars, Semi-marathon en mai... | |
| Label records | Record(s) personnel(s) **(Optionnel)** | |
| Sous-texte records | Preciser la distance | |
| Placeholder records | Ex: 5km en 25min, 10km en 55min, Semi en 2h... | |

---

## ETAPE 4 - Frequence de course

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Titre | Votre **frequence** de course | |
| Sous-titre | Combien de fois courez-vous par semaine ? Ces informations nous aident a adapter votre programme. | |
| Option 1 | Un peu | |
| Sous-texte option 1 | 1-2 fois par semaine | |
| Option 2 | Beaucoup | |
| Sous-texte option 2 | 3-4 fois par semaine | |
| Option 3 | Passionnement | |
| Sous-texte option 3 | 5-6 fois par semaine | |
| Option 4 | A la folie | |
| Sous-texte option 4 | 7+ fois par semaine | |
| Option 5 | Pas du tout | |
| Sous-texte option 5 | 0 - Je debute | |

---

## ETAPE 5 - Volume hebdomadaire

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Titre | Votre **volume hebdomadaire** | |
| Sous-titre | Cela nous aide a adapter l'intensite de votre programme. | |
| Question 1 | Combien de kilometres avez-vous fait la semaine derniere ? | |
| Question 2 | Quel est votre volume hebdomadaire classique ? | |

> Selecteur : 0 km, 5 km, 10 km ... 30 km, 40 km ... 150 km, 150+ km

---

## ETAPE 6 - Experience de course

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Titre | Depuis combien de temps **courez-vous regulierement** ? | |
| Sous-titre | Cela nous aide a adapter la progression de votre programme. | |

> Selecteur : Je commence, 1 mois ... 11 mois, 1 an ... 10 ans, + de 10 ans

---

## ETAPE 7 - Jours disponibles

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Titre | Vos **jours disponibles** | |
| Sous-titre | Selectionnez tous les jours ou vous pouvez vous entrainer. | |
| Lundi | Lundi | |
| Mardi | Mardi | |
| Mercredi | Mercredi | |
| Jeudi | Jeudi | |
| Vendredi | Vendredi | |
| Samedi | Samedi | |
| Dimanche | Dimanche | |

---

## ETAPE 8 - Lieux d'entrainement

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Titre | Vos **lieux de pratique** | |
| Sous-titre | Selectionnez tous les terrains sur lesquels vous avez l'habitude de courir. | |
| Option Route | Route | |
| Sous-texte Route | Bitume, ville | |
| Option Chemins | Chemins | |
| Sous-texte Chemins | Sentiers, nature | |
| Option Piste | Piste | |
| Sous-texte Piste | Piste d'athletisme | |
| Option Tapis | Tapis | |
| Sous-texte Tapis | Tapis de course | |
| Option Autre | Autre | |
| Sous-texte Autre | Precisez le lieu | |
| Placeholder autre | Ex: Plage, foret, montagne... | |

---

## ETAPE 9 - Blessures et contraintes

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Titre | Informations **complementaires** | |
| Sous-titre | Ces informations facultatives nous aident a personnaliser davantage votre programme. | |
| Label blessures | Blessure(s) passee(s) ou limitation(s) physique(s) **(Optionnel)** | |
| Placeholder blessures | Ex: Tendinite d'Achille, douleur au genou... | |
| Label contraintes | Contraintes personnelles / professionnelles **(Optionnel)** | |
| Sous-texte contraintes | Ex : travail de nuit, garde d'enfants... | |
| Placeholder contraintes | Partagez vos contraintes pour un plan adapte... | |

---

## PAGE APERCU (Preview)

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Titre header | Apercu | |
| Titre principal | Votre plan personnalise | |
| Description "Commencer" | Un programme progressif pour vous lancer en douceur et prendre de bonnes habitudes. | |
| Description "Reprendre" | Une reprise en securite, adaptee a votre pause, pour retrouver le plaisir de courir. | |
| Description "Course" | Un plan structure pour preparer votre objectif course et performer le jour J. | |
| Description "Entretenir" | Un plan equilibre pour entretenir votre forme et votre sante. | |
| Description par defaut | Un plan sur mesure, adapte a votre profil et a vos disponibilites. | |
| Titre resume | Resume du plan | |
| Stat 1 label | seances par semaine | |
| Stat 2 valeur | 4 | |
| Stat 2 label | semaines par mois | |
| Stat 3 valeur | 100% | |
| Stat 3 label | adapte a vous | |
| Titre semaine | Structure de la semaine | |
| Sous-texte semaine | Base sur vos X jours disponibles pour courir. | |
| Type Endurance | Endurance | |
| Desc Endurance | Course a allure moderee pour developper votre endurance de base. | |
| Type Tempo | Tempo | |
| Desc Tempo | Allure soutenue pour ameliorer votre seuil et la resistance. | |
| Type VMA | VMA | |
| Desc VMA | Seances de vitesse pour progresser sur le court et moyen terme. | |
| Type Recup | Recup | |
| Desc Recup | Sortie legere ou repos actif pour bien recuperer. | |
| Titre inclus | Ce qui est inclus | |
| Feature 1 | Plan genere et adapte a votre objectif et a votre niveau | |
| Feature 2 | Mise a jour du plan chaque mois | |
| Feature 3 | Seances detaillees avec allures, durees et conseils | |
| Feature 4 | Progression pensee pour eviter la surcharge et les blessures | |
| Bouton CTA | Voir les tarifs | |

---

## PAGE TARIFS (Pricing)

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Progress label | Etape 1 - Tarif | |
| Titre | Choisissez votre **abonnement** | |
| Sous-titre | Accedez a votre plan d'entrainement et beneficiez de mises a jour mensuelles | |
| Prix | 19,99 $ | |
| Periode | /mois | |
| Note annulation | Annulez a tout moment | |
| Titre features | Ce qui est inclus | |
| Feature 1 | Plan d'entrainement personnalise adapte a vos objectifs | |
| Feature 2 | Regeneration automatique chaque mois | |
| Feature 3 | Difficulte ajustee a votre progression | |
| Feature 4 | Calendrier hebdomadaire detaille | |
| Feature 5 | Propulse par l'intelligence artificielle | |
| Bouton s'abonner | S'abonner - 19,99 EUR/mois | |

> **NOTE** : Le bouton affiche "19,99 EUR/mois" dans le fichier de traduction (fr.json) mais devrait etre "19,99 $/mois" pour correspondre au prix affiche.

---

## PAGE CREATION DE COMPTE

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Progress label | Inscription completee | |
| Titre | Finalisez votre **compte** | |
| Sous-titre | Pret pour votre premiere session d'entrainement ? | |
| Label nom | Nom complet | |
| Placeholder nom | Jean Dupont | |
| Label email | Email | |
| Placeholder email | votre@email.com | |
| Label mot de passe | Mot de passe | |
| Placeholder mot de passe | (points) | |
| Label confirmation | Confirmer le mot de passe | |
| Placeholder confirmation | Confirmez votre mot de passe | |
| Info box | Vos reponses au questionnaire ont ete sauvegardees et seront liees a votre compte. | |
| Bouton | Creer mon compte | |
| Note legale | En cliquant, vous acceptez nos conditions d'utilisation | |

---

## PAGE PAIEMENT (Checkout)

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Progress label | Etape 2 - Paiement | |
| Titre | Finalisez votre **paiement** | |
| Sous-titre | (cle traduction: subscription.checkout.securePayment) | |
| Label total | (cle traduction: subscription.checkout.total) | |
| Prix | 19,99 $ | |
| Periode | /mois | |
| Note | (cle traduction: subscription.checkout.chargeToday) | |
| Bouton payer | (cle traduction: subscription.checkout.pay) | |
| Note securite | (cle traduction: subscription.checkout.stripePowered) | |

> Les textes marques "(cle traduction: ...)" ne sont pas definis dans fr.json - ils s'afficheront comme la cle brute. Il faut les ajouter dans le fichier de traduction.

---

## PAGE SUCCES

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Progress label | Termine | |
| Titre | (cle traduction: subscription.success.title) | |
| Message | (cle traduction: subscription.success.message) | |
| Titre etapes | (cle traduction: subscription.success.nextSteps) | |
| Etape 1 | (cle traduction: subscription.success.step1) | |
| Etape 2 | (cle traduction: subscription.success.step2) | |
| Etape 3 | (cle traduction: subscription.success.step3) | |
| Bouton continuer | (cle traduction: subscription.success.continue) | |

> **IMPORTANT** : Les textes de la page Checkout et Success ne sont pas definis dans fr.json. Ils s'afficheront comme les cles brutes (ex: "subscription.success.title"). Il faut definir ces textes.

---

## PAGE HOME (apres connexion)

| Element | Texte actuel | Nouveau texte |
|---------|-------------|---------------|
| Salutation | Bon retour, | |
| Titre questionnaire | Statut du questionnaire | |
| Badge termine | Termine | |
| Badge incomplet | Incomplet | |
| Description termine | Votre profil est complet. Vous pouvez le consulter ou le mettre a jour a tout moment depuis votre profil. | |
| Description incomplet | Completez le questionnaire de votre profil pour obtenir un plan d'entrainement personnalise adapte a vos objectifs. | |
| Stat 1 | Pret | |
| Label stat 1 | Plan d'entrainement | |
| Stat 2 | Actif | |
| Label stat 2 | Profil | |
| Bouton questionnaire | Commencer le questionnaire | |
| Bouton plan | Generer le plan | |
| Bouton profil | Voir le profil | |
| Chargement | Chargement... | |

---

## TRADUCTIONS MANQUANTES A DEFINIR

Ces cles de traduction sont utilisees dans le code mais n'existent pas dans `fr.json` :

| Cle | Suggestion | Nouveau texte |
|-----|-----------|---------------|
| subscription.checkout.securePayment | Paiement securise via Stripe | |
| subscription.checkout.total | Total | |
| subscription.checkout.chargeToday | Vous serez debite aujourd'hui | |
| subscription.checkout.pay | Payer 19,99 $ | |
| subscription.checkout.stripePowered | Paiement securise par Stripe | |
| subscription.checkout.initializing | Preparation du paiement... | |
| subscription.success.title | Felicitations ! | |
| subscription.success.message | Votre abonnement est actif. Votre plan d'entrainement est pret. | |
| subscription.success.nextSteps | Prochaines etapes | |
| subscription.success.step1 | Consultez votre plan d'entrainement personnalise | |
| subscription.success.step2 | Suivez votre calendrier hebdomadaire | |
| subscription.success.step3 | Progressez a votre rythme | |
| subscription.success.continue | Acceder a mon plan | |
