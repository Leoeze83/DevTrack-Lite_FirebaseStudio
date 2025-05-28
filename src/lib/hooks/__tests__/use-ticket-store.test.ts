import { renderHook, act } from '@testing-library/react';
import { useTicketStore } from '../use-ticket-store'; // Adjust path as necessary
import type { Ticket, TimeLog, Priority, Status } from '@/lib/types';

// Mocks
let mockStorage: { [key: string]: string } = {};
const TICKETS_STORAGE_KEY = "devtrack_tickets";
const TIMELOGS_STORAGE_KEY = "devtrack_timelogs";

const mockLocalStorage = {
  getItem: jest.fn((key: string) => mockStorage[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: jest.fn(() => {
    mockStorage = {};
  }),
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(global, 'crypto', {
    value: { randomUUID: jest.fn() },
});

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

const sampleTicket: Ticket = {
  id: 'sample-id-1',
  title: 'Sample Ticket 1',
  description: 'This is a sample ticket',
  category: 'Bug',
  priority: 'high' as Priority,
  status: 'Open' as Status,
  createdAt: new Date(2023, 0, 1).toISOString(),
  updatedAt: new Date(2023, 0, 1).toISOString(),
  tags: ['test', 'sample'],
  timeLoggedMinutes: 0,
};

const sampleTimeLog: TimeLog = {
  id: 'log-id-1',
  ticketId: 'sample-id-1',
  userId: 'dev_user',
  durationMinutes: 60,
  loggedAt: new Date(2023, 0, 2).toISOString(),
  notes: 'Worked on initial setup',
};


describe('useTicketStore Hook', () => {
  let uuidCount = 0;

  beforeEach(() => {
    uuidCount = 0;
    (crypto.randomUUID as jest.Mock).mockImplementation(() => `mock-uuid-${++uuidCount}`);
    mockLocalStorage.clear(); // Clears our mockStorage object
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
    jest.useFakeTimers('modern'); // Use modern fake timers
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers(); // Restore real timers
  });

  describe('Initialization (useEffect on mount)', () => {
    test('Scenario 1: Empty localStorage - generates sample tickets', () => {
      jest.setSystemTime(new Date(2023, 0, 15, 10, 0, 0)); // Set system time for consistent createdAt/updatedAt
      const { result } = renderHook(() => useTicketStore());

      expect(result.current.isInitialized).toBe(false);
      
      act(() => {
        jest.runAllTimers(); // Ensure useEffects complete
      });
      
      expect(result.current.isInitialized).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(TICKETS_STORAGE_KEY);
      expect(result.current.tickets.length).toBe(10); // Default sample tickets
      expect(result.current.tickets[0].title).toBeDefined();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(TICKETS_STORAGE_KEY, JSON.stringify(result.current.tickets));
    });

    test('Scenario 2: Valid data in localStorage - loads existing tickets and timelogs', () => {
      const storedTickets = [sampleTicket];
      const storedTimeLogs = [sampleTimeLog];
      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === TICKETS_STORAGE_KEY) return JSON.stringify(storedTickets);
        if (key === TIMELOGS_STORAGE_KEY) return JSON.stringify(storedTimeLogs);
        return null;
      });

      const { result } = renderHook(() => useTicketStore());
      act(() => { jest.runAllTimers(); });

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.tickets).toEqual(storedTickets);
      expect(result.current.timeLogs).toEqual(storedTimeLogs);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(TICKETS_STORAGE_KEY, expect.any(String)); // Should not re-save if loaded
    });
    
    test('Scenario 3: Invalid/Corrupted JSON in localStorage for tickets - falls back to sample tickets', () => {
      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === TICKETS_STORAGE_KEY) return "{invalid_json}";
        return null;
      });
      
      const { result } = renderHook(() => useTicketStore());
      act(() => { jest.runAllTimers(); });

      expect(result.current.isInitialized).toBe(true);
      expect(mockConsoleError).toHaveBeenCalledWith("Error al parsear tickets desde localStorage. Descartando.", expect.any(SyntaxError));
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(TICKETS_STORAGE_KEY);
      expect(result.current.tickets.length).toBe(10); // Fallback to 10 sample tickets
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(TICKETS_STORAGE_KEY, JSON.stringify(result.current.tickets));
    });

    test('Scenario 4: localStorage has an array, but not of valid tickets - falls back to sample tickets', () => {
      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === TICKETS_STORAGE_KEY) return JSON.stringify([{ foo: "bar" }]);
        return null;
      });

      const { result } = renderHook(() => useTicketStore());
      act(() => { jest.runAllTimers(); });
      
      expect(result.current.isInitialized).toBe(true);
      expect(mockConsoleWarn).toHaveBeenCalledWith("Los datos almacenados en localStorage son un array pero no de tickets válidos. Descartando.");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(TICKETS_STORAGE_KEY);
      expect(result.current.tickets.length).toBe(10); // Fallback
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(TICKETS_STORAGE_KEY, JSON.stringify(result.current.tickets));
    });
  });

  describe('Actions and Selectors', () => {
    beforeEach(() => {
      // Start with empty storage for action tests, allow initialization to populate if needed or start fresh
      mockLocalStorage.getItem.mockReturnValue(null); 
    });

    test('addTicket: adds a new ticket and updates localStorage', () => {
      const fixedDate = new Date(2023, 5, 15, 12, 30, 0);
      jest.setSystemTime(fixedDate);

      const { result } = renderHook(() => useTicketStore());
      act(() => { jest.runAllTimers(); }); // Initialize with sample tickets or empty

      const newTicketData = { title: 'New Test Ticket', description: 'A new ticket for testing', category: 'Test', priority: 'medium' as Priority };
      let addedTicket: Ticket | undefined;
      act(() => {
        addedTicket = result.current.addTicket(newTicketData);
      });

      expect(addedTicket).toBeDefined();
      expect(addedTicket?.id).toBe('mock-uuid-11'); // 10 from init + 1 new
      expect(addedTicket?.title).toBe(newTicketData.title);
      expect(addedTicket?.status).toBe('Open');
      expect(addedTicket?.createdAt).toBe(fixedDate.toISOString());
      expect(addedTicket?.updatedAt).toBe(fixedDate.toISOString());
      expect(addedTicket?.timeLoggedMinutes).toBe(0);

      expect(result.current.tickets.find(t => t.id === addedTicket?.id)).toEqual(addedTicket);
      expect(result.current.tickets[0].id).toBe(addedTicket?.id); // Should be at the top due to sorting
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(TICKETS_STORAGE_KEY, JSON.stringify(result.current.tickets));
    });

    test('getTicketById: returns the correct ticket or undefined', () => {
      const { result } = renderHook(() => useTicketStore());
      act(() => { jest.runAllTimers(); }); // Initialize

      const ticketToFindId = result.current.tickets[0].id; // Get an ID from sample tickets
      
      let foundTicket: Ticket | undefined;
      act(() => {
        foundTicket = result.current.getTicketById(ticketToFindId);
      });
      expect(foundTicket).toBeDefined();
      expect(foundTicket?.id).toBe(ticketToFindId);

      let notFoundTicket: Ticket | undefined;
      act(() => {
        notFoundTicket = result.current.getTicketById('non-existent-id');
      });
      expect(notFoundTicket).toBeUndefined();
    });

    test('updateTicketStatus: updates status and updatedAt, persists', () => {
      const fixedDateUpdate = new Date(2023, 5, 16, 14, 0, 0);
      jest.setSystemTime(fixedDateUpdate);
      
      const { result } = renderHook(() => useTicketStore());
      act(() => { jest.runAllTimers(); }); // Initialize

      const ticketToUpdate = result.current.tickets[0];
      
      act(() => {
        result.current.updateTicketStatus(ticketToUpdate.id, 'In Progress' as Status);
      });

      const updatedTicket = result.current.tickets.find(t => t.id === ticketToUpdate.id);
      expect(updatedTicket?.status).toBe('In Progress');
      expect(updatedTicket?.updatedAt).toBe(fixedDateUpdate.toISOString());
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(TICKETS_STORAGE_KEY, JSON.stringify(result.current.tickets));
    });

    test('logTimeForTicket: adds time log, updates ticket, persists', () => {
      const fixedDateTimeLog = new Date(2023, 5, 17, 10, 0, 0);
      jest.setSystemTime(fixedDateTimeLog);

      const { result } = renderHook(() => useTicketStore());
      act(() => { jest.runAllTimers(); }); // Initialize

      const ticketToLogTimeFor = result.current.tickets[0];
      const initialLoggedMinutes = ticketToLogTimeFor.timeLoggedMinutes;
      
      act(() => {
        result.current.logTimeForTicket(ticketToLogTimeFor.id, 60, 'Worked on feature');
      });
      
      const newTimeLog = result.current.timeLogs.find(tl => tl.ticketId === ticketToLogTimeFor.id);
      expect(newTimeLog).toBeDefined();
      expect(newTimeLog?.id).toBe('mock-uuid-11'); // Assuming 10 tickets from init, UUID count continues
      expect(newTimeLog?.durationMinutes).toBe(60);
      expect(newTimeLog?.notes).toBe('Worked on feature');
      expect(newTimeLog?.loggedAt).toBe(fixedDateTimeLog.toISOString());

      const updatedTicket = result.current.tickets.find(t => t.id === ticketToLogTimeFor.id);
      expect(updatedTicket?.timeLoggedMinutes).toBe(initialLoggedMinutes + 60);
      expect(updatedTicket?.updatedAt).toBe(fixedDateTimeLog.toISOString());

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(TIMELOGS_STORAGE_KEY, JSON.stringify(result.current.timeLogs));
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(TICKETS_STORAGE_KEY, JSON.stringify(result.current.tickets));
    });
    
    test('getTickets: returns current tickets sorted by createdAt descending', () => {
      const { result } = renderHook(() => useTicketStore());
      act(() => { jest.runAllTimers(); }); // Initialize

      // Add a ticket with a very new date to ensure it's first
      const veryNewDate = new Date(2025, 0, 1).toISOString();
      const veryOldDate = new Date(2020, 0, 1).toISOString();

      act(() => {
        result.current.addTicket({ title: 'Old Ticket', description: 'old', category: 'C1', priority: 'low' });
        // Manually update its createdAt to be old for testing sort
        const addedTickets = result.current.tickets;
        const oldTicketIndex = addedTickets.findIndex(t=>t.title === 'Old Ticket');
        if(oldTicketIndex !== -1) addedTickets[oldTicketIndex].createdAt = veryOldDate;
        result.current.addTicket({ title: 'New Ticket', description: 'new', category: 'C2', priority: 'high' });
         const newTicketIndex = addedTickets.findIndex(t=>t.title === 'New Ticket');
        if(newTicketIndex !== -1) addedTickets[newTicketIndex].createdAt = veryNewDate;

      });
      
      // Re-trigger getTickets or rely on the fact that addTicket already sorts
      const currentTickets = result.current.getTickets();
      expect(currentTickets[0].title).toBe('New Ticket'); // Newest first
      expect(currentTickets[currentTickets.length -1].title).not.toBe('Old Ticket'); // Oldest last (or one of the samples)
      // Check if all tickets are sorted
      for (let i = 0; i < currentTickets.length - 1; i++) {
        expect(new Date(currentTickets[i].createdAt).getTime()).toBeGreaterThanOrEqual(new Date(currentTickets[i+1].createdAt).getTime());
      }
    });

    test('getTimeLogsForTicket: returns relevant time logs', () => {
      const { result } = renderHook(() => useTicketStore());
      act(() => { jest.runAllTimers(); }); // Initialize

      const ticket1 = result.current.tickets[0];
      const ticket2 = result.current.tickets[1];

      act(() => {
        result.current.logTimeForTicket(ticket1.id, 30);
        result.current.logTimeForTicket(ticket2.id, 45);
        result.current.logTimeForTicket(ticket1.id, 15);
      });

      const logsForTicket1 = result.current.getTimeLogsForTicket(ticket1.id);
      expect(logsForTicket1).toHaveLength(2);
      expect(logsForTicket1.every(log => log.ticketId === ticket1.id)).toBe(true);

      const logsForTicket2 = result.current.getTimeLogsForTicket(ticket2.id);
      expect(logsForTicket2).toHaveLength(1);
      expect(logsForTicket2[0].ticketId).toBe(ticket2.id);

      const logsForNonExistent = result.current.getTimeLogsForTicket('non-existent-id');
      expect(logsForNonExistent).toHaveLength(0);
    });
  });

  test('isInitialized state updates correctly', () => {
    const { result } = renderHook(() => useTicketStore());
    expect(result.current.isInitialized).toBe(false);
    act(() => {
      jest.runAllTimers(); // Process useEffect
    });
    expect(result.current.isInitialized).toBe(true);
  });
});
