
-- Delete all existing users and related data in correct order to avoid foreign key violations
DELETE FROM public.user_sports_profiles;
DELETE FROM public.user_availability;
DELETE FROM public.player_reviews;
DELETE FROM public.game_invitations;
DELETE FROM public.games;
DELETE FROM public.reviews;
DELETE FROM public.bookings;
DELETE FROM public.user_profiles;
DELETE FROM public.profiles;

-- Now delete users from auth.users (this should work now that all references are gone)
DELETE FROM auth.users;

-- Reset any sequences if needed
ALTER SEQUENCE IF EXISTS public.profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.user_profiles_id_seq RESTART WITH 1;
