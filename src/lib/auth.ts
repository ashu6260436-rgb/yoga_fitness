import { supabase } from './supabase';
import { db, User } from './database';

export class AuthService {
  private static readonly USER_KEY = 'user';

  static async login(email: string, password: string): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);

    const user = await db.getUserById(authData.user.id);
    if (!user) throw new Error('User not found');

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    return user;
  }

  static async register(data: {
    name: string;
    email: string;
    phone: string;
    studentId: string;
    password: string;
    role?: string;
  }): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Registration failed');

    const newUser = await db.addUser({
      id: authData.user.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      student_id: data.studentId,
      role: data.role || 'student',
    });

    await db.addNotification({
      user_id: newUser.id,
      title: 'Welcome to IIPS Fitness & Yoga Club!',
      message: `Hi ${newUser.name}, welcome to our community! Browse upcoming events and book your spot.`,
      type: 'system',
      read: false,
    });

    localStorage.setItem(this.USER_KEY, JSON.stringify(newUser));
    return newUser;
  }

  static async logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem(this.USER_KEY);
  }

  static async isAuthenticated(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  }

  static async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  static async refreshUser(): Promise<User | null> {
    const session = await this.getSession();
    if (!session) return null;

    const user = await db.getUserById(session.user.id);
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    return user;
  }

  static async updateProfile(data: { name: string; phone: string }): Promise<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const updatedUser = await db.updateUser(currentUser.id, {
      name: data.name,
      phone: data.phone,
    });

    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }

  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw new Error(error.message);
  }
}