-- Run this AFTER both people have signed up in the app with these exact emails.
-- It makes these two accounts the ONLY admins.
insert into rr_admins (user_id)
select id from auth.users
where lower(email) in ('paygateway124@gmail.com', 'faraz1020kham@gmail.com')
on conflict do nothing;

-- Safety: remove anyone else from the admin list.
delete from rr_admins
where user_id not in (
  select id from auth.users
  where lower(email) in ('paygateway124@gmail.com', 'faraz1020kham@gmail.com')
);

select u.email, 'admin' as role
from rr_admins a join auth.users u on u.id = a.user_id;   -- should list exactly your 2 emails
