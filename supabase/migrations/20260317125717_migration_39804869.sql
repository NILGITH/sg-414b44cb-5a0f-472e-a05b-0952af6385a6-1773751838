-- Créer la table menu_sections
CREATE TABLE IF NOT EXISTS menu_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  parent_id uuid REFERENCES menu_sections(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE menu_sections ENABLE ROW LEVEL SECURITY;

-- Autoriser la lecture publique
DROP POLICY IF EXISTS view_menu_sections ON menu_sections;
CREATE POLICY view_menu_sections ON menu_sections FOR SELECT USING (true);

-- Autoriser la modification par les administrateurs (ou tout le monde pour l'instant)
DROP POLICY IF EXISTS manage_menu_sections ON menu_sections;
CREATE POLICY manage_menu_sections ON menu_sections FOR ALL USING (true) WITH CHECK (true);