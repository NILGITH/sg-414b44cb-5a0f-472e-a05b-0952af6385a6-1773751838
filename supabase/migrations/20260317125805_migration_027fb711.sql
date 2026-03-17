-- Créer la table content_submissions
CREATE TABLE IF NOT EXISTS content_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  content_type text NOT NULL CHECK (content_type IN ('text', 'image', 'video', 'pdf')),
  content_data text,
  file_urls text[],
  menu_section_id uuid REFERENCES menu_sections(id) ON DELETE SET NULL,
  submenu_section_id uuid REFERENCES menu_sections(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by uuid REFERENCES auth.users,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS view_content_submissions ON content_submissions;
CREATE POLICY view_content_submissions ON content_submissions FOR SELECT USING (true);

DROP POLICY IF EXISTS manage_content_submissions ON content_submissions;
CREATE POLICY manage_content_submissions ON content_submissions FOR ALL USING (true) WITH CHECK (true);