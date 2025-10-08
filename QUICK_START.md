# Quick Start Guide

## Setup Complete!

Your IIPS Fitness & Yoga Club application is now fully integrated with Supabase.

## Create Admin User (Required)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: Authentication → Users → Add user
4. Create user:
   - Email: `yogafitness@gmail.com`
   - Password: `Yoga@2024`
   - **Enable "Auto Confirm User"**

5. Run this SQL (in SQL Editor):
```sql
INSERT INTO users (id, email, name, phone, student_id, role)
SELECT id, 'yogafitness@gmail.com', 'Admin User', '9876543210', 'ADMIN001', 'admin'
FROM auth.users WHERE email = 'yogafitness@gmail.com'
ON CONFLICT (id) DO NOTHING;
```

## Test the Application

1. Start dev server: `npm run dev`
2. Go to `/login` and login as admin
3. Or go to `/register` to create a new student account

## User Types

- **Admin**: Full control (yogafitness@gmail.com)
- **Student**: IIPS students
- **Other**: External users (faculty, staff)

## Key Features

✓ User registration with role selection
✓ Secure authentication with Supabase
✓ User dashboard with bookings
✓ Real-time notifications
✓ Event booking system
✓ Admin panel for management
✓ Payment integration ready

See `SETUP_GUIDE.md` for detailed documentation.
