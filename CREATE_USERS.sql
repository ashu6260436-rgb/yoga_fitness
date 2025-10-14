-- IMPORTANT: Create users via Supabase Dashboard first!
-- Go to: Authentication → Users → Add user

-- After creating admin user (yogafitness@gmail.com) in Dashboard, run:
INSERT INTO users (id, email, name, phone, student_id, role)
SELECT
  id,
  'yogafitness@gmail.com',
  'Admin User',
  '9876543210',
  'ADMIN001',
  'admin'
FROM auth.users
WHERE email = 'yogafitness@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  student_id = EXCLUDED.student_id,
  role = EXCLUDED.role;

-- After creating student user (student@iips.edu) in Dashboard, run:
INSERT INTO users (id, email, name, phone, student_id, role)
SELECT
  id,
  'student@iips.edu',
  'Rahul Sharma',
  '9876543211',
  'IIPS2024001',
  'student'
FROM auth.users
WHERE email = 'student@iips.edu'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  student_id = EXCLUDED.student_id,
  role = EXCLUDED.role;

-- Add welcome notification for student
INSERT INTO notifications (user_id, title, message, type, read)
SELECT
  id,
  'Welcome to IIPS Fitness & Yoga Club!',
  'Hi Rahul, welcome to our community! Browse upcoming events and book your spot.',
  'system',
  false
FROM auth.users
WHERE email = 'student@iips.edu'
ON CONFLICT (id) DO NOTHING;

-- Verify users created
SELECT email, name, role FROM users ORDER BY created_at DESC;
