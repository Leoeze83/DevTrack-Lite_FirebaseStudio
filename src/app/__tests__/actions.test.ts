import { categorizeTicketDescription, CategorizationResult } from '../actions'; // Adjust path as necessary
// Import the original function for typecasting
import { categorizeTicket as originalAiCategorizeTicket, CategorizeTicketInput } from "@/ai/flows/categorize-ticket";
import type { Priority } from "@/lib/types";

// Automatically mock the entire module
jest.mock("@/ai/flows/categorize-ticket");

// Typecast the automatically mocked function
// Now, originalAiCategorizeTicket refers to an auto-generated Jest mock
const mockedAiCategorizeTicket = originalAiCategorizeTicket as jest.MockedFunction<typeof originalAiCategorizeTicket>;

// Mock console methods
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('categorizeTicketDescription Server Action', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedAiCategorizeTicket.mockReset();
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
  });

  describe('Input Validation', () => {
    test('should return error for empty description string', async () => {
      const result = await categorizeTicketDescription("");
      expect(result).toEqual({ error: "La descripción no puede estar vacía." });
      expect(mockedAiCategorizeTicket).not.toHaveBeenCalled();
    });

    test('should return error for description string with only whitespace', async () => {
      const result = await categorizeTicketDescription("   \t\n   ");
      expect(result).toEqual({ error: "La descripción no puede estar vacía." });
      expect(mockedAiCategorizeTicket).not.toHaveBeenCalled();
    });
  });

  describe('Successful AI Categorization', () => {
    test('should return CategorizationResult from AI flow', async () => {
      const mockAiResponse = { category: "Bug Report", priority: "high", tags: ["login", "issue"] };
      mockedAiCategorizeTicket.mockResolvedValue(mockAiResponse);

      const description = "User cannot log in to the application.";
      const result = await categorizeTicketDescription(description);

      expect(mockedAiCategorizeTicket).toHaveBeenCalledWith({ ticketContent: description } as CategorizeTicketInput);
      expect(result).toEqual({
        category: "Bug Report",
        priority: "high" as Priority,
        tags: ["login", "issue"],
      });
    });

    test('should handle AI response with priority in mixed case (e.g., "Medium")', async () => {
        const mockAiResponse = { category: "Feature Request", priority: "Medium", tags: ["ui", "dashboard"] };
        mockedAiCategorizeTicket.mockResolvedValue(mockAiResponse);
  
        const description = "Please add a new button to the dashboard.";
        const result = await categorizeTicketDescription(description);
  
        expect(result).toEqual({
          category: "Feature Request",
          priority: "medium" as Priority, // Should be lowercased and validated
          tags: ["ui", "dashboard"],
        });
      });
  });

  describe('AI Priority Handling', () => {
    test('should default to "medium" priority and warn if AI returns unrecognized priority', async () => {
      const mockAiResponse = { category: "General Inquiry", priority: "urgent", tags: ["info"] }; // "urgent" is not standard
      mockedAiCategorizeTicket.mockResolvedValue(mockAiResponse);

      const description = "How do I reset my password?";
      const result = await categorizeTicketDescription(description);

      expect(result).toEqual({
        category: "General Inquiry",
        priority: "medium" as Priority, // Defaulted
        tags: ["info"],
      });
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "La IA devolvió una prioridad no reconocida: urgent. Se usará 'media' por defecto."
      );
    });
  });

  describe('Error Handling from AI Flow', () => {
    test('should return error if aiCategorizeTicket throws an error', async () => {
      const aiError = new Error("AI service unavailable");
      mockedAiCategorizeTicket.mockRejectedValue(aiError);

      const description = "This is a valid description.";
      const result = await categorizeTicketDescription(description);

      expect(result).toEqual({
        error: "Error al categorizar el ticket usando IA: AI service unavailable",
      });
      expect(mockConsoleError).toHaveBeenCalledWith("Error categorizing ticket:", aiError);
    });

    test('should return a generic error message if AI throws a non-Error object', async () => {
        mockedAiCategorizeTicket.mockRejectedValue("AI service just broke"); // Throwing a string
  
        const description = "This description will cause a non-Error throw.";
        const result = await categorizeTicketDescription(description);
  
        expect(result).toEqual({
          error: "Error al categorizar el ticket usando IA: Ocurrió un error desconocido",
        });
        expect(mockConsoleError).toHaveBeenCalledWith("Error categorizing ticket:", "AI service just broke");
      });
  });
  
  describe('AI Flow Returning Unexpected Structure', () => {
    test('should handle missing priority from AI (defaults to medium, but might error earlier)', async () => {
      // The current code `result.priority.toLowerCase()` would throw if `result.priority` is undefined.
      // This test verifies that the catch block handles this.
      const mockAiResponse = { category: "Missing Priority", tags: ["test"] } as any; // Missing priority
      mockedAiCategorizeTicket.mockResolvedValue(mockAiResponse);

      const description = "Description for missing priority test.";
      const result = await categorizeTicketDescription(description);

      // Expecting the generic error because accessing .toLowerCase() on undefined throws
      expect(result).toHaveProperty("error");
      expect((result as {error: string}).error).toMatch(/Error al categorizar el ticket usando IA:/);
      // Check that console.error was called with an error related to undefined property access
      expect(mockConsoleError).toHaveBeenCalledWith("Error categorizing ticket:", expect.any(TypeError)); 
    });

    test('should handle missing category from AI', async () => {
      // If category is missing, it should still pass it as undefined.
      const mockAiResponse = { priority: "low", tags: ["test"] } as any; // Missing category
      mockedAiCategorizeTicket.mockResolvedValue(mockAiResponse);

      const description = "Description for missing category test.";
      const result = await categorizeTicketDescription(description);

      expect(result).toEqual({
        category: undefined, // Category will be undefined
        priority: "low" as Priority,
        tags: ["test"],
      });
       expect(mockConsoleError).not.toHaveBeenCalled(); // Should not log an error for this case
    });
  });
});
