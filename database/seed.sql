-- Insert an initial admin user
-- Password is 'password123'
INSERT INTO users (full_name, email, password_hash, role)
VALUES (
    'System Admin',
    'admin@shriammanagro.com',
    '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa',
    'Admin'
) ON CONFLICT (email) DO NOTHING;
