import { supabase } from '../lib/supabase';

async function setupUsers() {
  console.log('Setting up users...');

  try {
    console.log('\n1. Creating admin user...');
    const { data: adminAuth, error: adminAuthError } = await supabase.auth.signUp({
      email: 'yogafitness@gmail.com',
      password: 'Yoga@2024',
    });

    if (adminAuthError) {
      console.error('Admin auth error:', adminAuthError.message);
      if (adminAuthError.message.includes('already registered')) {
        console.log('Admin user already exists in auth, continuing...');
      } else {
        throw adminAuthError;
      }
    }

    if (adminAuth.user) {
      const { error: adminUserError } = await supabase
        .from('users')
        .upsert({
          id: adminAuth.user.id,
          email: 'yogafitness@gmail.com',
          name: 'Admin User',
          phone: '9876543210',
          student_id: 'ADMIN001',
          role: 'admin',
        });

      if (adminUserError) {
        console.error('Admin user table error:', adminUserError.message);
      } else {
        console.log('Admin user created successfully!');
        console.log('Email: yogafitness@gmail.com');
        console.log('Password: Yoga@2024');
      }
    }

    console.log('\n2. Creating sample student user...');
    const { data: studentAuth, error: studentAuthError } = await supabase.auth.signUp({
      email: 'student@iips.edu',
      password: 'Student@123',
    });

    if (studentAuthError) {
      console.error('Student auth error:', studentAuthError.message);
      if (studentAuthError.message.includes('already registered')) {
        console.log('Student user already exists in auth, continuing...');
      } else {
        throw studentAuthError;
      }
    }

    if (studentAuth.user) {
      const { error: studentUserError } = await supabase
        .from('users')
        .upsert({
          id: studentAuth.user.id,
          email: 'student@iips.edu',
          name: 'Rahul Sharma',
          phone: '9876543211',
          student_id: 'IIPS2024001',
          role: 'student',
        });

      if (studentUserError) {
        console.error('Student user table error:', studentUserError.message);
      } else {
        console.log('Student user created successfully!');
        console.log('Email: student@iips.edu');
        console.log('Password: Student@123');

        await supabase.from('notifications').insert({
          user_id: studentAuth.user.id,
          title: 'Welcome to IIPS Fitness & Yoga Club!',
          message: 'Hi Rahul, welcome to our community! Browse upcoming events and book your spot.',
          type: 'system',
          read: false,
        });
      }
    }

    console.log('\n Setup completed successfully!');
  } catch (error: any) {
    console.error('Setup error:', error.message);
  }
}

setupUsers();
