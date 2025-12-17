-- Default Income Categories
INSERT INTO categories (name, type, is_default, icon) VALUES 
('Gaji', 'income', TRUE, 'briefcase'),
('Bonus', 'income', TRUE, 'gift'),
('Investasi', 'income', TRUE, 'trending-up');

-- Default Expense Categories
INSERT INTO categories (name, type, is_default, icon) VALUES 
('Makanan', 'expense', TRUE, 'utensils'),
('Transport', 'expense', TRUE, 'bus'),
('Hiburan', 'expense', TRUE, 'film'),
('Belanja', 'expense', TRUE, 'shopping-cart'),
('Tagihan', 'expense', TRUE, 'file-text'),
('Kesehatan', 'expense', TRUE, 'heart'),
('Pendidikan', 'expense', TRUE, 'book');
