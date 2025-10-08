import { db } from './database';
import { supabase } from './supabase';

class ApiClient {
  events = {
    getAll: async (type?: 'upcoming' | 'previous') => {
      let events = await db.getEvents();
      if (type) {
        events = events.filter(e => e.type === type);
      }
      return { events };
    },

    getUpcoming: async () => {
      const events = await db.getEvents();
      return { events: events.filter(e => e.type === 'upcoming') };
    },

    getPrevious: async () => {
      const events = await db.getEvents();
      return { events: events.filter(e => e.type === 'previous') };
    },

    getById: async (id: string) => {
      const event = await db.getEventById(id);
      if (!event) throw new Error('Event not found');
      return { event };
    },

    create: async (data: {
      title: string;
      description: string;
      date: string;
      time: string;
      location: string;
      maxParticipants: number;
      price: number;
      image?: string;
      type: 'upcoming' | 'previous';
      instructor: string;
    }) => {
      const event = await db.addEvent({
        ...data,
        max_participants: data.maxParticipants,
        current_participants: 0,
        image: data.image || '',
      } as any);
      return { event, message: 'Event created successfully' };
    },

    update: async (
      id: string,
      data: {
        title: string;
        description: string;
        date: string;
        time: string;
        location: string;
        maxParticipants: number;
        price: number;
        image?: string;
        type: 'upcoming' | 'previous';
        instructor: string;
      }
    ) => {
      const event = await db.updateEvent(id, {
        ...data,
        max_participants: data.maxParticipants,
        image: data.image || '',
      } as any);
      return { event, message: 'Event updated successfully' };
    },

    delete: async (id: string) => {
      await db.deleteEvent(id);
      return { message: 'Event deleted successfully' };
    },
  };

  users = {
    getAll: async () => {
      const users = await db.getUsers();
      return { users, count: users.length };
    },

    getStats: async () => {
      const users = await db.getUsers();
      const bookings = await db.getBookings();
      const events = await db.getEvents();
      return {
        stats: {
          totalUsers: users.length,
          totalBookings: bookings.length,
          totalEvents: events.length,
        },
      };
    },

    getById: async (id: string) => {
      const user = await db.getUserById(id);
      if (!user) throw new Error('User not found');
      return { user };
    },

    updateRole: async (id: string, role: 'student' | 'admin' | 'other') => {
      const user = await db.updateUser(id, { role });
      return { user, message: 'Role updated successfully' };
    },

    delete: async (id: string) => {
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) throw error;
      return { message: 'User deleted successfully' };
    },
  };

  bookings = {
    getAll: async () => {
      const bookings = await db.getBookings();
      return { bookings };
    },

    getMy: async () => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) throw new Error('Not authenticated');

      const bookings = await db.getBookingsByUserId(session.data.session.user.id);
      return { bookings };
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Booking not found');
      return { booking: data };
    },

    create: async (eventId: string) => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) throw new Error('Not authenticated');

      const event = await db.getEventById(eventId);
      if (!event) throw new Error('Event not found');

      if (event.current_participants >= event.max_participants) {
        throw new Error('Event is full');
      }

      const booking = await db.addBooking({
        user_id: session.data.session.user.id,
        event_id: eventId,
        booking_date: new Date().toISOString(),
        payment_status: event.price > 0 ? 'pending' : 'completed',
        payment_id: '',
        amount: event.price,
      });

      await db.updateEvent(eventId, {
        current_participants: event.current_participants + 1,
      });

      await db.addNotification({
        user_id: session.data.session.user.id,
        title: 'Booking Confirmed',
        message: `Your booking for "${event.title}" has been confirmed!`,
        type: 'booking',
        read: false,
      });

      return {
        booking,
        requiresPayment: event.price > 0,
        message: 'Booking created successfully',
      };
    },

    initiatePayment: async (bookingId: string) => {
      return {
        success: true,
        paymentUrl: '#',
        orderId: 'ORDER' + Date.now(),
        transactionId: 'TXN' + Date.now(),
      };
    },

    verifyPayment: async (bookingId: string, paymentId: string, orderId: string) => {
      const booking = await db.updateBooking(bookingId, {
        payment_status: 'completed',
        payment_id: paymentId,
      });
      return { booking, message: 'Payment verified successfully' };
    },

    cancel: async (id: string) => {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      return { message: 'Booking cancelled successfully' };
    },
  };
}

export const api = new ApiClient();
