import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketForm } from '../ticket-form';
import * as ticketStore from '@/lib/hooks/use-ticket-store';
import * as actions from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/lib/hooks/use-ticket-store');
jest.mock('@/app/actions');
jest.mock('@/hooks/use-toast');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockAddTicket = jest.fn();
const mockToast = jest.fn();
const mockCategorizeTicketDescription = actions.categorizeTicketDescription as jest.Mock;

describe('TicketForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ticketStore.useTicketStore as jest.Mock).mockReturnValue({
      addTicket: mockAddTicket,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
  });

  const renderForm = () => render(<TicketForm />);

  test('renders all form fields and submit button', () => {
    renderForm();
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prioridad/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Ticket/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /IA Auto-Categorizar y Priorizar/i })).toBeInTheDocument();
  });

  test('user input is correctly reflected in text fields', async () => {
    renderForm();
    const titleInput = screen.getByLabelText(/Título/i);
    const descriptionInput = screen.getByLabelText(/Descripción/i);

    await userEvent.type(titleInput, 'Test Title');
    await userEvent.type(descriptionInput, 'Test Description');

    expect(titleInput).toHaveValue('Test Title');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  test('selecting priority is correctly reflected', async () => {
    renderForm();
    const prioritySelectTrigger = screen.getByLabelText(/Prioridad/i);
    await userEvent.click(prioritySelectTrigger);
    
    const lowPriorityOption = await screen.findByText('Baja');
    await userEvent.click(lowPriorityOption);

    // After selection, the trigger should display "Baja"
    // Radix Select updates the text within the trigger.
    // We find it by its text content within the trigger.
    expect(prioritySelectTrigger.textContent).toContain('Baja');
  });
  
  test('user input for category is correctly reflected', async () => {
    renderForm();
    const categoryInput = screen.getByLabelText(/Categoría/i);
    await userEvent.type(categoryInput, 'Bug Report');
    expect(categoryInput).toHaveValue('Bug Report');
  });

  test('form submission calls addTicket with correct data and shows toast', async () => {
    const mockRouterPush = jest.fn();
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({
        push: mockRouterPush,
    });

    mockAddTicket.mockReturnValue({ id: '1', title: 'Valid Title' }); // Mock return value for addTicket
    renderForm();

    await userEvent.type(screen.getByLabelText(/Título/i), 'Valid Title');
    await userEvent.type(screen.getByLabelText(/Descripción/i), 'Valid description with enough characters.');
    await userEvent.type(screen.getByLabelText(/Categoría/i), 'Bug');
    
    const prioritySelectTrigger = screen.getByLabelText(/Prioridad/i);
    await userEvent.click(prioritySelectTrigger);
    const mediumPriorityOption = await screen.findByText('Media');
    await userEvent.click(mediumPriorityOption);

    await userEvent.click(screen.getByRole('button', { name: /Crear Ticket/i }));

    await waitFor(() => {
      expect(mockAddTicket).toHaveBeenCalledWith({
        title: 'Valid Title',
        description: 'Valid description with enough characters.',
        category: 'Bug',
        priority: 'medium',
      });
    });
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "¡Ticket Creado!",
        description: `El ticket "Valid Title" ha sido creado exitosamente.`,
      }));
    });
    expect(mockRouterPush).toHaveBeenCalledWith('/');
  });

  test('submit button is disabled during submission', async () => {
    mockAddTicket.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ id: '1', title: 'Test' }), 100)));
    renderForm();
    
    await userEvent.type(screen.getByLabelText(/Título/i), 'Test Title Long Enough');
    await userEvent.type(screen.getByLabelText(/Descripción/i), 'Test Description Long Enough');
    await userEvent.type(screen.getByLabelText(/Categoría/i), 'Test Category');
    const prioritySelectTrigger = screen.getByLabelText(/Prioridad/i);
    await userEvent.click(prioritySelectTrigger);
    await userEvent.click(await screen.findByText('Alta'));

    const submitButton = screen.getByRole('button', { name: /Crear Ticket/i });
    userEvent.click(submitButton); // No await here, we want to check the state during submission

    await waitFor(() => expect(submitButton).toBeDisabled());
    await waitFor(() => expect(submitButton).not.toBeDisabled(), { timeout: 200 }); // Wait for submission to complete
  });
  
  describe('AI Categorization', () => {
    test('successful AI categorization updates category and priority fields and shows toast', async () => {
      mockCategorizeTicketDescription.mockResolvedValue({
        category: 'AI Category',
        priority: 'high',
      });
      renderForm();

      await userEvent.type(screen.getByLabelText(/Descripción/i), 'This is a test description for AI.');
      await userEvent.click(screen.getByRole('button', { name: /IA Auto-Categorizar y Priorizar/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Categoría/i)).toHaveValue('AI Category');
        // For Select, check the displayed value. Radix updates the trigger text.
        expect(screen.getByLabelText(/Prioridad/i).textContent).toContain('Alta');
      });
      
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Categorización IA Exitosa",
        description: `Categoría establecida a "AI Category" y prioridad a "high".`,
      }));
    });

    test('AI categorization failure shows error toast', async () => {
      mockCategorizeTicketDescription.mockResolvedValue({ error: 'AI failed' });
      renderForm();

      await userEvent.type(screen.getByLabelText(/Descripción/i), 'Another description for AI.');
      await userEvent.click(screen.getByRole('button', { name: /IA Auto-Categorizar y Priorizar/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
          title: "Falló la Categorización IA",
          description: "AI failed",
          variant: "destructive",
        }));
      });
    });
    
    test('AI categorization with unexpected error shows error toast', async () => {
      mockCategorizeTicketDescription.mockRejectedValue(new Error('Network error'));
      renderForm();

      await userEvent.type(screen.getByLabelText(/Descripción/i), 'Description for unexpected error.');
      await userEvent.click(screen.getByRole('button', { name: /IA Auto-Categorizar y Priorizar/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
          title: "Error en Categorización IA",
          description: "Ocurrió un error inesperado.",
          variant: "destructive",
        }));
      });
    });

    test('AI categorization button is disabled during processing', async () => {
      mockCategorizeTicketDescription.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ category: 'Test', priority: 'low' }), 100)));
      renderForm();
      
      await userEvent.type(screen.getByLabelText(/Descripción/i), 'Processing test description.');
      const aiButton = screen.getByRole('button', { name: /IA Auto-Categorizar y Priorizar/i });
      userEvent.click(aiButton);

      await waitFor(() => expect(aiButton).toBeDisabled());
      expect(screen.getByTestId('loader-2-icon')).toBeInTheDocument(); // Assuming Loader2 has a distinct visual or data-testid
      await waitFor(() => expect(aiButton).not.toBeDisabled(), { timeout: 200 });
    });

    test('AI categorization shows toast if description is empty', async () => {
        renderForm();
        const aiButton = screen.getByRole('button', { name: /IA Auto-Categorizar y Priorizar/i });
        await userEvent.click(aiButton);

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
                title: "No se puede categorizar",
                description: "Por favor, ingresa una descripción primero.",
                variant: "destructive",
            }));
        });
        expect(mockCategorizeTicketDescription).not.toHaveBeenCalled();
    });
  });

  test('form validation errors are displayed for required fields', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /Crear Ticket/i }));

    expect(await screen.findByText(/El título debe tener al menos 5 caracteres./i)).toBeInTheDocument();
    expect(await screen.findByText(/La descripción debe tener al menos 10 caracteres./i)).toBeInTheDocument();
    expect(await screen.findByText(/La categoría es obligatoria./i)).toBeInTheDocument();
    // For react-hook-form + Zod, the Select component's error might be tricky.
    // We check if the overall submission is blocked.
    // If specific error message for select is hard to get, ensure addTicket is NOT called
    expect(mockAddTicket).not.toHaveBeenCalled();
  });

  test('form validation error for priority field', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/Título/i), 'Valid Title');
    await userEvent.type(screen.getByLabelText(/Descripción/i), 'Valid description with enough characters.');
    await userEvent.type(screen.getByLabelText(/Categoría/i), 'Valid Category');
    // Not selecting priority
  
    await userEvent.click(screen.getByRole('button', { name: /Crear Ticket/i }));
  
    // For Zod, the error message comes from the schema definition
    expect(await screen.findByText(/La prioridad es obligatoria./i)).toBeInTheDocument();
    expect(mockAddTicket).not.toHaveBeenCalled();
  });
  
  // Note: The current TicketForm doesn't have explicit props for initialData or isLoading.
  // If those were added, tests would look like this:
  // test('pre-fills with initialData for editing', () => {
  //   const initialData = { title: 'Initial Title', description: 'Initial Desc', category: 'Initial Cat', priority: 'high' as Priority };
  //   render(<TicketForm initialData={initialData} />);
  //   expect(screen.getByLabelText(/Título/i)).toHaveValue('Initial Title');
  //   // ... and so on for other fields
  // });

  // test('submit button is disabled when isLoading prop is true', () => {
  //   render(<TicketForm isLoading={true} />);
  //   expect(screen.getByRole('button', { name: /Crear Ticket/i })).toBeDisabled();
  // });
});
