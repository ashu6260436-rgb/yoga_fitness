import { supabase } from './supabase';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_participants: number;
  current_participants: number;
  price: number;
  image: string;
  type: 'previous' | 'upcoming';
  instructor: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  student_id: string;
  role: string;
}

export interface Booking {
  id: string;
  user_id: string;
  event_id: string;
  booking_date: string;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_id: string;
  amount: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'event' | 'system';
  read: boolean;
  created_at: string;
}

class SupabaseDatabase {
  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async addEvent(event: Omit<Event, 'id'>): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEvent(eventId: string, updatedEvent: Partial<Event>): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .update(updatedEvent)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  }

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async addUser(user: Omit<User, 'id'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(userId: string, updatedUser: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updatedUser)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getBookingsByUserId(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        events (
          title,
          date,
          time,
          location,
          instructor,
          image
        )
      `)
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBooking(bookingId: string, updatedBooking: Partial<Booking>): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update(updatedBooking)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  }
}

export const db = new SupabaseDatabase();