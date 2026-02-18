-- Add group_id to gallery_items for nested/grouped uploads
ALTER TABLE gallery_items
ADD COLUMN IF NOT EXISTS group_id UUID;
-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_gallery_items_group_id ON gallery_items(group_id);
-- Optional: Comment explaining the column
COMMENT ON COLUMN gallery_items.group_id IS 'UUID shared by all items in the same upload batch/group';