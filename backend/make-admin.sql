-- 1) Register a normal account in the app first.
-- 2) Put its email below and run this in the Neon SQL Editor.
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'YOUR_EMAIL@example.com' AND r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

-- optional: remove the STUDENT role so the account is admin only
DELETE FROM user_roles
WHERE user_id = (SELECT id FROM users WHERE email = 'YOUR_EMAIL@example.com')
  AND role_id = (SELECT id FROM roles WHERE name = 'STUDENT');
