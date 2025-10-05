-- Add parent_id column to categories table
ALTER TABLE categories
ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Add a path column to store the hierarchical path (optional, helps with querying)
ALTER TABLE categories
ADD COLUMN path TEXT[];

-- Create a function to update the path
CREATE OR REPLACE FUNCTION update_category_path()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.path := ARRAY[NEW.id::text];
    ELSE
        SELECT path || NEW.id::text INTO NEW.path
        FROM categories
        WHERE id = NEW.parent_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the path
CREATE TRIGGER category_path_trigger
    BEFORE INSERT OR UPDATE OF parent_id
    ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_category_path();
