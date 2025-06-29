import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender, mockFetch, createMockResponse, createMockErrorResponse } from '../utils/test-utils';
import { mockUsers, createPaginatedResponse } from '../utils/mock-data';
import UsersPage from '@/pages/UsersPage';

describe('User Management Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Users List', () => {
    it('should display list of users', async () => {
      // Mock users API response
      mockFetch([
        {
          url: '/users',
          response: createMockResponse(createPaginatedResponse(mockUsers)),
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });

      // Check user details are displayed
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });

    it('should search users', async () => {
      const user = userEvent.setup();
      
      // Mock initial load and search responses
      const fetchMock = mockFetch([
        {
          url: /\/users$/,
          response: createMockResponse(createPaginatedResponse(mockUsers)),
        },
        {
          url: /\/users\?search=john/,
          response: createMockResponse(
            createPaginatedResponse(mockUsers.filter(u => 
              u.name.toLowerCase().includes('john')
            ))
          ),
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Search for "john"
      const searchInput = screen.getByPlaceholderText(/search users/i);
      await user.type(searchInput, 'john');

      // Wait for search results
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('/users?search=john'),
          expect.any(Object)
        );
      });

      // Check filtered results
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('should filter users by status', async () => {
      const user = userEvent.setup();
      
      // Mock filter responses
      mockFetch([
        {
          url: /\/users$/,
          response: createMockResponse(createPaginatedResponse(mockUsers)),
        },
        {
          url: /\/users\?.*status=active/,
          response: createMockResponse(
            createPaginatedResponse(mockUsers.filter(u => u.status === 'active'))
          ),
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Apply status filter
      const statusFilter = screen.getByRole('combobox', { name: /status/i });
      await user.click(statusFilter);
      
      const activeOption = screen.getByRole('option', { name: /active/i });
      await user.click(activeOption);

      // Check filtered results
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
      });
    });

    it('should handle pagination', async () => {
      const user = userEvent.setup();
      
      // Create more mock users for pagination
      const manyUsers = Array.from({ length: 15 }, (_, i) => ({
        ...mockUsers[0],
        id: `${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
      }));

      // Mock paginated responses
      mockFetch([
        {
          url: /\/users$/,
          response: createMockResponse(createPaginatedResponse(manyUsers, 1, 10)),
        },
        {
          url: /\/users\?.*page=2/,
          response: createMockResponse(createPaginatedResponse(manyUsers, 2, 10)),
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Wait for first page
      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeInTheDocument();
        expect(screen.getByText('User 10')).toBeInTheDocument();
      });

      // Go to next page
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Check second page
      await waitFor(() => {
        expect(screen.getByText('User 11')).toBeInTheDocument();
        expect(screen.getByText('User 15')).toBeInTheDocument();
        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Create User', () => {
    it('should create new user successfully', async () => {
      const user = userEvent.setup();
      
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        phone: '+1234567890',
        membership_type: 'Basic',
      };

      // Mock create user response
      mockFetch([
        {
          url: /\/users$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'POST')) {
              return createMockResponse({
                id: '4',
                ...newUser,
                status: 'active',
                join_date: new Date().toISOString().split('T')[0],
                total_visits: 0,
              });
            }
            return createMockResponse(createPaginatedResponse(mockUsers));
          },
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Open create user modal
      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      // Fill in the form
      const modal = screen.getByRole('dialog');
      const nameInput = within(modal).getByLabelText(/name/i);
      const emailInput = within(modal).getByLabelText(/email/i);
      const phoneInput = within(modal).getByLabelText(/phone/i);
      const membershipSelect = within(modal).getByRole('combobox', { name: /membership type/i });

      await user.type(nameInput, newUser.name);
      await user.type(emailInput, newUser.email);
      await user.type(phoneInput, newUser.phone);
      
      await user.click(membershipSelect);
      const basicOption = screen.getByRole('option', { name: /basic/i });
      await user.click(basicOption);

      // Submit form
      const submitButton = within(modal).getByRole('button', { name: /create user/i });
      await user.click(submitButton);

      // Check success message
      await waitFor(() => {
        expect(screen.getByText(/user created successfully/i)).toBeInTheDocument();
      });

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should show validation errors', async () => {
      const user = userEvent.setup();
      
      customRender(<UsersPage />, { isAuthenticated: true });

      // Open create user modal
      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      // Try to submit empty form
      const modal = screen.getByRole('dialog');
      const submitButton = within(modal).getByRole('button', { name: /create user/i });
      await user.click(submitButton);

      // Check validation errors
      await waitFor(() => {
        expect(within(modal).getByText(/name is required/i)).toBeInTheDocument();
        expect(within(modal).getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should handle server validation errors', async () => {
      const user = userEvent.setup();
      
      // Mock validation error response
      mockFetch([
        {
          url: /\/users$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'POST')) {
              return createMockErrorResponse(
                JSON.stringify({
                  message: 'Validation failed',
                  errors: {
                    email: ['Email already exists'],
                  },
                }),
                422
              );
            }
            return createMockResponse(createPaginatedResponse(mockUsers));
          },
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Open create user modal
      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      // Fill in the form
      const modal = screen.getByRole('dialog');
      const nameInput = within(modal).getByLabelText(/name/i);
      const emailInput = within(modal).getByLabelText(/email/i);

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'existing@example.com');

      // Submit form
      const submitButton = within(modal).getByRole('button', { name: /create user/i });
      await user.click(submitButton);

      // Check error message
      await waitFor(() => {
        expect(within(modal).getByText(/email already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Update User', () => {
    it('should update user successfully', async () => {
      const user = userEvent.setup();
      
      // Mock update user response
      mockFetch([
        {
          url: /\/users$/,
          response: createMockResponse(createPaginatedResponse(mockUsers)),
        },
        {
          url: /\/users\/1$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'PUT')) {
              return createMockResponse({
                ...mockUsers[0],
                name: 'John Updated',
              });
            }
            return createMockResponse(mockUsers[0]);
          },
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Click edit button for first user
      const firstUserRow = screen.getByText('John Doe').closest('tr');
      const editButton = within(firstUserRow!).getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Update name in modal
      const modal = screen.getByRole('dialog');
      const nameInput = within(modal).getByLabelText(/name/i);
      
      await user.clear(nameInput);
      await user.type(nameInput, 'John Updated');

      // Submit form
      const submitButton = within(modal).getByRole('button', { name: /update user/i });
      await user.click(submitButton);

      // Check success message
      await waitFor(() => {
        expect(screen.getByText(/user updated successfully/i)).toBeInTheDocument();
      });

      // Check updated name in list
      await waitFor(() => {
        expect(screen.getByText('John Updated')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete User', () => {
    it('should delete user successfully', async () => {
      const user = userEvent.setup();
      
      // Mock delete user response
      mockFetch([
        {
          url: /\/users$/,
          response: createMockResponse(createPaginatedResponse(mockUsers)),
        },
        {
          url: /\/users\/3$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'DELETE')) {
              return createMockResponse({ message: 'User deleted successfully' });
            }
            return createMockResponse(mockUsers[2]);
          },
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });

      // Click delete button for Bob Johnson
      const bobRow = screen.getByText('Bob Johnson').closest('tr');
      const deleteButton = within(bobRow!).getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Confirm deletion in dialog
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Check success message
      await waitFor(() => {
        expect(screen.getByText(/user deleted successfully/i)).toBeInTheDocument();
      });

      // User should be removed from list
      await waitFor(() => {
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
      });
    });

    it('should handle delete error', async () => {
      const user = userEvent.setup();
      
      // Mock delete error response
      mockFetch([
        {
          url: /\/users$/,
          response: createMockResponse(createPaginatedResponse(mockUsers)),
        },
        {
          url: /\/users\/1$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'DELETE')) {
              return createMockErrorResponse(
                'Cannot delete user with active bookings',
                400
              );
            }
            return createMockResponse(mockUsers[0]);
          },
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Try to delete John Doe
      const johnRow = screen.getByText('John Doe').closest('tr');
      const deleteButton = within(johnRow!).getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Check error message
      await waitFor(() => {
        expect(screen.getByText(/cannot delete user with active bookings/i)).toBeInTheDocument();
      });

      // User should still be in list
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});