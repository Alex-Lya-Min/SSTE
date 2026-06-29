import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Preview } from '../../components/Preview';

describe('Preview', () => {
  it('renders without crashing on empty html', () => {
    const { container } = render(<Preview html="" />);
    expect(container.querySelector('.preview')).toBeInTheDocument();
  });

  it('renders paragraph HTML', () => {
    render(<Preview html="<p>Hello world</p>" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders h1 heading', () => {
    render(<Preview html="<h1>My Title</h1>" />);
    expect(screen.getByRole('heading', { level: 1, name: 'My Title' })).toBeInTheDocument();
  });

  it('renders list items', () => {
    render(<Preview html="<ul><li>Item 1</li><li>Item 2</li></ul>" />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders bold text', () => {
    render(<Preview html="<p><strong>Bold</strong></p>" />);
    expect(screen.getByText('Bold')).toBeInTheDocument();
  });

  it('applies .preview class to wrapper', () => {
    const { container } = render(<Preview html="<p>test</p>" />);
    expect(container.firstChild).toHaveClass('preview');
  });

  it('updates content when html prop changes', () => {
    const { rerender } = render(<Preview html="<p>First</p>" />);
    expect(screen.getByText('First')).toBeInTheDocument();

    rerender(<Preview html="<p>Second</p>" />);
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.queryByText('First')).toBeNull();
  });
});
