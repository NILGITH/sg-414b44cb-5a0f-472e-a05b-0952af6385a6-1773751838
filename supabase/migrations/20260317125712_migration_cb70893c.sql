-- Mettre à jour la table profiles avec le rôle s'il n'existe pas
ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Si la table profiles n'existe pas, la créer
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- S'assurer que RLS est activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;