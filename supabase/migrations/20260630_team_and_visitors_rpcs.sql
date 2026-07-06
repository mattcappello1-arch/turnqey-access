-- RPC: get_org_members — list all members of an org with profile info
CREATE OR REPLACE FUNCTION get_org_members(p_org_id uuid)
RETURNS TABLE (
  id uuid,
  org_id uuid,
  user_id uuid,
  role text,
  site_ids uuid[],
  active boolean,
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz,
  email text,
  full_name text
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    m.id, m.org_id, m.user_id, m.role::text, m.site_ids, m.active,
    m.invited_at, m.accepted_at, m.created_at,
    COALESCE(p.email, '') AS email,
    COALESCE(p.raw_user_meta_data->>'full_name', p.email, '') AS full_name
  FROM enterprise_members m
  LEFT JOIN auth.users p ON p.id = m.user_id
  WHERE m.org_id = p_org_id
  ORDER BY m.created_at ASC;
$$;

-- RPC: create_org_member — invite a new member by email + role
CREATE OR REPLACE FUNCTION create_org_member(
  p_org_id uuid,
  p_email text,
  p_role text,
  p_site_ids uuid[] DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_member_id uuid;
BEGIN
  -- Look up existing user by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email LIMIT 1;

  INSERT INTO enterprise_members (org_id, user_id, role, site_ids, active, invited_at)
  VALUES (p_org_id, v_user_id, p_role::enterprise_member_role, p_site_ids, true, now())
  RETURNING id INTO v_member_id;

  RETURN v_member_id;
END;
$$;

-- RPC: update_org_member_role — change a member's role
CREATE OR REPLACE FUNCTION update_org_member_role(
  p_member_id uuid,
  p_role text
)
RETURNS void
LANGUAGE sql SECURITY DEFINER
AS $$
  UPDATE enterprise_members
  SET role = p_role::enterprise_member_role, updated_at = now()
  WHERE id = p_member_id;
$$;

-- RPC: delete_org_member — remove a member from the org
CREATE OR REPLACE FUNCTION delete_org_member(p_member_id uuid)
RETURNS void
LANGUAGE sql SECURITY DEFINER
AS $$
  DELETE FROM enterprise_members WHERE id = p_member_id;
$$;

-- RPC: get_visitor_passes — list visitor passes for sites
CREATE OR REPLACE FUNCTION get_visitor_passes(p_site_ids uuid[])
RETURNS TABLE (
  id uuid,
  site_id uuid,
  issued_by uuid,
  visitor_name text,
  visitor_email text,
  visitor_phone text,
  visitor_type text,
  zone_ids uuid[],
  starts_at timestamptz,
  expires_at timestamptz,
  access_code_ids uuid[],
  status text,
  notes text,
  created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    vp.id, vp.site_id, vp.issued_by,
    vp.visitor_name, vp.visitor_email, vp.visitor_phone,
    vp.visitor_type::text, vp.zone_ids,
    vp.starts_at, vp.expires_at,
    vp.access_code_ids, vp.status::text,
    vp.notes, vp.created_at
  FROM visitor_passes vp
  WHERE vp.site_id = ANY(p_site_ids)
  ORDER BY vp.starts_at DESC;
$$;

-- RPC: create_visitor_pass
CREATE OR REPLACE FUNCTION create_visitor_pass(
  p_site_id uuid,
  p_issued_by uuid,
  p_visitor_name text,
  p_visitor_email text,
  p_visitor_phone text,
  p_visitor_type text,
  p_zone_ids uuid[],
  p_starts_at timestamptz,
  p_expires_at timestamptz,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO visitor_passes (
    site_id, issued_by, visitor_name, visitor_email, visitor_phone,
    visitor_type, zone_ids, starts_at, expires_at, status, notes
  ) VALUES (
    p_site_id, p_issued_by, p_visitor_name,
    NULLIF(p_visitor_email, ''), NULLIF(p_visitor_phone, ''),
    p_visitor_type::visitor_type_enum, p_zone_ids,
    p_starts_at, p_expires_at, 'active', p_notes
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- RPC: revoke_visitor_pass
CREATE OR REPLACE FUNCTION revoke_visitor_pass(p_pass_id uuid)
RETURNS void
LANGUAGE sql SECURITY DEFINER
AS $$
  UPDATE visitor_passes SET status = 'revoked' WHERE id = p_pass_id;
$$;
