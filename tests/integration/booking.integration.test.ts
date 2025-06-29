import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender, mockFetch, createMockResponse, createMockErrorResponse } from '../utils/test-utils';
import { mockBookings, mockClasses, mockUsers, mockInstructors } from '../utils/mock-data';
import BookingsPage from '@/pages/BookingsPage';

describe('Booking Management Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Bookings List', () => {
    it('should display list of bookings', async () => {
      // Mock bookings API response
      mockFetch([
        {
          url: '/bookings',
          response: createMockResponse(mockBookings),
        },
      ]);

      customRender(<BookingsPage />, { isAuthenticated: true });

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText('Morning Yoga Flow')).toBeInTheDocument();
        expect(screen.getByText('HIIT Training')).toBeInTheDocument();
      });

      // Check booking details
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Sarah Wilson')).toBeInTheDocument();
      expect(screen.getByText('Mike Chen')).toBeInTheDocument();
    });

    it('should filter bookings by date', async () => {
      const user = userEvent.setup();
      
      // Mock filtered bookings response
      mockFetch([
        {
          url: /\/bookings$/,
          response: createMockResponse(mockBookings),
        },
        {
          url: /\/bookings\?date=2024-06-30/,
          response: createMockResponse([]), // No bookings for this date
        },
      ]);

      customRender(<BookingsPage />, { isAuthenticated: true });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Morning Yoga Flow')).toBeInTheDocument();
      });

      // Change date filter
      const dateInput = screen.getByLabelText(/date/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2024-06-30');

      // Check no bookings message
      await waitFor(() => {
        expect(screen.getByText(/no bookings found/i)).toBeInTheDocument();
      });
    });

    it('should filter bookings by status', async () => {
      const user = userEvent.setup();
      
      // Mock filtered bookings
      const cancelledBooking = {
        ...mockBookings[0],
        id: '3',
        status: 'cancelled',
      };

      mockFetch([
        {
          url: /\/bookings$/,
          response: createMockResponse(mockBookings),
        },
        {
          url: /\/bookings\?.*status=cancelled/,
          response: createMockResponse([cancelledBooking]),
        },
      ]);

      customRender(<BookingsPage />, { isAuthenticated: true });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Morning Yoga Flow')).toBeInTheDocument();
      });

      // Apply status filter
      const statusFilter = screen.getByRole('combobox', { name: /status/i });
      await user.click(statusFilter);
      
      const cancelledOption = screen.getByRole('option', { name: /cancelled/i });
      await user.click(cancelledOption);

      // Check filtered results
      await waitFor(() => {
        expect(screen.getAllByText(/cancelled/i)).toHaveLength(1);
        expect(screen.queryByText(/confirmed/i)).not.toBeInTheDocument();
      });
    });

    it('should filter bookings by instructor', async () => {
      const user = userEvent.setup();
      
      mockFetch([
        {
          url: /\/bookings$/,
          response: createMockResponse(mockBookings),
        },
        {
          url: /\/instructors$/,
          response: createMockResponse(mockInstructors),
        },
        {
          url: /\/bookings\?.*instructor=1/,
          response: createMockResponse([mockBookings[0]]), // Only yoga class
        },
      ]);

      customRender(<BookingsPage />, { isAuthenticated: true });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Morning Yoga Flow')).toBeInTheDocument();
      });

      // Apply instructor filter
      const instructorFilter = screen.getByRole('combobox', { name: /instructor/i });
      await user.click(instructorFilter);
      
      const sarahOption = screen.getByRole('option', { name: /sarah wilson/i });
      await user.click(sarahOption);

      // Check filtered results
      await waitFor(() => {
        expect(screen.getByText('Morning Yoga Flow')).toBeInTheDocument();
        expect(screen.queryByText('HIIT Training')).not.toBeInTheDocument();
      });
    });
  });

  describe('Create Booking', () => {
    it('should create new booking successfully', async () => {
      const user = userEvent.setup();
      
      const newBooking = {
        user_id: '1',
        class_id: '1',
        date: '2024-06-29',
        time: '07:00',
      };

      // Mock API responses
      mockFetch([
        {
          url: /\/bookings$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'POST')) {
              return createMockResponse({
                id: '3',
                ...newBooking,
                user_name: 'John Doe',
                class_name: 'Morning Yoga Flow',
                instructor: 'Sarah Wilson',
                status: 'confirmed',
                checked_in: false,
              });
            }
            return createMockResponse(mockBookings);
          },
        },
        {
          url: '/users',
          response: createMockResponse({ data: mockUsers }),
        },
        {
          url: '/classes',
          response: createMockResponse(mockClasses),
        },
      ]);

      customRender(<BookingsPage />, { isAuthenticated: true });

      // Open create booking modal
      const addButton = screen.getByRole('button', { name: /create booking/i });
      await user.click(addButton);

      // Fill in the form
      const modal = screen.getByRole('dialog');
      
      // Select user
      const userSelect = within(modal).getByRole('combobox', { name: /select user/i });
      await user.click(userSelect);
      const johnOption = screen.getByRole('option', { name: /john doe/i });
      await user.click(johnOption);

      // Select class
      const classSelect = within(modal).getByRole('combobox', { name: /select class/i });
      await user.click(classSelect);
      const yogaOption = screen.getByRole('option', { name: /morning yoga flow/i });
      await user.click(yogaOption);

      // Submit form
      const submitButton = within(modal).getByRole('button', { name: /create booking/i });
      await user.click(submitButton);

      // Check success message
      await waitFor(() => {
        expect(screen.getByText(/booking created successfully/i)).toBeInTheDocument();
      });

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should show error when class is full', async () => {
      const user = userEvent.setup();
      
      // Mock API responses
      mockFetch([
        {
          url: /\/bookings$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'POST')) {
              return createMockErrorResponse('Class is full', 400);
            }
            return createMockResponse(mockBookings);
          },
        },
        {
          url: '/users',
          response: createMockResponse({ data: mockUsers }),
        },
        {
          url: '/classes',
          response: createMockResponse(mockClasses),
        },
      ]);

      customRender(<BookingsPage />, { isAuthenticated: true });

      // Open create booking modal
      const addButton = screen.getByRole('button', { name: /create booking/i });
      await user.click(addButton);

      // Fill in the form
      const modal = screen.getByRole('dialog');
      
      // Select user and class
      const userSelect = within(modal).getByRole('combobox', { name: /select user/i });
      await user.click(userSelect);
      const userOption = screen.getByRole('option', { name: /john doe/i });
      await user.click(userOption);

      const classSelect = within(modal).getByRole('combobox', { name: /select class/i });
      await user.click(classSelect);
      const classOption = screen.getByRole('option', { name: /morning yoga flow/i });
      await user.click(classOption);

      // Submit form
      const submitButton = within(modal).getByRole('button', { name: /create booking/i });
      await user.click(submitButton);

      // Check error message
      await waitFor(() => {
        expect(screen.getByText(/class is full/i)).toBeInTheDocument();
      });
    });

    it('should prevent duplicate bookings', async () => {
      const user = userEvent.setup();
      
      // Mock API responses
      mockFetch([
        {
          url: /\/bookings$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'POST')) {
              return createMockErrorResponse(
                'User already has a booking for this class',
                400
              );
            }
            return createMockResponse(mockBookings);
          },
        },
        {
          url: '/users',
          response: createMockResponse({ data: mockUsers }),
        },
        {
          url: '/classes',
          response: createMockResponse(mockClasses),
        },
      ]);

      customRender(<BookingsPage />, { isAuthenticated: true });

      // Try to create duplicate booking
      const addButton = screen.getByRole('button', { name: /create booking/i });
      await user.click(addButton);

      const modal = screen.getByRole('dialog');
      
      // Select same user and class as existing booking
      const userSelect = within(modal).getByRole('combobox', { name: /select user/i });
      await user.click(userSelect);
      const johnOption = screen.getByRole('option', { name: /john doe/i });
      await user.click(johnOption);

      const classSelect = within(modal).getByRole('combobox', { name: /select class/i });
      await user.click(classSelect);
      const yogaOption = screen.getByRole('option', { name: /morning yoga flow/i });
      await user.click(yogaOption);

      // Submit form
      const submitButton = within(modal).getByRole('button', { name: /create booking/i });
      await user.click(submitButton);

      // Check error message
      await waitFor(() => {
        expect(screen.getByText(/already has a booking for this class/i)).toBeInTheDocument();
      });
    });
  });

  describe('Booking Check-in', () => {
    it('should check in user successfully', async () => {
      const user = userEvent.setup();
      
      // Mock check-in response
      mockFetch([
        {
          url: /\/bookings$/,
          response: createMockResponse(mockBookings),
        },
        {
          url: /\/bookings\/1\/check-in$/,
          response: createMockResponse({
            ...mockBookings[0],
            checked_in: true,
          }),
        },
      ]);

      customRender(<BookingsPage />, { isAuthenticated: true });

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText('Morning Yoga Flow')).toBeInTheDocument();
      });

      // Click check-in button
      const johnRow = screen.getByText('John Doe').closest('tr');
      const checkInButton = within(johnRow!).getByRole('button', { name: /check in/i });
      await user.click(checkInButton);

      // Check success message
      await waitFor(() => {
        expect(screen.getByText(/checked in successfully/i)).toBeInTheDocument();
      });

      // Button should change to "Checked In"
      await waitFor(() => {
        expect(within(johnRow!).getByText(/checked in/i)).toBeInTheDocument();
        expect(within(johnRow!).queryByRole('button', { name: /check in/i })).not.toBeInTheDocument();
      });
    });

    it('should handle check-in error', async () => {
      const user = userEvent.setup();
      
      // Mock check-in error
      mockFetch([
        {
          url: /\/bookings$/,
          response: createMockResponse(mockBookings),
        },
        {
          url: /\/bookings\/1\/check-in$/,
          response: createMockErrorResponse('Class has not started yet', 400),
        },
      ]);

      customRender(<BookingsPage />, { isAuthenticated: true });

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText('Morning Yoga Flow')).toBeInTheDocument();
      });

      // Try to check in
      const johnRow = screen.getByText('John Doe').closest('tr');
      const checkInButton = within(johnRow!).getByRole('button', { name: /check in/i });
      await user.click(checkInButton);

      // Check error message
      await waitFor(() => {
        expect(screen.getByText(/class has not started yet/i)).toBeInTheDocument();
      });

      // Button should still be available
      expect(within(johnRow!).getByRole('button', { name: /check in/i })).toBeInTheDocument();
    });
  });

  describe('Cancel Booking', () => {
    it('should cancel booking successfully', async () => {
      const user = userEvent.setup();
      
      // Mock cancel response
      mockFetch([
        {
          url: /\/bookings$/,
          response: createMockResponse(mockBookings),
        },
        {
          url: /\/bookings\/2$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'PUT')) {
              return createMockResponse({
                ...mockBookings[1],
                status: 'cancelled',
              });
            }
            return createMockResponse(mockBookings[1]);
          },
        },
      ]);

      customRender(<BookingsPage />, { isAuthenticated: true });

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText('HIIT Training')).toBeInTheDocument();
      });

      // Click cancel button
      const janeRow = screen.getByText('Jane Smith').closest('tr');
      const cancelButton = within(janeRow!).getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Confirm cancellation
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Check success message
      await waitFor(() => {
        expect(screen.getByText(/booking cancelled successfully/i)).toBeInTheDocument();
      });

      // Status should update
      await waitFor(() => {
        expect(within(janeRow!).getByText(/cancelled/i)).toBeInTheDocument();
      });
    });

    it('should not allow cancellation within 2 hours of class', async () => {
      const user = userEvent.setup();
      
      // Mock cancellation error
      mockFetch([
        {
          url: /\/bookings$/,
          response: createMockResponse(mockBookings),
        },
        {
          url: /\/bookings\/1$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'PUT')) {
              return createMockErrorResponse(
                'Cannot cancel booking within 2 hours of class start',
                400
              );
            }
            return createMockResponse(mockBookings[0]);
          },
        },
      ]);

      customRender(<BookingsPage />, { isAuthenticated: true });

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText('Morning Yoga Flow')).toBeInTheDocument();
      });

      // Try to cancel
      const johnRow = screen.getByText('John Doe').closest('tr');
      const cancelButton = within(johnRow!).getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Confirm cancellation
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Check error message
      await waitFor(() => {
        expect(screen.getByText(/cannot cancel booking within 2 hours/i)).toBeInTheDocument();
      });
    });
  });

  describe('Booking Statistics', () => {
    it('should display booking statistics', async () => {
      // Mock bookings with various statuses
      const bookingsWithStats = [
        ...mockBookings,
        { ...mockBookings[0], id: '3', status: 'cancelled' },
        { ...mockBookings[1], id: '4', checked_in: true },
      ];

      mockFetch([
        {
          url: '/bookings',
          response: createMockResponse(bookingsWithStats),
        },
      ]);

      customRender(<BookingsPage />, { isAuthenticated: true });

      // Check statistics are displayed
      await waitFor(() => {
        expect(screen.getByText(/total bookings/i)).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument(); // Total count
        
        expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument(); // Confirmed count
        
        expect(screen.getByText(/checked in/i)).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // Checked in count
        
        expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // Cancelled count
      });
    });
  });
});