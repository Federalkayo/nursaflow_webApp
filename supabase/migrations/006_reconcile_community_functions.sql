-- ============================================================================
-- Migration: 006_reconcile_community_functions.sql
-- Purpose: 004_community_tables.sql was edited multiple times AFTER it had
--          already been recorded as "applied" by the Supabase CLI. Since the
--          CLI tracks applied migrations by version number (not by content),
--          none of those later edits — including toggle_post_like, the
--          is_conversation_participant recursion fix, and the pair_key
--          uniqueness column — were ever actually run against this database.
--          This migration re-applies exactly those pieces. Every statement
--          here is written to be safe to run regardless of which parts of
--          004 did or didn't make it through originally.
-- ============================================================================

-- Ensure pair_key column exists on conversations (added to 004 after initial push)
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS pair_key TEXT UNIQUE;

-- ----------------------------------------------------------------------------
-- Re-create all SECURITY DEFINER functions (CREATE OR REPLACE is always safe)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_group_members_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.groups
    SET members_count = members_count + 1, updated_at = NOW()
    WHERE id = NEW.group_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.groups
    SET members_count = GREATEST(0, members_count - 1), updated_at = NOW()
    WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.community_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.community_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.community_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.start_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user UUID := auth.uid();
  v_pair_key TEXT;
  v_conv_id UUID;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated user';
  END IF;

  IF v_current_user = other_user_id THEN
    RAISE EXCEPTION 'Cannot start a conversation with yourself';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = other_user_id) THEN
    RAISE EXCEPTION 'Recipient profile does not exist';
  END IF;

  v_pair_key := LEAST(v_current_user, other_user_id)::text || '_' || GREATEST(v_current_user, other_user_id)::text;

  SELECT id INTO v_conv_id
  FROM public.conversations
  WHERE pair_key = v_pair_key;

  IF v_conv_id IS NOT NULL THEN
    RETURN v_conv_id;
  END IF;

  INSERT INTO public.conversations (is_group, pair_key)
  VALUES (FALSE, v_pair_key)
  RETURNING id INTO v_conv_id;

  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES
    (v_conv_id, v_current_user),
    (v_conv_id, other_user_id);

  RETURN v_conv_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exists BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated user';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.post_likes
    WHERE post_id = p_post_id AND user_id = v_user_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.post_likes
    WHERE post_id = p_post_id AND user_id = v_user_id;
    RETURN FALSE;
  ELSE
    INSERT INTO public.post_likes (post_id, user_id)
    VALUES (p_post_id, v_user_id);
    RETURN TRUE;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id = auth.uid()
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- Re-create triggers (DROP IF EXISTS + CREATE is always safe to re-run)
-- ----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_update_group_members_count ON public.group_members;
CREATE TRIGGER trg_update_group_members_count
AFTER INSERT OR DELETE ON public.group_members
FOR EACH ROW EXECUTE FUNCTION update_group_members_count();

DROP TRIGGER IF EXISTS trg_update_post_likes_count ON public.post_likes;
CREATE TRIGGER trg_update_post_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS trg_update_post_comments_count ON public.post_comments;
CREATE TRIGGER trg_update_post_comments_count
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

DROP TRIGGER IF EXISTS trg_update_conversation_timestamp ON public.messages;
CREATE TRIGGER trg_update_conversation_timestamp
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- ----------------------------------------------------------------------------
-- Re-apply GRANT/REVOKE (idempotent — safe to run repeatedly)
-- ----------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.start_conversation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_conversation(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.toggle_post_like(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_post_like(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.is_conversation_participant(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.update_group_members_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_post_likes_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_post_comments_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_conversation_timestamp() FROM PUBLIC;

-- ----------------------------------------------------------------------------
-- Re-create the participant-privacy policies against the FIXED (non-recursive)
-- helper function. DROP + CREATE so this is safe whether the old recursive
-- version, the fixed version, or nothing at all currently exists.
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Conversations readable by participants" ON public.conversations;
CREATE POLICY "Conversations readable by participants"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (public.is_conversation_participant(id));

DROP POLICY IF EXISTS "Conversation participants readable by co-participants" ON public.conversation_participants;
CREATE POLICY "Conversation participants readable by co-participants"
  ON public.conversation_participants FOR SELECT
  TO authenticated
  USING (public.is_conversation_participant(conversation_id));

DROP POLICY IF EXISTS "Messages readable by conversation participants" ON public.messages;
CREATE POLICY "Messages readable by conversation participants"
  ON public.messages FOR SELECT
  TO authenticated
  USING (public.is_conversation_participant(conversation_id));

DROP POLICY IF EXISTS "Messages insertable by conversation participants" ON public.messages;
CREATE POLICY "Messages insertable by conversation participants"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    public.is_conversation_participant(conversation_id)
  );

-- ----------------------------------------------------------------------------
-- Confirm realtime publication includes the community tables (idempotent)
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'community_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'post_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- Force PostgREST to pick up the (re-)created functions immediately
NOTIFY pgrst, 'reload schema';
