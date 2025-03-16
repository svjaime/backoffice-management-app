-- Migration number: 0003 	 2025-03-16T03:19:15.337Z
-- SEED: Transactions
INSERT INTO "Transaction" (type, subType, amount, status, description, userId, createdAt, updatedAt) VALUES
    ('deposit', 'reward', 150.75, 'completed', 'Monthly bonus', (SELECT id FROM "User" WHERE email = 'user@test.com'), '2025-03-15T14:23:45.123Z', '2025-03-15T14:23:45.123Z'),
    ('credit', 'purchase', 50.25, 'completed', 'Online shopping', (SELECT id FROM "User" WHERE email = 'user@test.com'), '2025-03-14T09:12:30.456Z', '2025-03-14T09:12:30.456Z'),
    ('deposit', 'refund', 20.00, 'pending', 'Refund from store', (SELECT id FROM "User" WHERE email = 'user@test.com'), '2025-03-13T16:45:20.789Z', '2025-03-13T16:45:20.789Z'),
    ('credit', 'reward', 75.50, 'completed', 'Loyalty program', (SELECT id FROM "User" WHERE email = 'user@test.com'), '2025-03-12T10:10:10.123Z', '2025-03-12T10:10:10.123Z'),
    ('deposit', 'purchase', 120.00, 'failed', 'Failed transaction', (SELECT id FROM "User" WHERE email = 'user@test.com'), '2025-03-05T18:30:55.987Z', '2025-03-05T18:30:55.987Z'),
    ('credit', 'refund', 30.00, 'completed', 'Product return', (SELECT id FROM "User" WHERE email = 'user@test.com'), '2025-03-02T12:20:40.456Z', '2025-03-02T12:20:40.456Z'),
    ('deposit', 'reward', 200.00, 'completed', 'Performance incentive', (SELECT id FROM "User" WHERE email = 'user@test.com'), '2025-02-25T08:15:25.678Z', '2025-02-25T08:15:25.678Z'),
    ('credit', 'purchase', 80.75, 'pending', 'Subscription renewal', (SELECT id FROM "User" WHERE email = 'user@test.com'), '2025-02-20T14:50:30.321Z', '2025-02-20T14:50:30.321Z'),
    ('deposit', 'refund', 45.00, 'completed', 'Overcharge correction', (SELECT id FROM "User" WHERE email = 'user@test.com'), '2025-02-10T11:40:15.987Z', '2025-02-10T11:40:15.987Z'),
    ('credit', 'reward', 60.00, 'completed', 'Referral bonus', (SELECT id FROM "User" WHERE email = 'user@test.com'), '2025-01-30T20:05:10.654Z', '2025-01-30T20:05:10.654Z');
