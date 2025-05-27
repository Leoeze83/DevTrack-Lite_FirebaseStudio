import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketForm } from '../ticket-form';
import { TicketList } from '../ticket-list';
import * as ticketStoreHook from '@/lib/hooks/use-ticket-store'; // To spy/reset store if needed
import * as actions from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Priority, Status, Ticket } from '@/lib/types';

// --- Mocks ---
let mockStorage: { [key: string]: string } = {};
const TICKETS_STORAGE_KEY = "devtrack_tickets";
const TIMELOGS_STORAGE_KEY = "devtrack_timelogs"; // Though not directly used, store uses it

const mockLocalStorage = {
  getItem: jest.fn((key: string) => mockStorage[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: jest.fn((key: string) => { delete mockStorage[key]; }),
  clear: jest.fn(() => { mockStorage = {}; }),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

Object.defineProperty(global, 'crypto', {
  value: { randomUUID: jest.fn() },
});

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

jest.mock('@/app/actions'); // Mock server actions
const mockCategorizeTicketDescription = actions.categorizeTicketDescription as jest.Mock;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-toast');
const mockToast = jest.fn();
(useToast as jest.Mock).mockReturnValue({ toast: mockToast });

// --- End Mocks ---

// Helper to reset store state for tests
// This forces the store to re-initialize from localStorage
const resetStore = () => {
    // This is a bit of a hack, as the store is a singleton.
    // Forcing re-render of components using the store might be necessary,
    // or directly manipulating the store's internal state if possible and exposed.
    // For this test, clearing localStorage and re-rendering should be enough
    // as useTicketStore re-initializes from localStorage.
    act(() => {
        // This forces the hook to re-evaluate its initial state from localStorage.
        // We need to make sure that components re-render to pick up the new store instance/state.
        // In a real app, you wouldn't do this. For tests, it helps isolate.
        const { result } = renderHook(() => ticketStoreHook.useTicketStore());
        result.current.isInitialized = false; // Force re-init path
    });
};


describe('Ticket Management Integration Tests', () => {
  let uuidCount = 0;

  beforeEach(() => {
    uuidCount = 0;
    (crypto.randomUUID as jest.Mock).mockImplementation(() => `mock-uuid-${++uuidCount}`);
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockCategorizeTicketDescription.mockClear();
    mockToast.mockClear();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
    
    // Default mock for AI categorization
    mockCategorizeTicketDescription.mockResolvedValue({
      category: 'AI Suggested Category',
      priority: 'medium' as Priority,
    });
    // Set localStorage to empty array to avoid sample data generation for predictable tests
    mockLocalStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify([]));
    mockLocalStorage.setItem(TIMELOGS_STORAGE_KEY, JSON.stringify([]));
    resetStore(); // Ensure store starts fresh based on (empty) localStorage
  });

  test('1. Adding a Ticket and Verifying Display', async () => {
    render(
      <>
        <TicketForm />
        <TicketList />
      </>
    );

    // Fill out the form
    await userEvent.type(screen.getByLabelText(/Título/i), 'Integration Test Ticket Title');
    await userEvent.type(screen.getByLabelText(/Descripción/i), 'This is a detailed description for the integration test ticket.');
    await userEvent.type(screen.getByLabelText(/Categoría/i), 'Integration Test Category');
    
    // Select priority
    const prioritySelect = screen.getByLabelText(/Prioridad/i);
    await userEvent.click(prioritySelect);
    await userEvent.click(await screen.findByText('Alta')); // Select "Alta" (High)

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Crear Ticket/i });
    await userEvent.click(submitButton);

    // Wait for submission and UI update
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "¡Ticket Creado!",
      }));
    });

    // Verify the new ticket appears in the list (default is grid view)
    // TicketListItem renders a Card. We will look for the title within a card.
    await waitFor(async () => {
      const ticketCard = await screen.findByText('Integration Test Ticket Title');
      expect(ticketCard).toBeInTheDocument();
      
      // Check for other details. This assumes TicketListItem structure.
      // To be more robust, we'd add data-testid attributes to elements within TicketListItem.
      // For now, we'll check for elements that are likely to be unique to the new ticket.
      const listItem = ticketCard.closest('div[class*="rounded-lg border"]'); // Approximate selector for TicketListItem card
      expect(listItem).not.toBeNull();

      if(listItem) {
        expect(within(listItem).getByText('Integration Test Category')).toBeInTheDocument();
        expect(within(listItem).getByText('Alta')).toBeInTheDocument(); // Priority
        expect(within(listItem).getByText('Abierto')).toBeInTheDocument(); // Status (Open)
      }
    });
    
    // Verify localStorage was updated
    const storedTicketsRaw = mockLocalStorage.setItem.mock.calls.find(call => call[0] === TICKETS_STORAGE_KEY)?.[1];
    expect(storedTicketsRaw).toBeDefined();
    const storedTickets: Ticket[] = JSON.parse(storedTicketsRaw as string);
    expect(storedTickets).toHaveLength(1);
    expect(storedTickets[0].title).toBe('Integration Test Ticket Title');
    expect(storedTickets[0].category).toBe('Integration Test Category');
    expect(storedTickets[0].priority).toBe('high');
    expect(storedTickets[0].status).toBe('Open');
  });


  test('2. Updating a Ticket\'s Status and Verifying Display (List View)', async () => {
    // Pre-populate the store with a ticket
    const initialTicketId = 'mock-uuid-1';
    const initialTickets: Ticket[] = [{
      id: initialTicketId,
      title: 'Ticket to Update Status',
      description: 'Initial description',
      category: 'Status Update Test',
      priority: 'medium' as Priority,
      status: 'Open' as Status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeLoggedMinutes: 0,
    }];
    mockLocalStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(initialTickets));
    uuidCount = 1; // Next UUID will be 2
    resetStore();


    render(<TicketList />);
    
    // Switch to List view for easier targeting of status update elements
    const listViewButton = screen.getByLabelText(/Vista de Lista/i);
    await userEvent.click(listViewButton);
    
    // Find the row for the ticket
    const ticketTitleCell = await screen.findByText('Ticket to Update Status');
    const ticketRow = ticketTitleCell.closest('tr');
    expect(ticketRow).not.toBeNull();

    if (!ticketRow) throw new Error("Ticket row not found");

    // Verify initial status display (Open)
    // The status badge combines an icon and text.
    expect(within(ticketRow).getByText('Abierto')).toBeInTheDocument();
    expect(within(ticketRow).getByTestId('circle-dot-icon')).toBeInTheDocument(); // Open icon

    // Find and click the "More actions" button (DropdownMenuTrigger)
    const moreActionsButton = within(ticketRow).getByRole('button', { name: /Más acciones/i });
    await userEvent.click(moreActionsButton);

    // Click the menu item to change status to "In Progress"
    // The text is "Marcar como En Progreso"
    const changeToInProgressItem = await screen.findByText(/Marcar como En Progreso/i);
    await userEvent.click(changeToInProgressItem);

    // Wait for UI update
    await waitFor(() => {
      // Verify the status badge text and icon changed in the list
      expect(within(ticketRow).getByText('En Progreso')).toBeInTheDocument();
      expect(within(ticketRow).getByTestId('loader-circle-icon')).toBeInTheDocument(); // In Progress icon
      expect(within(ticketRow).queryByText('Abierto')).not.toBeInTheDocument();
      expect(within(ticketRow).queryByTestId('circle-dot-icon')).not.toBeInTheDocument();
    });

    // Verify localStorage was updated
    const storedTicketsRaw = mockLocalStorage.setItem.mock.calls.find(call => call[0] === TICKETS_STORAGE_KEY)?.[1];
    expect(storedTicketsRaw).toBeDefined();
    const storedTickets: Ticket[] = JSON.parse(storedTicketsRaw as string);
    const updatedTicketInStorage = storedTickets.find(t => t.id === initialTicketId);
    expect(updatedTicketInStorage).toBeDefined();
    expect(updatedTicketInStorage?.status).toBe('In Progress');
  });

  test('3. Logging Time for a Ticket and Verifying Updates', async () => {
    const initialTicketId = 'mock-uuid-log-time';
    const initialTimeLogged = 30; // 0.5 hrs
    const initialTickets: Ticket[] = [{
      id: initialTicketId,
      title: 'Ticket for Time Logging',
      description: 'Log time against this ticket.',
      category: 'Time Logging Test',
      priority: 'low' as Priority,
      status: 'In Progress' as Status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeLoggedMinutes: initialTimeLogged, // Start with some time already logged
    }];
    mockLocalStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(initialTickets));
    uuidCount = initialTickets.length; // Set UUID count based on pre-populated tickets
    resetStore();

    render(<TicketList />); // Renders TicketList, which includes LogTimeDialog logic

    // --- Open LogTimeDialog (Grid View) ---
    // Find the ticket card first
    const ticketCardTitle = await screen.findByText('Ticket for Time Logging');
    const ticketCard = ticketCardTitle.closest('div[class*="rounded-lg border"]'); // Approximate card selector
    expect(ticketCard).not.toBeNull();
    if (!ticketCard) throw new Error("Ticket card not found for time logging test");

    // Verify initial logged time display on the card (assuming TicketListItem shows it)
    // TicketListItem in grid view shows "X.Y hrs logged"
    expect(within(ticketCard).getByText(`${(initialTimeLogged / 60).toFixed(1)} hrs logged`)).toBeInTheDocument();

    // Click the "Registrar Tiempo" button within this card
    // In TicketListItem, this button has an aria-label "Registrar tiempo"
    const logTimeButtonOnCard = within(ticketCard).getByRole('button', { name: /Registrar tiempo/i });
    await userEvent.click(logTimeButtonOnCard);

    // --- Verify LogTimeDialog ---
    // The dialog should be visible. Radix Dialog adds role="dialog"
    const logTimeDialog = await screen.findByRole('dialog', { name: /Registrar Tiempo para/i });
    expect(logTimeDialog).toBeVisible();
    expect(within(logTimeDialog).getByText(/Registrar Tiempo para: Ticket for Time Logging/i)).toBeInTheDocument();

    // --- Submit Time Log ---
    const durationInput = within(logTimeDialog).getByLabelText(/Duración \(min\)/i);
    await userEvent.type(durationInput, '60'); // Log 1 hour

    const notesInput = within(logTimeDialog).getByLabelText(/Notas \(Opcional\)/i);
    await userEvent.type(notesInput, 'Added 1 hour for integration test.');

    const submitLogButton = within(logTimeDialog).getByRole('button', { name: 'Registrar Tiempo' });
    await userEvent.click(submitLogButton);

    // --- Verify Outcomes ---
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Registrar Tiempo para/i })).not.toBeInTheDocument(); // Dialog closes
    });

    // Verify displayed time updated on the card in TicketList
    const newTotalTimeLogged = initialTimeLogged + 60;
    expect(within(ticketCard).getByText(`${(newTotalTimeLogged / 60).toFixed(1)} hrs logged`)).toBeInTheDocument();

    // Verify localStorage updates
    // 1. TimeLog created
    const storedTimeLogsRaw = mockLocalStorage.setItem.mock.calls.find(call => call[0] === TIMELOGS_STORAGE_KEY)?.[1];
    expect(storedTimeLogsRaw).toBeDefined();
    const storedTimeLogs: any[] = JSON.parse(storedTimeLogsRaw as string);
    expect(storedTimeLogs).toHaveLength(1);
    expect(storedTimeLogs[0].ticketId).toBe(initialTicketId);
    expect(storedTimeLogs[0].durationMinutes).toBe(60);
    expect(storedTimeLogs[0].notes).toBe('Added 1 hour for integration test.');
    expect(storedTimeLogs[0].id).toBe(`mock-uuid-${uuidCount + 1}`); // Next UUID after initial ticket

    // 2. Ticket updated in localStorage
    const storedTicketsRaw = mockLocalStorage.setItem.mock.calls.find(call => call[0] === TICKETS_STORAGE_KEY)?.[1];
    expect(storedTicketsRaw).toBeDefined();
    const storedTickets: Ticket[] = JSON.parse(storedTicketsRaw as string);
    const updatedTicketInStorage = storedTickets.find(t => t.id === initialTicketId);
    expect(updatedTicketInStorage).toBeDefined();
    expect(updatedTicketInStorage?.timeLoggedMinutes).toBe(newTotalTimeLogged);
    expect(updatedTicketInStorage?.updatedAt).not.toBe(initialTickets[0].updatedAt); // Should have been updated
  });
});
