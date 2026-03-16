-- =============================================
-- VitAIe — Schéma Supabase
-- Exécuter dans l'éditeur SQL de Supabase
-- =============================================

-- Table utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'boost')),
  stripe_customer_id TEXT,
  cv_count INT DEFAULT 0,
  lettre_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table CVs
CREATE TABLE IF NOT EXISTS cvs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contenu_original TEXT NOT NULL,
  contenu_optimise JSONB,
  template TEXT DEFAULT 'moderne' CHECK (template IN ('moderne', 'classique', 'minimaliste')),
  score_ats INT,
  mots_cles_presents TEXT[],
  mots_cles_manquants TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table lettres
CREATE TABLE IF NOT EXISTS lettres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cv_id UUID REFERENCES cvs(id),
  offre TEXT NOT NULL,
  lettre_generee TEXT NOT NULL,
  ton TEXT DEFAULT 'formel',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table candidatures
CREATE TABLE IF NOT EXISTS candidatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  poste TEXT NOT NULL,
  entreprise TEXT NOT NULL,
  statut TEXT DEFAULT 'a_envoyer' CHECK (statut IN ('a_envoyer', 'envoyee', 'entretien', 'reponse')),
  date_envoi DATE,
  notes TEXT,
  lien TEXT,
  cv_id UUID REFERENCES cvs(id),
  lettre_id UUID REFERENCES lettres(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table entretiens
CREATE TABLE IF NOT EXISTS entretiens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  poste TEXT NOT NULL,
  fiche_poste TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) — chaque user voit seulement ses données
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lettres ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE entretiens ENABLE ROW LEVEL SECURITY;

-- Policies (à adapter selon ton setup Clerk + Supabase)
CREATE POLICY "Users can view own data" ON users FOR ALL USING (clerk_id = auth.uid()::text);
CREATE POLICY "CVs belong to user" ON cvs FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Lettres belong to user" ON lettres FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Candidatures belong to user" ON candidatures FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Entretiens belong to user" ON entretiens FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_lettres_user_id ON lettres(user_id);
CREATE INDEX IF NOT EXISTS idx_candidatures_user_id ON candidatures(user_id);
CREATE INDEX IF NOT EXISTS idx_entretiens_user_id ON entretiens(user_id);
