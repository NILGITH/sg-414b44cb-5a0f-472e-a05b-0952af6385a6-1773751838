-- Créer la table menu_change_requests
CREATE TABLE IF NOT EXISTS menu_change_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  old_menu_name text NOT NULL,
  new_menu_name text NOT NULL,
  is_submenu boolean DEFAULT false,
  parent_menu_name text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by uuid REFERENCES auth.users,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE menu_change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS view_menu_change_requests ON menu_change_requests;
CREATE POLICY view_menu_change_requests ON menu_change_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS manage_menu_change_requests ON menu_change_requests;
CREATE POLICY manage_menu_change_requests ON menu_change_requests FOR ALL USING (true) WITH CHECK (true);