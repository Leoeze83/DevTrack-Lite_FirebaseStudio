import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../input'; // Adjust path as necessary

describe('Input Component', () => {
  test('renders an input element', () => {
    render(<Input />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
  });

  test('applies type prop correctly', () => {
    const { rerender } = render(<Input type="text" />);
    let inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveAttribute('type', 'text');

    rerender(<Input type="password" />);
    // Password fields are also textboxes, but with a different type attribute
    inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveAttribute('type', 'password');
    
    rerender(<Input type="number" />);
    inputElement = screen.getByRole('spinbutton'); // Input type 'number' has role 'spinbutton'
    expect(inputElement).toHaveAttribute('type', 'number');
  });

  test('displays placeholder prop correctly', () => {
    render(<Input placeholder="Enter text here" />);
    const inputElement = screen.getByPlaceholderText('Enter text here');
    expect(inputElement).toBeInTheDocument();
  });

  test('disables the input when disabled prop is true', () => {
    render(<Input disabled />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeDisabled();
  });

  test('calls onChange handler when value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
