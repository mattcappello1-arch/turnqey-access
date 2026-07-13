-- Add maintenance mode column to locks
ALTER TABLE public.locks ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false;

-- RPC to toggle maintenance mode on a lock
CREATE OR REPLACE FUNCTION public.set_lock_maintenance(p_lock_id UUID, p_enabled BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.locks SET maintenance_mode = p_enabled WHERE id = p_lock_id;
END;
$$;
