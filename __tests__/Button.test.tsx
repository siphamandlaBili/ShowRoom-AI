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

  // ── Default prop values ───────────────────────────────────────────────────

  it('has type="button" by default', () => {
    render(<Button text="Default Type" />);
    expect(screen.getByText('Default Type')).toHaveAttribute('type', 'button');
  });

  it('is not disabled by default', () => {
    render(<Button text="Not Disabled" />);
    expect(screen.getByText('Not Disabled')).not.toBeDisabled();
  });

  // ── CTA variant ───────────────────────────────────────────────────────────

  it('renders cta with onClick as a <button> element, not an anchor', () => {
    render(<Button text="CTA Button with Click" variant="cta" onClick={() => {}} />);
    const el = screen.getByText('CTA Button with Click');
    expect(el.tagName).toBe('BUTTON');
  });

  it('cta anchor has the correct href', () => {
    render(<Button text="CTA Anchor" variant="cta" />);
    expect(screen.getByText('CTA Anchor')).toHaveAttribute('href', '#upload');
  });

  it('cta with onClick calls the handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button text="CTA Click" variant="cta" onClick={handleClick} />);

    await userEvent.click(screen.getByText('CTA Click'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // ── Combined classes ──────────────────────────────────────────────────────

  it('combines variant class with custom className', () => {
    render(<Button text="Combined" variant="outline" className="extra-class" />);
    const button = screen.getByText('Combined');
    expect(button).toHaveClass('btn-outline');
    expect(button).toHaveClass('extra-class');
  });

  it('has no extra className when className prop is empty', () => {
    render(<Button text="No Extra" />);
    const button = screen.getByText('No Extra');
    // Only the variant class should be present (btn-default)
    expect(button.className.trim()).toBe('btn-default');
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it('renders a real <button> element for non-cta variants', () => {
    render(<Button text="Is Button" variant="default" />);
    expect(screen.getByText('Is Button').tagName).toBe('BUTTON');
  });

  it('renders a real <button> element for ghost variant', () => {
    render(<Button text="Ghost" variant="ghost" />);
    expect(screen.getByText('Ghost').tagName).toBe('BUTTON');
  });

  it('renders a real <button> element for outline variant', () => {
    render(<Button text="Outline" variant="outline" />);
    expect(screen.getByText('Outline').tagName).toBe('BUTTON');
  });

  // ── Reset type ────────────────────────────────────────────────────────────

  it('renders with reset type', () => {
    render(<Button text="Reset" type="reset" />);
    expect(screen.getByText('Reset')).toHaveAttribute('type', 'reset');
  });
});
