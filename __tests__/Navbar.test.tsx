import { render, screen } from '@testing-library/react';
import Navbar from '../components/Navbar';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
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
});
