-- =============================================
-- NovelCraft — Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- 1. Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text unique not null,
  display_name text not null default '',
  avatar_url text not null default '',
  bio text not null default '',
  genre_prefs text[] not null default '{}',
  joined_at timestamptz not null default now(),
  follower_count int not null default 0,
  following_count int not null default 0,
  -- Settings
  theme text not null default 'dark',
  editor_font text not null default 'JetBrains Mono',
  editor_font_size int not null default 16,
  reader_background text not null default 'dark',
  reader_font text not null default 'Lora',
  reader_font_size int not null default 18,
  has_completed_onboarding boolean not null default false
);

-- 2. Novels
create table if not exists public.novels (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null default '',
  novel_mode text not null default 'modern' check (novel_mode in ('modern', 'primitive')),
  title text not null default 'Untitled Novel',
  synopsis text not null default '',
  cover_image_url text not null default '',
  genre_tags text[] not null default '{}',
  language text not null default 'English',
  age_rating text not null default 'all' check (age_rating in ('all', 'teen', 'mature')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  total_reads int not null default 0,
  total_words int not null default 0,
  rating_avg numeric(3,1) not null default 0,
  rating_count int not null default 0,
  is_unlisted boolean not null default false
);

alter table public.novels
  add column if not exists novel_mode text not null default 'modern';

alter table public.novels
  drop constraint if exists novels_novel_mode_check;

alter table public.novels
  add constraint novels_novel_mode_check check (novel_mode in ('modern', 'primitive'));

-- 3. Volumes
create table if not exists public.volumes (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  title text not null default 'Volume I',
  banner_image_url text not null default '',
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

-- 4. Chapters
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  volume_id uuid not null references public.volumes(id) on delete cascade,
  novel_id uuid not null references public.novels(id) on delete cascade,
  title text not null default 'Untitled Chapter',
  content text not null default '',
  banner_image_url text not null default '',
  order_index int not null default 0,
  word_count int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  read_count int not null default 0
);

-- 5. Reading Progress
create table if not exists public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  novel_id uuid not null references public.novels(id) on delete cascade,
  chapter_id uuid not null,
  scroll_position numeric not null default 0,
  last_read_at timestamptz not null default now(),
  unique(user_id, novel_id)
);

-- Ensure reading progress cannot reference deleted or missing chapters.
delete from public.reading_progress rp
where not exists (
  select 1
  from public.chapters c
  where c.id = rp.chapter_id
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reading_progress_chapter_id_fkey'
      and conrelid = 'public.reading_progress'::regclass
  ) then
    alter table public.reading_progress
      add constraint reading_progress_chapter_id_fkey
      foreign key (chapter_id)
      references public.chapters(id)
      on delete cascade;
  end if;
end
$$;

-- 6. Reading List
create table if not exists public.reading_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  novel_id uuid not null references public.novels(id) on delete cascade,
  shelf_name text not null default 'Default',
  added_at timestamptz not null default now(),
  progress_status text not null default 'to-read' check (progress_status in ('to-read', 'reading', 'finished', 'on-hold')),
  unique(user_id, novel_id)
);

-- 7. Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  novel_id uuid not null references public.novels(id) on delete cascade,
  user_name text not null default '',
  user_avatar text not null default '',
  rating int not null check (rating between 1 and 5),
  review_text text not null default '',
  created_at timestamptz not null default now(),
  helpful_count int not null default 0,
  unique(user_id, novel_id)
);

-- 8. Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_id uuid not null,
  user_name text not null default '',
  user_avatar text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  parent_comment_id uuid references public.comments(id) on delete cascade,
  is_pinned boolean not null default false
);

-- 9. Characters (Character Bible)
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  name text not null default '',
  role text not null default '',
  physical_description text not null default '',
  personality text not null default '',
  arc_summary text not null default '',
  image_url text not null default ''
);

-- 10. World Entries (World Bible)
create table if not exists public.world_entries (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  name text not null default '',
  category text not null default 'other' check (category in ('location', 'magic-system', 'faction', 'timeline', 'other')),
  description text not null default '',
  image_url text not null default ''
);

-- 11. Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'new-chapter',
  message text not null default '',
  link text not null default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 12. Follows
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(follower_id, following_id)
);

-- =============================================
-- Indexes for performance
-- =============================================
create index if not exists idx_novels_author on public.novels(author_id);
create index if not exists idx_novels_status on public.novels(status);
create index if not exists idx_novels_discovery on public.novels(status, is_unlisted, updated_at desc, created_at desc);
create index if not exists idx_volumes_novel on public.volumes(novel_id);
create index if not exists idx_chapters_volume on public.chapters(volume_id);
create index if not exists idx_chapters_novel on public.chapters(novel_id);
create index if not exists idx_reading_progress_user on public.reading_progress(user_id);
create index if not exists idx_reading_list_user on public.reading_list(user_id);
create index if not exists idx_reviews_novel on public.reviews(novel_id);
create index if not exists idx_comments_chapter on public.comments(chapter_id);
create index if not exists idx_characters_novel on public.characters(novel_id);
create index if not exists idx_world_entries_novel on public.world_entries(novel_id);
create index if not exists idx_notifications_user on public.notifications(user_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
alter table public.profiles enable row level security;
alter table public.novels enable row level security;
alter table public.volumes enable row level security;
alter table public.chapters enable row level security;
alter table public.reading_progress enable row level security;
alter table public.reading_list enable row level security;
alter table public.reviews enable row level security;
alter table public.comments enable row level security;
alter table public.characters enable row level security;
alter table public.world_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.follows enable row level security;

-- Profiles: users can read any profile, update only their own
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Novels: published novels are public, users can CRUD their own
create policy "Published novels are viewable by everyone" on public.novels for select using (status = 'published' and coalesce(is_unlisted, false) = false);
create policy "Authors can view own novels" on public.novels for select using (auth.uid() = author_id);
create policy "Authors can insert own novels" on public.novels for insert with check (auth.uid() = author_id);
create policy "Authors can update own novels" on public.novels for update using (auth.uid() = author_id);
create policy "Authors can delete own novels" on public.novels for delete using (auth.uid() = author_id);

-- Volumes: viewable if novel is accessible, editable by novel author
create policy "Volumes are viewable with novel" on public.volumes for select using (
  exists (
    select 1 from public.novels n
    where n.id = novel_id
      and (
        n.author_id = auth.uid()
        or (n.status = 'published' and coalesce(n.is_unlisted, false) = false)
      )
  )
);
create policy "Authors can manage volumes" on public.volumes for insert with check (
  exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid())
);
create policy "Authors can update volumes" on public.volumes for update using (
  exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid())
);
create policy "Authors can delete volumes" on public.volumes for delete using (
  exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid())
);

-- Chapters: same pattern as volumes
create policy "Chapters are viewable with novel" on public.chapters for select using (
  exists (
    select 1 from public.novels n
    where n.id = novel_id
      and (
        n.author_id = auth.uid()
        or (n.status = 'published' and coalesce(n.is_unlisted, false) = false)
      )
  )
);
create policy "Authors can manage chapters" on public.chapters for insert with check (
  exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid())
);
create policy "Authors can update chapters" on public.chapters for update using (
  exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid())
);
create policy "Authors can delete chapters" on public.chapters for delete using (
  exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid())
);

-- Reading Progress: users can only manage their own
create policy "Users can view own reading progress" on public.reading_progress for select using (auth.uid() = user_id);
create policy "Users can insert own reading progress" on public.reading_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own reading progress" on public.reading_progress for update using (auth.uid() = user_id);

-- Reading List: users can only manage their own
create policy "Users can view own reading list" on public.reading_list for select using (auth.uid() = user_id);
create policy "Users can insert own reading list" on public.reading_list for insert with check (auth.uid() = user_id);
create policy "Users can delete own reading list items" on public.reading_list for delete using (auth.uid() = user_id);

-- Reviews: viewable by all, manageable by author
create policy "Reviews are viewable by everyone" on public.reviews for select using (true);
create policy "Users can insert own reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on public.reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

-- Comments: viewable by all, manageable by author
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Users can insert own comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can update own comments" on public.comments for update using (auth.uid() = user_id);
create policy "Users can delete own comments" on public.comments for delete using (auth.uid() = user_id);

-- Characters: only novel author can manage
create policy "Characters viewable with novel" on public.characters for select using (
  exists (select 1 from public.novels n where n.id = novel_id and (n.author_id = auth.uid() or n.status = 'published'))
);
create policy "Authors can manage characters" on public.characters for insert with check (
  exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid())
);
create policy "Authors can update characters" on public.characters for update using (
  exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid())
);
create policy "Authors can delete characters" on public.characters for delete using (
  exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid())
);

-- World Entries: same as characters
create policy "World entries viewable with novel" on public.world_entries for select using (
  exists (select 1 from public.novels n where n.id = novel_id and (n.author_id = auth.uid() or n.status = 'published'))
);
create policy "Authors can manage world entries" on public.world_entries for insert with check (
  exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid())
);
create policy "Authors can update world entries" on public.world_entries for update using (
  exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid())
);
create policy "Authors can delete world entries" on public.world_entries for delete using (
  exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid())
);

-- Notifications: users can only see their own
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications" on public.notifications for insert with check (true);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Follows
create policy "Follows are viewable by everyone" on public.follows for select using (true);
create policy "Users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- =============================================
-- Auto-create profile on signup trigger
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, display_name, joined_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- Helper function: update novel updated_at
-- =============================================
create or replace function public.update_novel_timestamp()
returns trigger as $$
begin
  update public.novels set updated_at = now() where id = new.novel_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_chapter_change on public.chapters;
create trigger on_chapter_change
  after insert or update on public.chapters
  for each row execute procedure public.update_novel_timestamp();

drop trigger if exists on_volume_change on public.volumes;
create trigger on_volume_change
  after insert or update on public.volumes
  for each row execute procedure public.update_novel_timestamp();
