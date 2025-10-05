-- Add parent_id to categories table
ALTER TABLE categories
ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Create index for better performance on parent_id lookups
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Add a function to get all descendant categories
CREATE OR REPLACE FUNCTION get_category_descendants(root_id UUID)
RETURNS TABLE (
  id UUID,
  parent_id UUID,
  name TEXT,
  type TEXT,
  color TEXT,
  level INT
) AS $$
WITH RECURSIVE descendants AS (
  -- Base case: get the root category
  SELECT 
    c.id,
    c.parent_id,
    c.name,
    c.type,
    c.color,
    0 as level
  FROM categories c
  WHERE c.id = root_id

  UNION ALL

  -- Recursive case: get all children
  SELECT 
    c.id,
    c.parent_id,
    c.name,
    c.type,
    c.color,
    d.level + 1
  FROM categories c
  INNER JOIN descendants d ON c.parent_id = d.id
)
SELECT * FROM descendants;
$$ LANGUAGE sql;
