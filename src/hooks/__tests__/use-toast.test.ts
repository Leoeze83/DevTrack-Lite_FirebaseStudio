import { act, renderHook } from '@testing-library/react';
import { reducer, useToast, toast as globalToast } from '../use-toast';
import type { ToastProps } from '@/components/ui/toast';

// Helper to reset the global memoryState before each test if necessary.
// The useToast hook and global toast function rely on a module-level state.
const resetToastModuleState = () => {
  // This is a bit of a hack. Ideally, the module would provide a reset function.
  // For now, we can dispatch REMOVE_TOAST without an ID to clear all toasts.
  // This also clears the toastTimeouts map indirectly if toasts are dismissed and then removed.
  act(() => {
    globalToast.dismiss(); // Dismiss all, setting open to false
  });
  act(() => {
    // Directly calling the reducer to clear memoryState.toasts
    // This is to ensure a clean slate for memoryState for subsequent hook/toast calls.
    const currentState = require('../use-toast').memoryState;
    const nextState = reducer(currentState, { type: 'REMOVE_TOAST' });
    require('../use-toast').memoryState = nextState;

    // Clear any pending timeouts
    const toastTimeouts = require('../use-toast').toastTimeouts as Map<string, NodeJS.Timeout>;
    toastTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    toastTimeouts.clear();
  });
};


describe('Toast Reducer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
     resetToastModuleState(); // Reset state after each reducer test too
  });

  const initialState = { toasts: [] };

  test('ADD_TOAST: should add a new toast', () => {
    const toastToAdd = { id: '1', title: 'Test Toast', open: true };
    const action = { type: 'ADD_TOAST' as const, toast: toastToAdd };
    const state = reducer(initialState, action);
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0]).toEqual(toastToAdd);
  });

  test('ADD_TOAST: should respect TOAST_LIMIT (currently 1)', () => {
    let state = reducer(initialState, {
      type: 'ADD_TOAST' as const,
      toast: { id: '1', title: 'First Toast', open: true },
    });
    state = reducer(state, {
      type: 'ADD_TOAST' as const,
      toast: { id: '2', title: 'Second Toast', open: true },
    });
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].id).toBe('2'); // Newest toast should be kept
  });

  test('UPDATE_TOAST: should update an existing toast', () => {
    const initialToast = { id: '1', title: 'Initial Title', open: true };
    let state = reducer({ toasts: [initialToast] }, {
      type: 'ADD_TOAST' as const, // Ensure it's added first if TOAST_LIMIT is small
      toast: initialToast
    });
     state = reducer({ toasts: [initialToast] }, { // Use the actual state after add
      type: 'UPDATE_TOAST' as const,
      toast: { id: '1', title: 'Updated Title' },
    });
    expect(state.toasts[0].title).toBe('Updated Title');
  });

  test('DISMISS_TOAST: should set open to false for a specific toast and queue removal', () => {
    const toast1 = { id: '1', title: 'Toast 1', open: true };
    const toast2 = { id: '2', title: 'Toast 2', open: true };
    const stateWithToasts = { toasts: [toast1, toast2] };

    const action = { type: 'DISMISS_TOAST' as const, toastId: '1' };
    const state = reducer(stateWithToasts, action);

    expect(state.toasts.find(t => t.id === '1')?.open).toBe(false);
    expect(state.toasts.find(t => t.id === '2')?.open).toBe(true); // Unaffected

    // Check if addToRemoveQueue was effectively called (toastTimeouts map)
    const toastTimeouts = require('../use-toast').toastTimeouts as Map<string, NodeJS.Timeout>;
    expect(toastTimeouts.has('1')).toBe(true);
  });

  test('DISMISS_TOAST: should set open to false for all toasts if no toastId and queue removal', () => {
    const toast1 = { id: '1', title: 'Toast 1', open: true };
    const toast2 = { id: '2', title: 'Toast 2', open: true };
    const stateWithToasts = { toasts: [toast1, toast2] };

    const action = { type: 'DISMISS_TOAST' as const };
    const state = reducer(stateWithToasts, action);

    expect(state.toasts.every(t => !t.open)).toBe(true);
    const toastTimeouts = require('../use-toast').toastTimeouts as Map<string, NodeJS.Timeout>;
    expect(toastTimeouts.has('1')).toBe(true);
    expect(toastTimeouts.has('2')).toBe(true);
  });
  
  test('REMOVE_TOAST: should remove a specific toast', () => {
    const toast1 = { id: '1', title: 'Toast 1', open: false }; // Assume dismissed
    const toast2 = { id: '2', title: 'Toast 2', open: false };
    const stateWithToasts = { toasts: [toast1, toast2] };

    const action = { type: 'REMOVE_TOAST' as const, toastId: '1' };
    const state = reducer(stateWithToasts, action);

    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].id).toBe('2');
  });

  test('REMOVE_TOAST: should remove all toasts if no toastId is provided', () => {
    const toast1 = { id: '1', title: 'Toast 1', open: false };
    const toast2 = { id: '2', title: 'Toast 2', open: false };
    const stateWithToasts = { toasts: [toast1, toast2] };

    const action = { type: 'REMOVE_TOAST' as const };
    const state = reducer(stateWithToasts, action);

    expect(state.toasts).toHaveLength(0);
  });
});

describe('useToast Hook and global toast() function', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetToastModuleState(); // Reset state before each hook/toast function test
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    resetToastModuleState(); // Clean up after each test
  });

  test('global toast() function: adds a toast and updates hook state', () => {
    const { result } = renderHook(() => useToast());
    
    let toastReturn: any;
    act(() => {
      toastReturn = globalToast({ title: 'Global Toast' });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Global Toast');
    expect(result.current.toasts[0].id).toBe(toastReturn.id);
    expect(result.current.toasts[0].open).toBe(true);

    expect(toastReturn.id).toBeDefined();
    expect(typeof toastReturn.dismiss).toBe('function');
    expect(typeof toastReturn.update).toBe('function');
  });

  test('toast().dismiss(): dismisses the specific toast', () => {
    const { result } = renderHook(() => useToast());
    let toastControl: any;
    act(() => {
      toastControl = globalToast({ title: 'Test Dismiss' });
    });

    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      toastControl.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);
    const toastTimeouts = require('../use-toast').toastTimeouts as Map<string, NodeJS.Timeout>;
    expect(toastTimeouts.has(toastControl.id)).toBe(true); // Check removal queue
  });

  test('toast().update(): updates the specific toast', () => {
    const { result } = renderHook(() => useToast());
    let toastControl: any;
    act(() => {
      toastControl = globalToast({ title: 'Initial Update Title' });
    });

    expect(result.current.toasts[0].title).toBe('Initial Update Title');

    act(() => {
      toastControl.update({ title: 'Updated Title by Update' });
    });
    
    expect(result.current.toasts[0].title).toBe('Updated Title by Update');
    // Check other properties remain, e.g. open status
    expect(result.current.toasts[0].open).toBe(true);
  });
  
  test('useToast().dismiss(id): dismisses a specific toast by id', () => {
    const { result } = renderHook(() => useToast());
    let toast1: any, toast2: any;

    // Add multiple toasts - due to TOAST_LIMIT = 1, only the last one will be active
    // To test dismiss(id) properly, we need to ensure the target toast is in the list
    // Let's assume TOAST_LIMIT is higher for this test or test the effect on the single allowed toast
    // Given TOAST_LIMIT is 1, this test will work on that single toast.
    act(() => {
      toast1 = globalToast({ title: 'Toast A' }); // This will be immediately replaced if limit is 1
      toast2 = globalToast({ title: 'Toast B' }); // This is the one that will stay
    });
    
    const currentToastId = result.current.toasts[0].id; // Should be toast2's id
    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      result.current.dismiss(currentToastId);
    });

    expect(result.current.toasts[0].open).toBe(false);
    const toastTimeouts = require('../use-toast').toastTimeouts as Map<string, NodeJS.Timeout>;
    expect(toastTimeouts.has(currentToastId)).toBe(true);
  });

  test('useToast().dismiss(): dismisses all toasts (marks them as not open)', () => {
    const { result } = renderHook(() => useToast());
    // Again, with TOAST_LIMIT = 1, "all toasts" means the one toast.
    act(() => {
      globalToast({ title: 'Toast C' });
    });
    
    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      result.current.dismiss(); // Dismiss all
    });

    expect(result.current.toasts[0].open).toBe(false);
    const toastTimeouts = require('../use-toast').toastTimeouts as Map<string, NodeJS.Timeout>;
    expect(toastTimeouts.has(result.current.toasts[0].id)).toBe(true);
  });

  test('toast onOpenChange callback is wired up to dismiss', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      globalToast({ title: 'Test onOpenChange' });
    });

    const toastInstance = result.current.toasts[0];
    expect(toastInstance.open).toBe(true);

    // Simulate the Toast component calling onOpenChange(false)
    act(() => {
      if (toastInstance.onOpenChange) {
        toastInstance.onOpenChange(false);
      }
    });
    
    expect(result.current.toasts[0].open).toBe(false);
    const toastTimeouts = require('../use-toast').toastTimeouts as Map<string, NodeJS.Timeout>;
    expect(toastTimeouts.has(toastInstance.id)).toBe(true);
  });

  test('TOAST_REMOVE_DELAY: toast is removed after delay when dismissed', () => {
    const { result } = renderHook(() => useToast());
    let toastControl: any;
    act(() => {
      toastControl = globalToast({ title: 'Test Removal Delay' });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      toastControl.dismiss();
    });
    
    expect(result.current.toasts[0].open).toBe(false);
    expect(result.current.toasts).toHaveLength(1); // Still there, just open: false

    // Fast-forward timers
    act(() => {
      // TOAST_REMOVE_DELAY is 1,000,000 ms.
      // We are advancing by that amount.
      jest.advanceTimersByTime(1000000); 
    });
    
    // After advancing timers, the REMOVE_TOAST action should have been dispatched
    expect(result.current.toasts).toHaveLength(0);
  });
});
