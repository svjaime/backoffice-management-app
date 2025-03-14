-- Migration number: 0002 	 2025-03-14T17:50:12.849Z

-- SEED: Insert permission
INSERT INTO "Permission" (name) VALUES ('manage_transactions');

-- SEED: Assign permission for 'admin'
INSERT INTO "_RolePermissions" (A, B) VALUES
    ((SELECT id FROM "Permission" WHERE name = 'manage_transactions'), (SELECT id FROM "Role" WHERE name = 'admin'));

-- SEED: Insert users
INSERT INTO "User" (name, email, password, roleId, updatedAt) VALUES
    ('John Doez', 'admin@test.com', '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', (SELECT id FROM "Role" WHERE name = 'admin'), '2025-03-10T11:23:15.492Z'),
    ('John Doez', 'user@test.com', '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', (SELECT id FROM "Role" WHERE name = 'user'), '2025-03-10T11:23:15.492Z');
