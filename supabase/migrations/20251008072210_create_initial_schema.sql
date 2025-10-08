/*
  # Initial Database Schema for IIPS Fitness & Yoga Club

  ## Overview
  This migration creates the complete database schema for the fitness and yoga club management system.

  ## New Tables
  
  ### 1. users
  Stores user information for students, other users, and admin
  - `id` (uuid, primary key) - Unique identifier
  - `email` (text, unique) - User email address
  - `name` (text) - Full name
  - `phone` (text) - Phone number
  - `student_id` (text) - Student/User ID number
  - `role` (text) - User role: student, other, or admin
  - `created_at` (timestamptz) - Registration timestamp
  
  ### 2. events
  Stores yoga and fitness event information
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Event title
  - `description` (text) - Event description
  - `date` (date) - Event date
  - `time` (text) - Event time
  - `location` (text) - Event location
  - `max_participants` (integer) - Maximum capacity
  - `current_participants` (integer) - Current registrations
  - `price` (numeric) - Event price (0 for free)
  - `image` (text) - Event image URL
  - `type` (text) - Event type: upcoming or previous
  - `instructor` (text) - Instructor name
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 3. bookings
  Stores event booking information
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References users table
  - `event_id` (uuid, foreign key) - References events table
  - `booking_date` (timestamptz) - Booking timestamp
  - `payment_status` (text) - Status: pending, completed, or failed
  - `payment_id` (text) - Payment transaction ID
  - `amount` (numeric) - Payment amount
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 4. notifications
  Stores user notifications
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References users table
  - `title` (text) - Notification title
  - `message` (text) - Notification message
  - `type` (text) - Type: booking, event, or system
  - `read` (boolean) - Read status
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Policies for authenticated users to read their own data
  - Policies for admin users to manage all data
  - Public read access for events
  
  ## Important Notes
  1. All tables use UUID primary keys with automatic generation
  2. Timestamps are automatically set on creation
  3. Foreign key constraints ensure data integrity
  4. RLS policies protect user data
  5. Default values prevent null issues
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  student_id text NOT NULL,
  role text NOT NULL DEFAULT 'student',
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  location text NOT NULL,
  max_participants integer NOT NULL DEFAULT 0,
  current_participants integer NOT NULL DEFAULT 0,
  price numeric NOT NULL DEFAULT 0,
  image text DEFAULT '',
  type text NOT NULL DEFAULT 'upcoming',
  instructor text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  booking_date timestamptz DEFAULT now(),
  payment_status text NOT NULL DEFAULT 'pending',
  payment_id text DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'system',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Events policies
CREATE POLICY "Anyone can read events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Bookings policies
CREATE POLICY "Users can read own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can read all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin can update all bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Insert sample events
INSERT INTO events (title, description, date, time, location, max_participants, current_participants, price, image, type, instructor)
VALUES
  ('Morning Yoga Session', 'Start your day with energizing yoga poses and breathing exercises.', '2025-10-20', '07:00', 'IIPS Yoga Hall', 50, 12, 0, 'https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg', 'upcoming', 'Mrs. Manju Suchdeo'),
  ('Meditation Workshop', 'Learn mindfulness and meditation techniques for stress relief.', '2025-10-25', '16:00', 'IIPS Meditation Center', 40, 8, 50, 'https://images.pexels.com/photos/3820394/pexels-photo-3820394.jpeg', 'upcoming', 'Mrs. Manju Suchdeo'),
  ('Advanced Yoga Workshop', 'Advanced yoga poses and techniques for experienced practitioners.', '2025-11-05', '08:00', 'IIPS Yoga Hall', 25, 5, 150, 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg', 'upcoming', 'Mrs. Manju Suchdeo'),
  ('Fitness Boot Camp', 'High-intensity workout session for building strength and endurance.', '2025-08-20', '17:00', 'IIPS Sports Ground', 30, 30, 100, 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg', 'previous', 'Dr. Surendra Malviya')
ON CONFLICT DO NOTHING;