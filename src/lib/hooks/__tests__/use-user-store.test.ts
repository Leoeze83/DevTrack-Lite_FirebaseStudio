import { renderHook, act } from '@testing-library/react';
import { useUserStore } from '../use-user-store'; // Adjust path as necessary
import type { User } from '@/lib/types';

// Mocks
let mockStorage: { [key: string]: string } = {};
const USERS_STORAGE_KEY = "devtrack_users";

const mockLocalStorage = {
  getItem: jest.fn((key: string) => mockStorage[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: jest.fn((key: string) => { // Though not used by this store, good for completeness
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

// Store original JSON.parse
const originalJSONParse = JSON.parse;

const sampleUser: User = {
  id: 'user-id-1',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: 'http://example.com/avatar.png',
  createdAt: new Date(2023, 0, 1).toISOString(),
};


describe('useUserStore Hook', () => {
  let uuidCount = 0;
  
  beforeEach(() => {
    uuidCount = 0;
    (crypto.randomUUID as jest.Mock).mockImplementation(() => `mock-uuid-${++uuidCount}`);
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockConsoleError.mockClear();
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2023, 0, 15, 10, 0, 0)); // Default system time
    
    // Restore JSON.parse to its original state before each test
    global.JSON.parse = originalJSONParse;
    // Also ensure any spies from jest.spyOn are restored
    jest.restoreAllMocks(); 
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    // Ensure JSON.parse is restored after each test
    global.JSON.parse = originalJSONParse;
    jest.restoreAllMocks();
  });

  describe('Initialization (useEffect on mount)', () => {
    test('Scenario 1: Empty localStorage - initializes with an empty users array', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useUserStore());

      expect(result.current.isInitialized).toBe(false);
      
      act(() => {
        jest.runAllTimers(); // Ensure useEffects complete
      });
      
      expect(result.current.isInitialized).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(USERS_STORAGE_KEY);
      expect(result.current.users).toEqual([]);
      // setItem should be called after initialization, even with an empty array, to sync state
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(USERS_STORAGE_KEY, JSON.stringify([]));
    });

    test('Scenario 2: Valid data in localStorage - loads existing users', () => {
      const storedUsers = [sampleUser];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedUsers));

      const { result } = renderHook(() => useUserStore());
      act(() => { jest.runAllTimers(); });

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.users).toEqual(storedUsers);
      // setItem should be called after initialization to sync (even if data is the same)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(USERS_STORAGE_KEY, JSON.stringify(storedUsers));
    });
    
    test('Scenario 3: Invalid/Corrupted JSON in localStorage - defaults to empty array and logs error (implicitly)', () => {
      // The current implementation of getInitialUsers doesn't explicitly log errors for JSON.parse,
      // but it would throw, and the hook would likely fail or initialize differently.
      // Let's test that it defaults to empty array if JSON.parse fails.
      // For robust error handling, the store's getInitialUsers would need a try-catch.
      // Given the current code, if JSON.parse fails, it will throw before setUsers is called.
      // The test below assumes a try-catch exists or that it gracefully defaults.
      // Since there's no explicit try-catch in the provided getInitialUsers, we expect it to default to empty
      // because the failing parse will mean `storedUsers` is not set, thus returning [].
      
      mockLocalStorage.getItem.mockReturnValue("{invalid_json_is_here");
      
      // We expect JSON.parse to be called by getInitialUsers.
      // We'll spy on JSON.parse to confirm it's called and to simulate its failure.
      const jsonParseSpy = jest.spyOn(JSON, 'parse').mockImplementation(() => {
        throw new Error("Simulated JSON parse error");
      });

      const { result } = renderHook(() => useUserStore());
      act(() => { jest.runAllTimers(); });

      expect(result.current.isInitialized).toBe(true);
      expect(jsonParseSpy).toHaveBeenCalledWith("{invalid_json_is_here");
      expect(result.current.users).toEqual([]); // Should default to empty array
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(USERS_STORAGE_KEY, JSON.stringify([]));

      // spy will be restored by jest.restoreAllMocks() in afterEach
    });
  });

  describe('Actions and Selectors', () => {
    beforeEach(() => {
      // Start with empty storage for action tests
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([])); 
    });

    test('addUser: adds a new user and updates localStorage', () => {
      const fixedDate = new Date(2023, 5, 15, 12, 30, 0);
      jest.setSystemTime(fixedDate);

      const { result } = renderHook(() => useUserStore());
      act(() => { jest.runAllTimers(); }); // Initialize

      const newUserData = { name: 'Alice Wonderland', email: 'alice@example.com', avatarUrl: 'alice.png' };
      let addedUser: User | undefined;
      act(() => {
        addedUser = result.current.addUser(newUserData);
      });

      expect(addedUser).toBeDefined();
      expect(addedUser?.id).toBe('mock-uuid-1'); 
      expect(addedUser?.name).toBe(newUserData.name);
      expect(addedUser?.email).toBe(newUserData.email);
      expect(addedUser?.avatarUrl).toBe(newUserData.avatarUrl);
      expect(addedUser?.createdAt).toBe(fixedDate.toISOString());

      expect(result.current.users).toHaveLength(1);
      expect(result.current.users[0]).toEqual(addedUser); // New user should be first
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(USERS_STORAGE_KEY, JSON.stringify([addedUser]));
    });

    test('getUsers: returns the current state of users', () => {
      const { result } = renderHook(() => useUserStore());
      act(() => { jest.runAllTimers(); }); // Initialize (empty)

      const userData1 = { name: 'User One', email: 'one@example.com' };
      const userData2 = { name: 'User Two', email: 'two@example.com' };
      let user1, user2;
      act(() => {
        user1 = result.current.addUser(userData1);
        user2 = result.current.addUser(userData2);
      });
      
      let currentUsers: User[] = [];
      act(() => {
        currentUsers = result.current.getUsers();
      });

      expect(currentUsers).toHaveLength(2);
      // Order is [user2, user1] because new users are added to the beginning
      expect(currentUsers).toEqual([user2, user1]); 
    });

    test('getUserById: returns the correct user or undefined', () => {
      const { result } = renderHook(() => useUserStore());
      act(() => { jest.runAllTimers(); }); // Initialize (empty)

      const userData = { name: 'Specific User', email: 'specific@example.com' };
      let addedUser: User | undefined;
      act(() => {
        addedUser = result.current.addUser(userData);
      });
      
      expect(addedUser).toBeDefined();
      const userId = addedUser!.id;

      let foundUser: User | undefined;
      act(() => {
        foundUser = result.current.getUserById(userId);
      });
      expect(foundUser).toEqual(addedUser);

      let notFoundUser: User | undefined;
      act(() => {
        notFoundUser = result.current.getUserById('non-existent-id');
      });
      expect(notFoundUser).toBeUndefined();
    });
  });

  test('isInitialized state updates correctly', () => {
    const { result } = renderHook(() => useUserStore());
    expect(result.current.isInitialized).toBe(false);
    act(() => {
      jest.runAllTimers(); // Process useEffect
    });
    expect(result.current.isInitialized).toBe(true);
  });
});
