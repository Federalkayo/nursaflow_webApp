-- ============================================================================
-- Migration: 004_community_tables.sql
-- Description: Community Posts, Comments, Likes, Groups, Members, Conversations,
--              Participants, and Messages with RLS & Denormalized Triggers.
-- ============================================================================

-- 1. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  members_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- 3. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] NOT NULL DEFAULT '{}',
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. POST COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. POST LIKES TABLE
CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- 6. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group BOOLEAN NOT NULL DEFAULT FALSE,
  title TEXT,
  pair_key TEXT UNIQUE, -- Computed deterministic key: LEAST(u1, u2)_GREATEST(u1, u2)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CONVERSATION PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- 8. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PAGINATION & FAST LOOKUPS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_group_id ON public.community_posts (group_id, created_at DESC) WHERE group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created ON public.post_comments (post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages (conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members (user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON public.conversation_participants (user_id);

-- ============================================================================
-- DENORMALIZED COUNT TRIGGERS
-- ============================================================================

-- Function & Trigger: Group Members Count
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

DROP TRIGGER IF EXISTS trg_update_group_members_count ON public.group_members;
CREATE TRIGGER trg_update_group_members_count
AFTER INSERT OR DELETE ON public.group_members
FOR EACH ROW EXECUTE FUNCTION update_group_members_count();

-- Function & Trigger: Post Likes Count
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

DROP TRIGGER IF EXISTS trg_update_post_likes_count ON public.post_likes;
CREATE TRIGGER trg_update_post_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Function & Trigger: Post Comments Count
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

DROP TRIGGER IF EXISTS trg_update_post_comments_count ON public.post_comments;
CREATE TRIGGER trg_update_post_comments_count
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Function & Trigger: Conversation Updated At on New Message
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

DROP TRIGGER IF EXISTS trg_update_conversation_timestamp ON public.messages;
CREATE TRIGGER trg_update_conversation_timestamp
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- ============================================================================
-- ATOMIC CONVERSATION CREATION FUNCTION (SECURITY DEFINER)
-- Prevents RLS deadlock when user A starts a 1-to-1 conversation with user B
-- ============================================================================

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

  -- Compute deterministic unique pair key for 1-to-1 DMs
  v_pair_key := LEAST(v_current_user, other_user_id)::text || '_' || GREATEST(v_current_user, other_user_id)::text;

  -- Check if 1-to-1 conversation already exists
  SELECT id INTO v_conv_id
  FROM public.conversations
  WHERE pair_key = v_pair_key;

  IF v_conv_id IS NOT NULL THEN
    RETURN v_conv_id;
  END IF;

  -- Create new 1-to-1 conversation
  INSERT INTO public.conversations (is_group, pair_key)
  VALUES (FALSE, v_pair_key)
  RETURNING id INTO v_conv_id;

  -- Insert both participants atomically
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES
    (v_conv_id, v_current_user),
    (v_conv_id, other_user_id);

  RETURN v_conv_id;
END;
$$;

-- ATOMIC POST LIKE TOGGLE FUNCTION (SECURITY DEFINER)
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

-- Lock down EXECUTE permissions on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.start_conversation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_conversation(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.toggle_post_like(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_post_like(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.update_group_members_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_post_likes_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_post_comments_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_conversation_timestamp() FROM PUBLIC;

-- ============================================================================
-- HELPER SECURITY DEFINER FUNCTION FOR RLS (PREVENTS INFINITE RECURSION)
-- ============================================================================

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

REVOKE ALL ON FUNCTION public.is_conversation_participant(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(UUID) TO authenticated;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 1. GROUPS POLICIES
CREATE POLICY "Groups readable by authenticated users"
  ON public.groups FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Group creation by authenticated users"
  ON public.groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group updates by creator"
  ON public.groups FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- 2. GROUP MEMBERS POLICIES
CREATE POLICY "Group members list readable by authenticated users"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can join group as self"
  ON public.group_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave group"
  ON public.group_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 3. COMMUNITY POSTS POLICIES (Public Read / Member-Only Posting for Group Posts)
CREATE POLICY "Posts readable by authenticated users"
  ON public.community_posts FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Posts insertable by author (group member check if group post)"
  ON public.community_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    (
      group_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_id = community_posts.group_id AND user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Posts updatable by author"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Posts deletable by author"
  ON public.community_posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- 4. POST COMMENTS POLICIES
CREATE POLICY "Comments readable by authenticated users"
  ON public.post_comments FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Comments insertable by author"
  ON public.post_comments FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Comments deletable by author"
  ON public.post_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- 5. POST LIKES POLICIES
CREATE POLICY "Likes readable by authenticated users"
  ON public.post_likes FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Likes insertable by user"
  ON public.post_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Likes deletable by user"
  ON public.post_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 6. CONVERSATIONS POLICIES (Strict Participant Privacy via Helper)
CREATE POLICY "Conversations readable by participants"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (public.is_conversation_participant(id));

-- 7. CONVERSATION PARTICIPANTS POLICIES
-- NOTE: No client-side INSERT policy exists for conversation_participants.
-- All participants are inserted via the SECURITY DEFINER RPC function `start_conversation()`.
CREATE POLICY "Conversation participants readable by co-participants"
  ON public.conversation_participants FOR SELECT
  TO authenticated
  USING (public.is_conversation_participant(conversation_id));

-- 8. MESSAGES POLICIES (Strict Participant Privacy via Helper)
CREATE POLICY "Messages readable by conversation participants"
  ON public.messages FOR SELECT
  TO authenticated
  USING (public.is_conversation_participant(conversation_id));

CREATE POLICY "Messages insertable by conversation participants"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    public.is_conversation_participant(conversation_id)
  );

-- ============================================================================
-- ADD TABLES TO SUPABASE REALTIME PUBLICATION
-- ============================================================================

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
