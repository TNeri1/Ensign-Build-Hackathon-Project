-- Every item can have a short public name ("iPhone", "AirPods case"), shown as its heading.
ALTER TABLE items ADD COLUMN name TEXT;
-- The 'other' category used to keep this as an attribute (item_type); move it into the column.
UPDATE items SET name = (SELECT value FROM item_attributes a WHERE a.item_id = items.id AND a.key = 'item_type')
 WHERE category = 'other';
DELETE FROM item_attributes WHERE key = 'item_type' AND item_id IN (SELECT id FROM items WHERE category = 'other');
