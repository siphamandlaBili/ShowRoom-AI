import { fireEvent, render, screen } from '@testing-library/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Home from '../app/routes/home';

const killMock = jest.fn();
const revertMock = jest.fn();
const quickToSetterMock = jest.fn();

jest.mock('components/Navbar', () => () => <div data-testid="navbar" />);

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        'hero.introducing': 'Introducing ShowRoom 1.0',
        'hero.title': 'Design Better Spaces',
        'hero.subtitle': 'Architecture-first AI renders',
        'hero.getStarted': 'Get Started',
        'hero.upload': 'Upload Project',
        'hero.uploadDescription': 'Bring your sketches to life',
        'hero.uploadImage': 'Drop an image to begin',
        'projects.title': 'Featured Projects',
        'projects.description': 'Recent visualisations',
        'projects.badge': 'Rendered',
      };

      return dictionary[key] ?? key;
    },
  }),
}));

jest.mock('lucide-react', () => ({
  ArrowRight: () => <svg data-testid="arrow-right" />,
  ArrowUpRight: () => <svg data-testid="arrow-up-right" />,
  Clock: () => <svg data-testid="clock-icon" />,
  Layers: () => <svg data-testid="layers-icon" />,
}));

jest.mock('gsap', () => ({
  gsap: {
    registerPlugin: jest.fn(),
    context: jest.fn((callback: () => void) => {
      callback();
      return { revert: revertMock };
    }),
    fromTo: jest.fn(),
    quickTo: jest.fn(() => quickToSetterMock),
    to: jest.fn(() => ({ kill: killMock })),
  },
}));

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {},
}));

describe('Home route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders hero and projects content', () => {
    render(<Home />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Design Better Spaces');
    expect(screen.getByText('Architecture-first AI renders')).toBeInTheDocument();
    expect(screen.getByText('Featured Projects')).toBeInTheDocument();
  });

  it('splits hero title into character spans for magnify interaction', () => {
    const titleText = 'Design Better Spaces';
    const expectedCharacterCount = Array.from(titleText).length;

    const { container } = render(<Home />);

    const characters = container.querySelectorAll('.hero-title-char');
    expect(characters).toHaveLength(expectedCharacterCount);
  });

  it('initializes GSAP plugins and interactions', () => {
    const { container } = render(<Home />);

    const title = container.querySelector('.hero-title');
    const uploadShell = container.querySelector('.upload-shell');

    expect(title).not.toBeNull();
    expect(uploadShell).not.toBeNull();

    if (!title || !uploadShell) {
      throw new Error('Expected hero title and upload shell elements to exist');
    }

    fireEvent.mouseMove(title, { clientX: 100, clientY: 100 });
    fireEvent.mouseLeave(title);
    fireEvent.mouseMove(uploadShell, { clientX: 150, clientY: 110 });
    fireEvent.mouseLeave(uploadShell);

    expect(gsap.registerPlugin).toHaveBeenCalledWith(ScrollTrigger);
    expect(gsap.quickTo).toHaveBeenCalled();
    expect(gsap.to).toHaveBeenCalled();
  });

  it('cleans up GSAP context and grid tween on unmount', () => {
    const { unmount } = render(<Home />);

    unmount();

    expect(revertMock).toHaveBeenCalled();
    expect(killMock).toHaveBeenCalled();
  });
});
