import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

const BG = colors.primary.dark;
const CARD_BG = 'rgba(26, 38, 50, 0.6)';
const BORDER = 'rgba(255, 255, 255, 0.08)';
const ACCENT = colors.accent.blue;
const TEXT_PRIMARY = '#ffffff';
const TEXT_SECONDARY = 'rgba(147, 173, 200, 0.9)';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.logo}>RUNLINE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="shield-check-outline" size={28} color={ACCENT} />
          <Text style={styles.pageTitle}>Conditions Générales{'\n'}d'Utilisation</Text>
          <Text style={styles.lastUpdated}>Dernière mise à jour : 22 février 2026</Text>
        </View>

        {/* 1. Présentation du Service */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Présentation du Service</Text>
          <Text style={styles.body}>
            RUNLINE est une application mobile de coaching personnalisé en course à pied, proposant des plans d'entraînement générés par intelligence artificielle, automatisations et logique de code et adaptés aux objectifs et au profil de chaque utilisateur.
          </Text>
          <View style={styles.infoBlock}>
            <Text style={styles.bold}>Éditeur :</Text>
            <Text style={styles.body}> RUNLINE</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.bold}>Contact :</Text>
            <Text style={styles.body}> contact@runline.fr</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.bold}>Site web :</Text>
            <Text style={styles.body}> www.runline.fr</Text>
          </View>
        </View>

        {/* 2. Acceptation des Conditions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Acceptation des Conditions</Text>
          <Text style={styles.body}>
            En créant un compte et en utilisant RUNLINE, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation.
          </Text>
          <Text style={[styles.body, styles.mt]}>
            Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'application.
          </Text>
        </View>

        {/* 3. Accès au Service */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Accès au Service</Text>

          <Text style={styles.subsectionTitle}>3.1 Création de compte</Text>
          <Text style={styles.body}>Pour accéder à RUNLINE, vous devez :</Text>
          <Text style={styles.bullet}>• Être âgé(e) d'au moins 18 ans</Text>
          <Text style={styles.bullet}>• Fournir des informations exactes et complètes lors de l'inscription</Text>
          <Text style={styles.bullet}>• Créer un mot de passe sécurisé et le garder confidentiel</Text>
          <Text style={styles.bullet}>• Compléter le questionnaire de profil sportif</Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>3.2 Abonnement</Text>
          <Text style={styles.body}>L'accès complet à RUNLINE nécessite un abonnement payant :</Text>
          <Text style={styles.bullet}><Text style={styles.bold}>Tarif :</Text> 19,99 € / mois</Text>
          <Text style={styles.bullet}><Text style={styles.bold}>Engagement :</Text> Sans engagement, résiliation possible à tout moment</Text>
          <Text style={styles.bullet}><Text style={styles.bold}>Renouvellement :</Text> Automatique chaque mois à date anniversaire</Text>
          <Text style={styles.bullet}><Text style={styles.bold}>Moyens de paiement :</Text> Carte bancaire via Stripe</Text>
          <Text style={[styles.body, styles.mt]}>
            En cas de résiliation, vous conservez l'accès jusqu'à la fin de la période payée.
          </Text>
        </View>

        {/* 4. Description des Services */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Description des Services</Text>

          <Text style={styles.subsectionTitle}>4.1 Plans d'entraînement</Text>
          <Text style={styles.body}>RUNLINE génère des plans d'entraînement personnalisés incluant :</Text>
          <Text style={styles.bullet}>• Un plan mensuel de 4 ou 5 semaines</Text>
          <Text style={styles.bullet}>• Des séances détaillées par jour (échauffement, corps de séance, récupération)</Text>
          <Text style={styles.bullet}>• Une adaptation selon votre profil, objectifs et contraintes</Text>
          <Text style={styles.bullet}>• Une régénération automatique chaque mois</Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>4.2 Génération</Text>
          <Text style={styles.body}>Les plans sont générés par intelligence artificielle, automatisations et logique de code basées sur :</Text>
          <Text style={styles.bullet}>• Vos réponses au questionnaire</Text>
          <Text style={styles.bullet}>• Vos données personnelles (âge, poids, taille, niveau)</Text>
          <Text style={styles.bullet}>• Vos objectifs de course</Text>
          <Text style={styles.bullet}>• Vos historiques d'entraînement</Text>
          <Text style={styles.bullet}>• Les meilleures pratiques scientifiques</Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>4.3 Mise à jour du profil</Text>
          <Text style={styles.body}>Vous pouvez à tout moment :</Text>
          <Text style={styles.bullet}>• Modifier vos informations personnelles</Text>
          <Text style={styles.bullet}>• Ajuster vos objectifs</Text>
          <Text style={styles.bullet}>• Mettre à jour vos contraintes</Text>
          <Text style={styles.bullet}>• Signaler de nouvelles blessures</Text>
          <Text style={[styles.body, styles.mt]}>
            Les modifications prennent effet lors de la génération du plan suivant.
          </Text>
        </View>

        {/* 5. Obligations de l'Utilisateur */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>5. Obligations de l'Utilisateur</Text>

          <Text style={styles.subsectionTitle}>5.1 Utilisation responsable</Text>
          <Text style={styles.body}>Vous vous engagez à :</Text>
          <Text style={styles.bullet}>• Fournir des informations exactes sur votre état de santé</Text>
          <Text style={styles.bullet}>• Signaler toute blessure, limitation physique ou problème médical</Text>
          <Text style={styles.bullet}>• Consulter un médecin avant de débuter tout programme d'entraînement</Text>
          <Text style={styles.bullet}>• Adapter ou arrêter l'entraînement en cas de douleur, fatigue excessive ou malaise</Text>
          <Text style={styles.bullet}>• Ne pas dépasser vos capacités physiques</Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>5.2 Limites de responsabilité</Text>
          <Text style={styles.highlight}>
            RUNLINE est un outil d'assistance à l'entraînement, pas un substitut à un avis médical.
          </Text>
          <Text style={[styles.body, styles.mt]}>Vous reconnaissez que :</Text>
          <Text style={styles.bullet}>• La pratique de la course à pied comporte des risques (blessures, fatigue, accidents)</Text>
          <Text style={styles.bullet}>• RUNLINE ne peut garantir l'absence de blessure ou l'atteinte de vos objectifs</Text>
          <Text style={styles.bullet}>• Vous êtes seul(e) responsable de votre santé et de votre sécurité</Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>5.3 Usage personnel</Text>
          <Text style={styles.body}>Votre compte est strictement personnel. Vous ne pouvez pas :</Text>
          <Text style={styles.bullet}>• Partager vos identifiants avec des tiers</Text>
          <Text style={styles.bullet}>• Revendre ou céder votre abonnement</Text>
          <Text style={styles.bullet}>• Utiliser RUNLINE à des fins commerciales</Text>
          <Text style={styles.bullet}>• Extraire, copier ou diffuser les plans générés à des fins lucratives</Text>
        </View>

        {/* 6. Propriété Intellectuelle */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>6. Propriété Intellectuelle</Text>

          <Text style={styles.subsectionTitle}>6.1 Contenu de l'application</Text>
          <Text style={styles.body}>
            Tous les éléments de RUNLINE (textes, graphismes, logo, interface, algorithmes) sont protégés par le droit d'auteur et appartiennent à RUNLINE.
          </Text>
          <Text style={[styles.body, styles.mt]}>
            Toute reproduction, représentation ou exploitation non autorisée est interdite.
          </Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>6.2 Plans générés</Text>
          <Text style={styles.body}>
            Les plans d'entraînement générés pour vous restent votre propriété pour votre usage personnel uniquement. Vous ne pouvez pas les exploiter commercialement.
          </Text>
        </View>

        {/* 7. Données Personnelles */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>7. Données Personnelles</Text>

          <Text style={styles.subsectionTitle}>7.1 Collecte</Text>
          <Text style={styles.body}>
            RUNLINE collecte et traite vos données personnelles conformément à notre Politique de Confidentialité (disponible dans l'application).
          </Text>
          <Text style={[styles.body, styles.mt]}>Données collectées :</Text>
          <Text style={styles.bullet}>• Informations d'identification (nom, prénom, email)</Text>
          <Text style={styles.bullet}>• Données physiologiques (âge, sexe, poids, taille)</Text>
          <Text style={styles.bullet}>• Données d'entraînement (volume, fréquence, objectifs, chronos)</Text>
          <Text style={styles.bullet}>• Données de santé (blessures passées, limitations physiques)</Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>7.2 Utilisation</Text>
          <Text style={styles.body}>Vos données sont utilisées exclusivement pour :</Text>
          <Text style={styles.bullet}>• Générer vos plans d'entraînement personnalisés</Text>
          <Text style={styles.bullet}>• Améliorer la qualité de nos services</Text>
          <Text style={styles.bullet}>• Vous contacter concernant votre abonnement</Text>
          <Text style={[styles.body, styles.mt]}>
            Nous ne vendons jamais vos données à des tiers.
          </Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>7.3 Droits</Text>
          <Text style={styles.body}>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Contact : contact@runline.fr
          </Text>
        </View>

        {/* 8. Résiliation et Annulation */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>8. Résiliation et Annulation</Text>

          <Text style={styles.subsectionTitle}>8.1 Résiliation par l'utilisateur</Text>
          <Text style={styles.body}>Vous pouvez annuler votre abonnement à tout moment depuis :</Text>
          <Text style={styles.bullet}>• L'application (Profil {'>'} Gérer mon abonnement)</Text>
          <Text style={styles.bullet}>• Par email à contact@runline.fr</Text>
          <Text style={[styles.highlight, styles.mt]}>
            Aucun remboursement n'est effectué pour la période en cours. Vous conservez l'accès jusqu'à la fin de la période payée.
          </Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>8.2 Résiliation par RUNLINE</Text>
          <Text style={styles.body}>RUNLINE se réserve le droit de suspendre ou résilier votre compte en cas de :</Text>
          <Text style={styles.bullet}>• Non-paiement</Text>
          <Text style={styles.bullet}>• Violation des présentes CGU</Text>
          <Text style={styles.bullet}>• Utilisation frauduleuse ou abusive</Text>
          <Text style={styles.bullet}>• Activité suspecte</Text>
        </View>

        {/* 9. Limitations de Garantie */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>9. Limitations de Garantie</Text>

          <Text style={styles.subsectionTitle}>9.1 Disponibilité</Text>
          <Text style={styles.body}>RUNLINE s'efforce d'assurer une disponibilité maximale du service, mais ne garantit pas :</Text>
          <Text style={styles.bullet}>• Une disponibilité 24/7 sans interruption</Text>
          <Text style={styles.bullet}>• L'absence d'erreurs ou de bugs</Text>
          <Text style={styles.bullet}>• La compatibilité avec tous les appareils</Text>
          <Text style={[styles.body, styles.mt]}>
            Des maintenances programmées peuvent entraîner des interruptions temporaires.
          </Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>9.2 Résultats</Text>
          <Text style={styles.body}>RUNLINE ne garantit pas :</Text>
          <Text style={styles.bullet}>• L'atteinte de vos objectifs sportifs</Text>
          <Text style={styles.bullet}>• L'absence de blessure</Text>
          <Text style={styles.bullet}>• Des performances spécifiques en course</Text>
          <Text style={[styles.body, styles.mt]}>
            Les résultats dépendent de nombreux facteurs individuels (assiduité, génétique, nutrition, récupération, etc.).
          </Text>
        </View>

        {/* 10. Limitation de Responsabilité */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>10. Limitation de Responsabilité</Text>
          <Text style={styles.highlight}>RUNLINE ne pourra être tenu responsable :</Text>
          <Text style={[styles.bullet, styles.mt]}>• Des blessures, accidents ou problèmes de santé liés à la pratique de la course à pied</Text>
          <Text style={styles.bullet}>• De l'échec à atteindre vos objectifs sportifs</Text>
          <Text style={styles.bullet}>• Des pertes de données suite à un problème technique</Text>
          <Text style={styles.bullet}>• Des dommages indirects (perte de temps, manque à gagner, etc.)</Text>
          <Text style={[styles.highlight, styles.mt]}>
            En utilisant RUNLINE, vous acceptez de pratiquer la course à pied à vos propres risques.
          </Text>
        </View>

        {/* 11. Modification des CGU */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>11. Modification des CGU</Text>
          <Text style={styles.body}>
            RUNLINE se réserve le droit de modifier les présentes CGU à tout moment.
          </Text>
          <Text style={[styles.body, styles.mt]}>
            Les utilisateurs seront informés par email ou notification dans l'application. La poursuite de l'utilisation après modification vaut acceptation des nouvelles conditions.
          </Text>
        </View>

        {/* 12. Modification du Tarif */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>12. Modification du Tarif</Text>
          <Text style={styles.body}>
            En cas d'augmentation du prix de l'abonnement, vous serez prévenu(e) <Text style={styles.bold}>30 jours à l'avance</Text> par email.
          </Text>
          <Text style={[styles.body, styles.mt]}>Vous aurez la possibilité de :</Text>
          <Text style={styles.bullet}>• Accepter le nouveau tarif (renouvellement automatique au nouveau prix)</Text>
          <Text style={styles.bullet}>• Résilier votre abonnement avant l'application du nouveau tarif</Text>
        </View>

        {/* 13. Droit Applicable et Litiges */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>13. Droit Applicable et Litiges</Text>

          <Text style={styles.subsectionTitle}>13.1 Droit applicable</Text>
          <Text style={styles.body}>
            Les présentes CGU sont régies par le droit français.
          </Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>13.2 Règlement des litiges</Text>
          <Text style={styles.body}>
            En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
          </Text>
          <Text style={[styles.body, styles.mt]}>
            À défaut, les tribunaux français seront seuls compétents.
          </Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>13.3 Médiation</Text>
          <Text style={styles.body}>
            Conformément à la réglementation européenne, vous pouvez recourir à une médiation de la consommation en cas de litige non résolu.
          </Text>
        </View>

        {/* 14. Contact */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>14. Contact</Text>
          <Text style={styles.body}>Pour toute question concernant ces CGU :</Text>
          <View style={[styles.infoBlock, styles.mt]}>
            <Text style={styles.bold}>Email :</Text>
            <Text style={styles.body}> contact@runline.fr</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.bold}>Objet :</Text>
            <Text style={styles.body}> CGU - [Votre question]</Text>
          </View>
        </View>

        {/* 15. Dispositions Diverses */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>15. Dispositions Diverses</Text>

          <Text style={styles.subsectionTitle}>15.1 Nullité partielle</Text>
          <Text style={styles.body}>
            Si une clause des présentes CGU est déclarée nulle ou inapplicable, les autres clauses restent en vigueur.
          </Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>15.2 Non-renonciation</Text>
          <Text style={styles.body}>
            Le fait pour RUNLINE de ne pas se prévaloir d'une disposition des CGU ne constitue pas une renonciation à cette disposition.
          </Text>

          <Text style={[styles.subsectionTitle, styles.mt]}>15.3 Langue</Text>
          <Text style={styles.body}>
            En cas de traduction des CGU, seule la version française fait foi.
          </Text>
        </View>

        {/* Footer acceptance */}
        <View style={styles.footerCard}>
          <Text style={styles.footerText}>
            En utilisant RUNLINE, vous confirmez avoir lu, compris et accepté l'intégralité des présentes Conditions Générales d'Utilisation.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  logo: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: TEXT_PRIMARY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  titleContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 28,
    gap: 10,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 32,
  },
  lastUpdated: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ACCENT,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    marginTop: 4,
  },
  body: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 22,
  },
  bold: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    lineHeight: 22,
  },
  bullet: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 22,
    paddingLeft: 8,
    marginTop: 2,
  },
  highlight: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  infoBlock: {
    flexDirection: 'row',
    marginTop: 6,
  },
  mt: {
    marginTop: 12,
  },
  footerCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ACCENT,
    padding: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    lineHeight: 22,
    textAlign: 'center',
  },
});
