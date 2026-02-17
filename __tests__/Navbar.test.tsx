import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../components/Navbar';

// Mock the auth context
const mockAuthContext = {
  isSignedIn: false,
  username: null as string | null,
  userId: null as string | null,
  refreshAuth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
};

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

// Mock react-router
jest.mock('react-router', () => ({
  useOutletContext: () => mockAuthContext,
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Box: () => <div data-testid="box-icon" />,
}));

describe('Navbar', () => {
  beforeEach(() => {
    // Reset mock auth context before each test
    mockAuthContext.isSignedIn = false;
    mockAuthContext.username = null;
    mockAuthContext.userId = null;
    mockAuthContext.signIn = jest.fn();
    mockAuthContext.signOut = jest.fn();
    mockAuthContext.refreshAuth = jest.fn();
  });

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
    mockAuthContext.isSignedIn = true;
    mockAuthContext.username = 'Sipha';
    render(<Navbar />);
    expect(screen.getByText('Hello, Sipha')).toBeInTheDocument();
    expect(screen.getByText('navbar.logout')).toBeInTheDocument();
    expect(screen.queryByText('navbar.login')).not.toBeInTheDocument();
  });

  it('calls signIn when login button is clicked', async () => {
    render(<Navbar />);

    const loginButton = screen.getByText('navbar.login');
    await userEvent.click(loginButton);

    expect(mockAuthContext.signIn).toHaveBeenCalledTimes(1);
  });

  it('calls signOut when logout button is clicked', async () => {
    mockAuthContext.isSignedIn = true;
    render(<Navbar />);

    const logoutButton = screen.getByText('navbar.logout');
    await userEvent.click(logoutButton);

    expect(mockAuthContext.signOut).toHaveBeenCalledTimes(1);
  });

  it('does not display greeting when not signed in', () => {
    render(<Navbar />);
    expect(screen.queryByText(/Hello/)).not.toBeInTheDocument();
  });
});
