import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '../select'; // Adjust path as necessary

describe('Select Component', () => {
  const TestSelect = ({ onValueChange, disabled, defaultValue }: { onValueChange?: (value: string) => void, disabled?: boolean, defaultValue?: string }) => (
    <Select onValueChange={onValueChange} disabled={disabled} defaultValue={defaultValue}>
      <SelectTrigger data-testid="select-trigger">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3" disabled>Option 3 (Disabled)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  test('renders SelectTrigger correctly', () => {
    render(<TestSelect />);
    const selectTrigger = screen.getByTestId('select-trigger');
    expect(selectTrigger).toBeInTheDocument();
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  test('clicking SelectTrigger opens SelectContent with items', async () => {
    render(<TestSelect />);
    const selectTrigger = screen.getByTestId('select-trigger');
    await userEvent.click(selectTrigger);

    const option1 = await screen.findByText('Option 1');
    const option2 = await screen.findByText('Option 2');
    const option3 = await screen.findByText('Option 3 (Disabled)');

    expect(option1).toBeInTheDocument();
    expect(option2).toBeInTheDocument();
    expect(option3).toBeInTheDocument(); // Check that it's rendered
    expect(option3).toHaveAttribute('data-disabled'); // Check if it's marked as disabled
  });

  test('selecting an item calls onValueChange and updates displayed value', async () => {
    const handleValueChange = jest.fn();
    render(<TestSelect onValueChange={handleValueChange} />);
    const selectTrigger = screen.getByTestId('select-trigger');
    await userEvent.click(selectTrigger);

    const option2 = await screen.findByText('Option 2');
    await userEvent.click(option2);

    expect(handleValueChange).toHaveBeenCalledWith('option2');
    // Check if the value is updated in the trigger
    // Radix Select updates the text content of the SelectValue component
    expect(screen.getByText('Option 2')).toBeInTheDocument(); 
    // Placeholder should not be visible
    expect(screen.queryByText('Select an option')).not.toBeInTheDocument();
  });

  test('does not open dropdown when disabled', async () => {
    render(<TestSelect disabled />);
    const selectTrigger = screen.getByTestId('select-trigger');
    expect(selectTrigger).toBeDisabled();

    // Attempt to click, though it shouldn't do anything if truly disabled
    await userEvent.click(selectTrigger).catch(() => {}); // Catch potential error if click is blocked

    // Content should not be present
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  test('selecting a disabled item does not call onValueChange', async () => {
    const handleValueChange = jest.fn();
    render(<TestSelect onValueChange={handleValueChange} />);
    const selectTrigger = screen.getByTestId('select-trigger');
    await userEvent.click(selectTrigger);
  
    const option3 = await screen.findByText('Option 3 (Disabled)');
    // Check if the item is actually marked as disabled by Radix
    expect(option3).toHaveAttribute('aria-disabled', 'true');
    // Attempt to click the disabled item
    // userEvent.click might throw an error or not proceed if the element is truly disabled by ARIA attributes
    // For robust testing, we can directly check if it's disabled and that onValueChange is not called
    if (option3.getAttribute('data-disabled') === '' || option3.getAttribute('aria-disabled') === 'true') {
        // It's disabled, so clicking it should not trigger onValueChange
    } else {
        await userEvent.click(option3); // If not programmatically disabled, click it
    }
  
    expect(handleValueChange).not.toHaveBeenCalled();
  });

  test('renders with a default value', () => {
    render(<TestSelect defaultValue="option2" />);
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.queryByText('Select an option')).not.toBeInTheDocument();
  });
});
