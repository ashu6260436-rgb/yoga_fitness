# IIPS Fitness & Yoga Club - Setup Complete

Your application has been successfully configured with Supabase database and authentication!

## Database Setup

The following tables have been created in your Supabase database:

1. **users** - Stores user profiles with role management
2. **events** - Stores yoga and fitness events
3. **bookings** - Tracks event registrations
4. **notifications** - User notification system

Sample events have been automatically added to the database.

## User Roles

The application supports three user roles:

1. **Admin** - Full access to manage events, users, and view all data
2. **Student** - IIPS students who can register and book events
3. **Other** - External users (faculty, staff, etc.) who can also participate

## Creating Users

### To Create Admin User:

Since Supabase Auth requires email verification to be configured, you need to create users through the Supabase Dashboard:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Authentication → Users
4. Click "Add user" → "Create new user"
5. Create admin user:
   - Email: `yogafitness@gmail.com`
   - Password: `Yoga@2024`
   - Auto Confirm User: **YES** (important!)
6. After creating the auth user, run this SQL in the SQL Editor:

```sql
-- Insert admin user profile
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
ON CONFLICT (id) DO NOTHING;
```

### To Create Sample Student User:

1. In Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Create student user:
   - Email: `student@iips.edu`
   - Password: `Student@123`
   - Auto Confirm User: **YES**
4. Run this SQL:

```sql
-- Insert student user profile
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
ON CONFLICT (id) DO NOTHING;

-- Add welcome notification
INSERT INTO notifications (user_id, title, message, type, read)
SELECT
  id,
  'Welcome to IIPS Fitness & Yoga Club!',
  'Hi Rahul, welcome to our community! Browse upcoming events and book your spot.',
  'system',
  false
FROM auth.users
WHERE email = 'student@iips.edu';
```

## Features Implemented

### For Students/Users:
- User registration with student/other user type selection
- Secure login and authentication
- Dashboard showing profile and booking statistics
- Browse and book events
- View booked events with all details
- Real-time notifications system
- Notification bell with unread count
- Payment integration for paid events

### For Admin:
- Admin dashboard with statistics
- Manage events (create, edit, delete)
- View all users and their bookings
- User management with role assignment
- Email history tracking

## Login Credentials

After setting up users in Supabase:

**Admin Login:**
- URL: `/login` or `/admin`
- Email: yogafitness@gmail.com
- Password: Yoga@2024

**Sample Student Login:**
- URL: `/login`
- Email: student@iips.edu
- Password: Student@123

## Registration Flow

New users can register at `/register`:
1. Choose user type (Student or Other User)
2. Fill in personal details
3. Create password
4. Automatically logged in after registration
5. Receive welcome notification

## Important Notes

1. **Email Confirmation**: Since this is for local development, email confirmation is disabled. Users are automatically confirmed when created.

2. **Row Level Security (RLS)**: All tables have RLS enabled with proper policies to ensure data security.

3. **Notifications**: Users receive notifications for:
   - Welcome message on registration
   - Booking confirmations
   - Event updates (future feature)

4. **Environment Variables**: Your `.env` file has been updated with your Supabase credentials.

## Next Steps

1. Create the admin and student users in Supabase Dashboard as described above
2. Start the development server: `npm run dev`
3. Navigate to the application
4. Test the registration flow by creating a new user
5. Login with admin credentials to access admin panel

## Database Schema

The database uses proper foreign keys and indexes for optimal performance:
- All tables use UUID primary keys
- Timestamps are automatically managed
- Indexes on frequently queried fields
- Cascading deletes for data integrity

Enjoy your IIPS Fitness & Yoga Club application!
