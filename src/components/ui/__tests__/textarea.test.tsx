import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../textarea'; // Adjust path as necessary

describe('Textarea Component', () => {
  test('renders a textarea element', () => {
    render(<Textarea />);
    const textareaElement = screen.getByRole('textbox');
    expect(textareaElement).toBeInTheDocument();
  });

  test('displays placeholder prop correctly', () => {
    render(<Textarea placeholder="Enter text here" />);
    const textareaElement = screen.getByPlaceholderText('Enter text here');
    expect(textareaElement).toBeInTheDocument();
  });

  test('disables the textarea when disabled prop is true', () => {
    render(<Textarea disabled />);
    const textareaElement = screen.getByRole('textbox');
    expect(textareaElement).toBeDisabled();
  });

  test('calls onChange handler when value changes', async () => {
    const handleChange = jest.fn();
    render(<Textarea onChange={handleChange} />);
    const textareaElement = screen.getByRole('textbox');
    await userEvent.type(textareaElement, 'new value');
    expect(handleChange).toHaveBeenCalledTimes('new value'.length); // userEvent.type calls onChange for each character
  });

  test('correctly reflects the typed value', async () => {
    render(<Textarea />);
    const textareaElement = screen.getByRole('textbox') as HTMLTextAreaElement;
    await userEvent.type(textareaElement, 'Hello world');
    expect(textareaElement.value).toBe('Hello world');
  });

  test('applies custom className', () => {
    render(<Textarea className="custom-class" />);
    const textareaElement = screen.getByRole('textbox');
    expect(textareaElement).toHaveClass('custom-class');
  });

  test('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
