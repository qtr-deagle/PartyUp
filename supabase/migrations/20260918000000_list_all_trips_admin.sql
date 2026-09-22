-- Admin/staff-wide trip listing for AdminTrips.tsx and StaffTrips.tsx.
-- Existing RPCs (list_my_trips, list_browse_trips) are scoped to the calling
-- user's own trips/public trips; this one is unrestricted by ownership but
-- gated to staff/admin roles, matching the role-check pattern used by
-- review_id_verification for other privileged actions.
--
-- Run this in the Supabase SQL editor (or `supabase db push`) before
-- adminTrips.listAllTrips() will return data.

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
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  ) then
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
    t.organizer_id,
    p.display_name as organizer_display_name
  from public.trips t
  join public.profiles p on p.id = t.organizer_id
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
