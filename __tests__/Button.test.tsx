import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../components/ui/Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button text="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies default variant when not specified', () => {
    render(<Button text="Default Button" />);
    const button = screen.getByText('Default Button');
    expect(button).toHaveClass('btn-default');
  });

  it('applies ghost variant class', () => {
    render(<Button text="Ghost Button" variant="ghost" />);
    const button = screen.getByText('Ghost Button');
    expect(button).toHaveClass('login');
  });

  it('applies outline variant class', () => {
    render(<Button text="Outline Button" variant="outline" />);
    const button = screen.getByText('Outline Button');
    expect(button).toHaveClass('btn-outline');
  });

  it('applies cta variant class', () => {
    render(<Button text="CTA Button" variant="cta" onClick={() => {}} />);
    const button = screen.getByText('CTA Button');
    expect(button).toHaveClass('cta');
  });

  it('renders as anchor when variant is cta and no onClick', () => {
    render(<Button text="CTA Link" variant="cta" />);
    const link = screen.getByText('CTA Link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#upload');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button text="Clickable" onClick={handleClick} />);

    await userEvent.click(screen.getByText('Clickable'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Button text="Custom Class" className="my-custom-class" />);
    const button = screen.getByText('Custom Class');
    expect(button).toHaveClass('my-custom-class');
  });

  it('renders with submit type', () => {
    render(<Button text="Submit" type="submit" />);
    const button = screen.getByText('Submit');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('renders disabled button', () => {
    render(<Button text="Disabled" disabled={true} />);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = jest.fn();
    render(<Button text="Disabled Click" onClick={handleClick} disabled={true} />);

    await userEvent.click(screen.getByText('Disabled Click'));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
