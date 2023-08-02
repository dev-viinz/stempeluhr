create table "public"."timetable" (
    "created_at" timestamp with time zone default now(),
    "user_id" uuid default auth.uid(),
    "clock_in" timestamp with time zone not null,
    "clock_out" timestamp with time zone,
    "id" uuid not null default gen_random_uuid()
);


alter table "public"."timetable" enable row level security;

CREATE UNIQUE INDEX timetable_pkey ON public.timetable USING btree (id);

alter table "public"."timetable" add constraint "timetable_pkey" PRIMARY KEY using index "timetable_pkey";

alter table "public"."timetable" add constraint "timetable_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."timetable" validate constraint "timetable_user_id_fkey";

create policy "Enable delete for users based on user_id"
on "public"."timetable"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Enable insert for authenticated users only"
on "public"."timetable"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access per user_id"
on "public"."timetable"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Enable update for users based on id"
on "public"."timetable"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));
