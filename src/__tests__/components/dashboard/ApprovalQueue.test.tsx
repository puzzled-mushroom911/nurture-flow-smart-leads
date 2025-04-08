import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApprovalQueue } from '@/components/dashboard/ApprovalQueue';
import { useLeads } from '@/hooks/useLeads';
import { MessageWithLead } from '@/lib/types';

// Mock the useLeads hook
vi.mock('@/hooks/useLeads', () => ({
  useLeads: vi.fn(),
}));

// Mock Popover components to avoid DOM errors in tests
vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open, onOpenChange }: any) => (
    <div data-testid="popover" data-open={open}>
      {children}
      {/* Expose the onOpenChange prop to test it */}
      <button data-testid="close-popover" onClick={() => onOpenChange && onOpenChange(false)} />
    </div>
  ),
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children }: any) => <div data-testid="popover-content" role="dialog">{children}</div>,
}));

// Mock Calendar component
vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: any) => (
    <div data-testid="calendar">
      <button data-testid="select-date" onClick={() => onSelect(new Date())}>Select Today</button>
    </div>
  ),
}));

describe('ApprovalQueue Component', () => {
  // Sample data for tests
  const mockMessages: MessageWithLead[] = [
    {
      id: '1',
      leadId: '101',
      content: 'Test message 1',
      status: 'pending',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      lead: {
        id: '101',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'new',
        createdAt: new Date('2022-12-01'),
        updatedAt: new Date('2022-12-01'),
      },
    },
    {
      id: '2',
      leadId: '102',
      content: 'Test message 2',
      status: 'pending',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      lead: {
        id: '102',
        name: 'Jane Smith',
        email: 'jane@example.com',
        status: 'contacted',
        createdAt: new Date('2022-12-02'),
        updatedAt: new Date('2022-12-02'),
      },
    },
  ];

  const mockApproveMutation = {
    mutate: vi.fn(),
    isPending: false,
  };

  const mockRejectMutation = {
    mutate: vi.fn(),
    isPending: false,
  };

  const mockScheduleMutation = {
    mutate: vi.fn(),
    isPending: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    // Mock loading state
    (useLeads as any).mockReturnValue({
      pendingMessages: {
        isLoading: true,
        isError: false,
        data: null,
      },
      approveMessage: mockApproveMutation,
      rejectMessage: mockRejectMutation,
      scheduleMessage: mockScheduleMutation,
    });

    render(<ApprovalQueue />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    // Mock error state
    (useLeads as any).mockReturnValue({
      pendingMessages: {
        isLoading: false,
        isError: true,
        data: null,
      },
      approveMessage: mockApproveMutation,
      rejectMessage: mockRejectMutation,
      scheduleMessage: mockScheduleMutation,
    });

    render(<ApprovalQueue />);
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
  });

  it('renders empty state when no messages', () => {
    // Mock empty state
    (useLeads as any).mockReturnValue({
      pendingMessages: {
        isLoading: false,
        isError: false,
        data: [],
      },
      approveMessage: mockApproveMutation,
      rejectMessage: mockRejectMutation,
      scheduleMessage: mockScheduleMutation,
    });

    render(<ApprovalQueue />);
    expect(screen.getByText(/No messages pending approval/i)).toBeInTheDocument();
  });

  it('renders messages correctly', () => {
    // Mock successful state with messages
    (useLeads as any).mockReturnValue({
      pendingMessages: {
        isLoading: false,
        isError: false,
        data: mockMessages,
      },
      approveMessage: mockApproveMutation,
      rejectMessage: mockRejectMutation,
      scheduleMessage: mockScheduleMutation,
    });

    render(<ApprovalQueue />);
    
    // Check if both messages are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test message 1')).toBeInTheDocument();
    expect(screen.getByText('Test message 2')).toBeInTheDocument();
    
    // Check for action buttons (multiple buttons, at least 2 approve and 2 reject)
    const approveButtons = screen.getAllByText('Approve');
    const rejectButtons = screen.getAllByText('Reject');
    const scheduleButtons = screen.getAllByText('Schedule');
    
    expect(approveButtons.length).toBe(2);
    expect(rejectButtons.length).toBe(2);
    expect(scheduleButtons.length).toBe(2);
  });

  it('calls approveMessage when Approve button is clicked', async () => {
    // Mock successful state with messages
    (useLeads as any).mockReturnValue({
      pendingMessages: {
        isLoading: false,
        isError: false,
        data: mockMessages,
      },
      approveMessage: mockApproveMutation,
      rejectMessage: mockRejectMutation,
      scheduleMessage: mockScheduleMutation,
    });

    render(<ApprovalQueue />);
    
    // Find the first Approve button and click it
    const user = userEvent.setup();
    const approveButtons = screen.getAllByText('Approve');
    await user.click(approveButtons[0]);
    
    // Check if mutation function was called with the correct message ID
    expect(mockApproveMutation.mutate).toHaveBeenCalledWith('1');
  });

  it('calls rejectMessage when Reject button is clicked', async () => {
    // Mock successful state with messages
    (useLeads as any).mockReturnValue({
      pendingMessages: {
        isLoading: false,
        isError: false,
        data: mockMessages,
      },
      approveMessage: mockApproveMutation,
      rejectMessage: mockRejectMutation,
      scheduleMessage: mockScheduleMutation,
    });

    render(<ApprovalQueue />);
    
    // Find the first Reject button and click it
    const user = userEvent.setup();
    const rejectButtons = screen.getAllByText('Reject');
    await user.click(rejectButtons[0]);
    
    // Check if mutation function was called with the correct message ID
    expect(mockRejectMutation.mutate).toHaveBeenCalledWith('1');
  });

  it('displays schedule popover when Schedule button is clicked', async () => {
    // Mock successful state with messages
    (useLeads as any).mockReturnValue({
      pendingMessages: {
        isLoading: false,
        isError: false,
        data: mockMessages,
      },
      approveMessage: mockApproveMutation,
      rejectMessage: mockRejectMutation,
      scheduleMessage: mockScheduleMutation,
    });

    render(<ApprovalQueue />);
    
    // Find the first Schedule button and click it
    const user = userEvent.setup();
    const scheduleButtons = screen.getAllByText('Schedule');
    await user.click(scheduleButtons[0]);
    
    // Confirm button should be in the document (in the popover)
    const confirmButtons = screen.getAllByText('Confirm');
    expect(confirmButtons.length).toBeGreaterThan(0);
    
    // Check that the calendar is displayed
    const calendars = screen.getAllByTestId('calendar');
    expect(calendars.length).toBeGreaterThan(0);
  });

  it('calls scheduleMessage when a date is selected and Confirm is clicked', async () => {
    // Mock successful state with messages
    (useLeads as any).mockReturnValue({
      pendingMessages: {
        isLoading: false,
        isError: false,
        data: mockMessages,
      },
      approveMessage: mockApproveMutation,
      rejectMessage: mockRejectMutation,
      scheduleMessage: mockScheduleMutation,
    });

    render(<ApprovalQueue />);
    
    // Find the first Schedule button and click it
    const user = userEvent.setup();
    const scheduleButtons = screen.getAllByText('Schedule');
    await user.click(scheduleButtons[0]);
    
    // Select a date
    const selectDateButton = screen.getAllByTestId('select-date')[0];
    await user.click(selectDateButton);
    
    // Click the Confirm button
    const confirmButtons = screen.getAllByText('Confirm');
    await user.click(confirmButtons[0]);
    
    // Expect scheduleMessage to have been called with the right message ID
    expect(mockScheduleMutation.mutate).toHaveBeenCalledWith(expect.objectContaining({
      messageId: '1',
      scheduledFor: expect.any(Date),
    }));
  });
}); 