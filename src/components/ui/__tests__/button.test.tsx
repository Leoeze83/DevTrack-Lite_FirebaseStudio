import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../button'; // Adjust path as necessary

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: /Click Me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  test('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    let buttonElement = screen.getByRole('button', { name: /Delete/i });
    expect(buttonElement).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Submit</Button>);
    buttonElement = screen.getByRole('button', { name: /Submit/i });
    expect(buttonElement).toHaveClass('border-input');
  });

  test('renders as child when asChild prop is true', () => {
    render(<Button asChild><a>Link Button</a></Button>);
    // Check if it's an <a> tag rendered as a child
    const element = screen.getByText(/Link Button/i);
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('A');
    // Optionally, verify it's not a button
    const buttonRole = screen.queryByRole('button', { name: /Link Button/i });
    expect(buttonRole).not.toBeInTheDocument();
  });
});
