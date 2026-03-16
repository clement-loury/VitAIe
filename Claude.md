# VitAIe — Contexte Projet pour Claude Code

## Qui je suis
Étudiant développeur, passionné d'IA et d'informatique.
Stack : Next.js, Tailwind CSS, TypeScript.
Environnement : macOS, Claude Code Max x5.

## C'est quoi VitAIe
VitAIe est un SaaS freemium qui aide les candidats à décrocher un emploi grâce à l'IA.
L'utilisateur colle son CV + une offre d'emploi → VitAIe génère en 30 secondes :
- Une lettre de motivation parfaitement personnalisée
- Un CV reformulé et optimisé pour les filtres ATS (mots-clés RH)
- Un score de compatibilité CV/offre (0-100%)

## Stack technique cible
- Frontend : Next.js 14 (App Router) + Tailwind CSS + TypeScript
- Auth : Clerk
- Base de données : Supabase (PostgreSQL)
- LLM : Claude Sonnet via API Anthropic
- Export PDF : react-pdf
- Paiements : Stripe
- Hébergement : Vercel

## Identité visuelle
- Couleur principale : Violet #5B2D8E
- Couleur secondaire : Teal #1AA8A8
- Font : Inter
- Style : moderne, épuré, professionnel — inspiré de Linear et Notion

## Plans tarifaires
- FREE : 1 CV + 1 lettre / mois, templates standards
- PRO (12€/mois) : illimité, score ATS, export DOCX, relance email IA
- BOOST (29€/mois) : tout PRO + simulation entretien IA + suivi candidatures

## Roadmap (ordre de développement)
1. MVP core : input CV + offre → génération lettre (Semaine 1)
2. Templates CV visuels + export PDF (Semaine 2)
3. Auth Clerk + historique Supabase (Semaine 3)
4. Score ATS + design final (Semaine 4)
5. Stripe + déploiement Vercel (Semaine 5)

## Règles de développement
- Toujours utiliser TypeScript strict
- Composants dans /components, logique API dans /app/api
- Variables d'environnement dans .env.local, jamais hardcodées
- Code commenté en français
- Priorité : faire fonctionner avant de faire beau
- Un fichier = une responsabilité claire

## Clés d'environnement nécessaires (.env.local)
ANTHROPIC_API_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=