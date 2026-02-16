import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../components/Navbar';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { username?: string }) => {
      if (key === 'navbar.greeting' && options?.username) {
        return `Hello, ${options.username}`;
      }
      return key;
    },
  }),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Box: () => <div data-testid="box-icon" />,
}));

describe('Navbar', () => {
  it('renders without crashing', () => {
    render(<Navbar />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays the brand name', () => {
    render(<Navbar />);
    expect(screen.getByText('navbar.brand')).toBeInTheDocument();
  });

  it('shows login and get started buttons when not signed in', () => {
    render(<Navbar />);
    expect(screen.getByText('navbar.login')).toBeInTheDocument();
    expect(screen.getByText('navbar.getStarted')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('navbar.product')).toBeInTheDocument();
    expect(screen.getByText('navbar.pricing')).toBeInTheDocument();
    expect(screen.getByText('navbar.community')).toBeInTheDocument();
  });

  it('shows logout button and greeting when signed in', () => {
    render(<Navbar isSignedIn={true} username="Sipha" />);
    expect(screen.getByText('Hello, Sipha')).toBeInTheDocument();
    expect(screen.getByText('navbar.logout')).toBeInTheDocument();
    expect(screen.queryByText('navbar.login')).not.toBeInTheDocument();
  });

  it('calls onAuthClick when login button is clicked', async () => {
    const handleAuthClick = jest.fn();
    render(<Navbar isSignedIn={false} onAuthClick={handleAuthClick} />);

    const loginButton = screen.getByText('navbar.login');
    await userEvent.click(loginButton);

    expect(handleAuthClick).toHaveBeenCalledTimes(1);
  });

  it('calls onAuthClick when logout button is clicked', async () => {
    const handleAuthClick = jest.fn();
    render(<Navbar isSignedIn={true} onAuthClick={handleAuthClick} />);

    const logoutButton = screen.getByText('navbar.logout');
    await userEvent.click(logoutButton);

    expect(handleAuthClick).toHaveBeenCalledTimes(1);
  });

  it('does not display greeting when not signed in', () => {
    render(<Navbar isSignedIn={false} />);
    expect(screen.queryByText(/Hello/)).not.toBeInTheDocument();
  });
});
