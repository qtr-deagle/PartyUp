-- list_all_trips_admin referenced t.organizer_id, but public.trips has no such
-- column (it's creator_id) -- this RPC would raise "column t.organizer_id
-- does not exist" if actually invoked. Fixing it here since trip monitoring
-- keeps this RPC around for the historical/completed-trips search case.
create or replace function public.list_all_trips_admin(p_search text default null)
returns table (
  id uuid,
  title text,
  trip_type text,
  origin text,
  destination text,
  start_at timestamptz,
  status text,
  seats_total int,
  seats_available int,
  organizer_id uuid,
  organizer_display_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff_or_admin() then
    raise exception 'Not authorized';
  end if;

  return query
  select
    t.id,
    t.title,
    t.trip_type,
    t.origin,
    t.destination,
    t.start_at,
    t.status,
    t.seats_total,
    t.seats_available,
    t.creator_id as organizer_id,
    p.display_name as organizer_display_name
  from public.trips t
  join public.profiles p on p.id = t.creator_id
  where
    p_search is null
    or t.title ilike '%' || p_search || '%'
    or t.origin ilike '%' || p_search || '%'
    or t.destination ilike '%' || p_search || '%'
    or p.display_name ilike '%' || p_search || '%'
  order by t.created_at desc;
end;
$$;

grant execute on function public.list_all_trips_admin(text) to authenticated;

-- Trip monitoring dashboard: active/ongoing trips plus a rollup of the
-- safety-critical signals (open reports, active Warning Mode sessions, active
-- SOS alerts) that list_all_trips_admin never surfaced. SOS trips are sorted
-- to the top regardless of start time -- that's what gives staff visual
-- priority on the alert without relying on client-side sorting alone.
create or replace function public.list_active_trips_with_safety_status(
  p_search text default null,
  p_include_completed boolean default false
)
returns table (
  id uuid,
  title text,
  trip_type text,
  origin text,
  destination text,
  destination_lat numeric,
  destination_lng numeric,
  start_at timestamptz,
  end_at timestamptz,
  status text,
  seats_total int,
  seats_available int,
  organizer_id uuid,
  organizer_display_name text,
  members_accepted_count int,
  open_report_count int,
  active_safety_session_count int,
  active_sos_count int,
  latest_sos_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff_or_admin() then
    raise exception 'Not authorized';
  end if;

  return query
  select
    t.id,
    t.title,
    t.trip_type,
    t.origin,
    t.destination,
    t.destination_lat,
    t.destination_lng,
    t.start_at,
    t.end_at,
    t.status,
    t.seats_total,
    t.seats_available,
    t.creator_id as organizer_id,
    p.display_name as organizer_display_name,
    (select count(*)::int from public.trip_members tm where tm.trip_id = t.id and tm.status = 'accepted') as members_accepted_count,
    (select count(*)::int from public.reports r where r.trip_id = t.id and r.status = 'open') as open_report_count,
    (select count(*)::int from public.safety_sessions ss where ss.trip_id = t.id and ss.status = 'monitoring') as active_safety_session_count,
    (select count(*)::int from public.sos_alerts sa where sa.trip_id = t.id and sa.status = 'active') as active_sos_count,
    (select max(sa.created_at) from public.sos_alerts sa where sa.trip_id = t.id and sa.status = 'active') as latest_sos_at
  from public.trips t
  join public.profiles p on p.id = t.creator_id
  where
    (p_include_completed or t.status in ('open', 'full', 'ongoing'))
    and (
      p_search is null
      or t.title ilike '%' || p_search || '%'
      or t.origin ilike '%' || p_search || '%'
      or t.destination ilike '%' || p_search || '%'
      or p.display_name ilike '%' || p_search || '%'
    )
  order by
    (select count(*) from public.sos_alerts sa where sa.trip_id = t.id and sa.status = 'active') > 0 desc,
    (select max(sa.created_at) from public.sos_alerts sa where sa.trip_id = t.id and sa.status = 'active') desc nulls last,
    t.start_at asc nulls last;
end;
$$;

grant execute on function public.list_active_trips_with_safety_status(text, boolean) to authenticated;
