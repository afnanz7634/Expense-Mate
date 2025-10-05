-- Function to update account balance when a transaction is inserted, updated, or deleted
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new transaction is added
  IF (TG_OP = 'INSERT') THEN
    IF NEW.type = 'income' THEN
      UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSE
      UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    END IF;
    RETURN NEW;
  END IF;

  -- When a transaction is updated
  IF (TG_OP = 'UPDATE') THEN
    -- Revert the old transaction effect
    IF OLD.type = 'income' THEN
      UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSE
      UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    END IF;

    -- Apply the new transaction effect
    IF NEW.type = 'income' THEN
      UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSE
      UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    END IF;
    RETURN NEW;
  END IF;

  -- When a transaction is deleted
  IF (TG_OP = 'DELETE') THEN
    IF OLD.type = 'income' THEN
      UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSE
      UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger after insert
CREATE TRIGGER transactions_after_insert
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();

-- Trigger after update
CREATE TRIGGER transactions_after_update
AFTER UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();

-- Trigger after delete
CREATE TRIGGER transactions_after_delete
AFTER DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();
