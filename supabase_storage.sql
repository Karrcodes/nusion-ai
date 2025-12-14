-- Create a storage bucket for restaurant assets
insert into storage.buckets (id, name, public)
values ('restaurant-assets', 'restaurant-assets', true);

-- Policy to allow authenticated uploads
create policy "Authenticated users can upload images"
on storage.objects for insert
with check ( bucket_id = 'restaurant-assets' and auth.role() = 'authenticated' );

-- Policy to allow public access to images
create policy "Anyone can view images"
on storage.objects for select
using ( bucket_id = 'restaurant-assets' );
