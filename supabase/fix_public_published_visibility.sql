-- Ensure published novels are globally visible (YouTube-style) across all accounts.
-- Safe to run multiple times.

begin;

-- 1) Normalize schema/data for discovery visibility.
alter table public.novels
  add column if not exists is_unlisted boolean;

update public.novels
set is_unlisted = false
where is_unlisted is null;

alter table public.novels
  alter column is_unlisted set default false;

alter table public.novels
  alter column is_unlisted set not null;

-- 2) Recreate select policies with strict public rules for published content.
drop policy if exists "Published novels are viewable by everyone" on public.novels;
drop policy if exists "Authors can view own novels" on public.novels;

create policy "Published novels are viewable by everyone"
  on public.novels
  for select
  using (status = 'published' and coalesce(is_unlisted, false) = false);

create policy "Authors can view own novels"
  on public.novels
  for select
  using (auth.uid() = author_id);

-- Volumes must follow novel visibility rules.
drop policy if exists "Volumes are viewable with novel" on public.volumes;

create policy "Volumes are viewable with novel"
  on public.volumes
  for select
  using (
    exists (
      select 1
      from public.novels n
      where n.id = novel_id
        and (
          n.author_id = auth.uid()
          or (n.status = 'published' and coalesce(n.is_unlisted, false) = false)
        )
    )
  );

-- Chapters must follow novel visibility rules.
drop policy if exists "Chapters are viewable with novel" on public.chapters;

create policy "Chapters are viewable with novel"
  on public.chapters
  for select
  using (
    exists (
      select 1
      from public.novels n
      where n.id = novel_id
        and (
          n.author_id = auth.uid()
          or (n.status = 'published' and coalesce(n.is_unlisted, false) = false)
        )
    )
  );

commit;
