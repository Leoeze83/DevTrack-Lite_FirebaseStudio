import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile'; // Adjust path as necessary

const MOBILE_BREAKPOINT = 768;

// Store the original matchMedia and innerWidth
const originalMatchMedia = window.matchMedia;
const originalInnerWidth = window.innerWidth;

let mockMediaQueryList: {
  matches: boolean;
  media: string;
  onchange: null | ((this: MediaQueryList, ev: MediaQueryListEvent) => any);
  addListener: jest.Mock; // Deprecated
  removeListener: jest.Mock; // Deprecated
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  dispatchEvent: jest.Mock;
  activeListener: null | ((event: { matches: boolean; media: string }) => void);
};

const setupMatchMediaMock = (initialWidth: number) => {
  // Set initial innerWidth
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: initialWidth,
  });

  mockMediaQueryList = {
    matches: initialWidth < MOBILE_BREAKPOINT,
    media: `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn((event, listener) => {
      if (event === 'change') {
        mockMediaQueryList.activeListener = listener;
      }
    }),
    removeEventListener: jest.fn((event, listener) => {
      if (event === 'change' && mockMediaQueryList.activeListener === listener) {
        mockMediaQueryList.activeListener = null;
      }
    }),
    dispatchEvent: jest.fn(),
    activeListener: null,
  };

  window.matchMedia = jest.fn().mockImplementation(query => {
    // Update matches based on current window.innerWidth for the specific query
    // This ensures that if matchMedia is called multiple times, it reflects the current state
    mockMediaQueryList.matches = window.innerWidth < MOBILE_BREAKPOINT && query === `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
    mockMediaQueryList.media = query;
    return mockMediaQueryList;
  }) as any;
};

const simulateResize = (newWidth: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: newWidth,
  });
  // Recalculate matches based on the new width for the specific media query the hook uses
  const newMatches = newWidth < MOBILE_BREAKPOINT;
  if (mockMediaQueryList.matches !== newMatches && mockMediaQueryList.activeListener) {
    mockMediaQueryList.matches = newMatches;
    act(() => {
      mockMediaQueryList.activeListener!({ matches: newMatches, media: `(max-width: ${MOBILE_BREAKPOINT - 1}px)` } as any);
    });
  } else if (mockMediaQueryList.activeListener) {
    // If matches didn't change, but we want to ensure listener is called for coverage or specific scenarios
     act(() => {
       mockMediaQueryList.activeListener!({ matches: newMatches, media: `(max-width: ${MOBILE_BREAKPOINT - 1}px)` } as any);
     });
  }
};


describe('useIsMobile Hook', () => {
  beforeEach(() => {
    // No need to store initialInnerWidth here, setupMatchMediaMock handles it.
    // jest.restoreAllMocks() is not needed if we are not using jest.spyOn for matchMedia.
  });

  afterEach(() => {
    // Restore original window properties
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
     if (mockMediaQueryList) {
        mockMediaQueryList.activeListener = null; // Clear listener reference
     }
  });

  test('initial state: returns true when innerWidth is less than MOBILE_BREAKPOINT', () => {
    setupMatchMediaMock(MOBILE_BREAKPOINT - 100); // e.g., 668px
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  test('initial state: returns false when innerWidth is greater than or equal to MOBILE_BREAKPOINT', () => {
    setupMatchMediaMock(MOBILE_BREAKPOINT + 100); // e.g., 868px
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
  
  test('initial state: returns false when innerWidth is exactly MOBILE_BREAKPOINT', () => {
    setupMatchMediaMock(MOBILE_BREAKPOINT); // 768px
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });


  test('event listener: updates to true when window resizes to mobile', () => {
    setupMatchMediaMock(MOBILE_BREAKPOINT + 100); // Start non-mobile
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false); // Initial check

    simulateResize(MOBILE_BREAKPOINT - 100);
    
    expect(result.current).toBe(true);
  });

  test('event listener: updates to false when window resizes to desktop', () => {
    setupMatchMediaMock(MOBILE_BREAKPOINT - 100); // Start mobile
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true); // Initial check

    simulateResize(MOBILE_BREAKPOINT + 100);

    expect(result.current).toBe(false);
  });

  test('cleanup: removeEventListener is called on unmount', () => {
    setupMatchMediaMock(MOBILE_BREAKPOINT - 100);
    const { unmount } = renderHook(() => useIsMobile());

    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
    const storedListener = mockMediaQueryList.addEventListener.mock.calls[0][1];

    unmount();

    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
      'change',
      storedListener // Ensure it's the same listener instance
    );
     expect(mockMediaQueryList.activeListener).toBeNull(); // Listener should be cleared
  });
  
  test('initial state is undefined then correctly set (testing the undefined intermediate state)', () => {
    setupMatchMediaMock(MOBILE_BREAKPOINT - 1); 
    const { result } = renderHook(() => useIsMobile());
    // The hook returns `!!isMobile`. Initially `isMobile` is undefined in the hook's state.
    // `useEffect` runs, calls `setIsMobile`.
    // `renderHook` ensures effects are flushed before returning the result.
    expect(result.current).toBe(true); // After useEffect runs

    setupMatchMediaMock(MOBILE_BREAKPOINT + 1);
    const { result: result2 } = renderHook(() => useIsMobile());
    expect(result2.current).toBe(false); // After useEffect runs
  });
});
