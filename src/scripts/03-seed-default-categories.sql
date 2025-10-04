-- Insert default categories for new users
-- This script should be run after a user signs up, or you can create a trigger

-- Default expense categories
INSERT INTO categories (user_id, name, type, color) VALUES
  (auth.uid(), 'Food & Dining', 'expense', '#ef4444'),
  (auth.uid(), 'Transportation', 'expense', '#f59e0b'),
  (auth.uid(), 'Shopping', 'expense', '#8b5cf6'),
  (auth.uid(), 'Entertainment', 'expense', '#ec4899'),
  (auth.uid(), 'Bills & Utilities', 'expense', '#3b82f6'),
  (auth.uid(), 'Healthcare', 'expense', '#10b981'),
  (auth.uid(), 'Other', 'expense', '#6b7280');

-- Default income categories
INSERT INTO categories (user_id, name, type, color) VALUES
  (auth.uid(), 'Salary', 'income', '#22c55e'),
  (auth.uid(), 'Freelance', 'income', '#14b8a6'),
  (auth.uid(), 'Investment', 'income', '#06b6d4'),
  (auth.uid(), 'Other Income', 'income', '#84cc16');
