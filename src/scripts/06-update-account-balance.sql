-- Function to recalculate account balance based on all transactions
CREATE OR REPLACE FUNCTION recalculate_account_balance(account_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE accounts 
  SET balance = COALESCE(
    (
      SELECT SUM(
        CASE 
          WHEN type = 'income' THEN amount 
          WHEN type = 'expense' THEN -amount
        END
      )
      FROM transactions 
      WHERE account_id = account_id_param
    ),
    0
  )
  WHERE id = account_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to update account balance when a transaction is inserted, updated, or deleted
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new transaction is added
  IF (TG_OP = 'INSERT') THEN
    PERFORM recalculate_account_balance(NEW.account_id);
    RETURN NEW;
  END IF;

  -- When a transaction is updated
  IF (TG_OP = 'UPDATE') THEN
    -- Recalculate for both old and new account if they're different
    IF OLD.account_id != NEW.account_id THEN
      PERFORM recalculate_account_balance(OLD.account_id);
    END IF;
    PERFORM recalculate_account_balance(NEW.account_id);
    RETURN NEW;
  END IF;

  -- When a transaction is deleted
  IF (TG_OP = 'DELETE') THEN
    PERFORM recalculate_account_balance(OLD.account_id);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS transactions_after_insert ON transactions;
DROP TRIGGER IF EXISTS transactions_after_update ON transactions;
DROP TRIGGER IF EXISTS transactions_after_delete ON transactions;

-- Recreate triggers
CREATE TRIGGER transactions_after_insert
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();

CREATE TRIGGER transactions_after_update
AFTER UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();

CREATE TRIGGER transactions_after_delete
AFTER DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();

-- Recalculate all account balances to ensure consistency
DO $$
BEGIN
  PERFORM recalculate_account_balance(id) FROM accounts;
END $$;
