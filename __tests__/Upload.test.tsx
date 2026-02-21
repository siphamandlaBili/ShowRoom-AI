import { render, screen, fireEvent, act } from '@testing-library/react';
import Upload from '../components/Upload';

// Mirror the real values from lib/constants so fake-timer math stays accurate
const PROGRESS_INTERVAL_MS = 100;
const PROGRESS_STEP = 5;
const REDIRECT_DELAY_MS = 600;

// Prevent import.meta.env (Vite-only) from blowing up in Jest
// — handled globally via moduleNameMapper → lib/__mocks__/constants.ts

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockAuthContext = {
  isSignedIn: true,
  username: 'TestUser',
  userId: 'user-1',
  refreshAuth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-router', () => ({
  useOutletContext: () => mockAuthContext,
}));

jest.mock('lucide-react', () => ({
  CloudUploadIcon: () => <div data-testid="cloud-upload-icon" />,
  ImageIcon: () => <div data-testid="image-icon" />,
  CheckCircle2: () => <div data-testid="check-circle-icon" />,
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeFile = (name = 'floor.png', type = 'image/png') => new File(['(binary)'], name, { type });

const FAKE_BASE64 = 'data:image/png;base64,abc123';

/**
 * Replaces the global FileReader with a minimal mock.
 * Returns the mocked instance so tests can fire `onload` manually.
 */
function mockFileReader(result = FAKE_BASE64) {
  type FakeReader = {
    result: string;
    onload: ((e: ProgressEvent<FileReader>) => void) | null;
    readAsDataURL: jest.Mock;
  };
  const instance: FakeReader = {
    result,
    onload: null,
    readAsDataURL: jest.fn(() => {
      Promise.resolve().then(() => {
        instance.onload?.({ target: instance } as unknown as ProgressEvent<FileReader>);
      });
    }),
  };
  jest.spyOn(globalThis, 'FileReader').mockImplementation(() => instance as unknown as FileReader);
  return instance;
}

/** Advance fake timers enough for progress to hit 100 % */
const TICKS_TO_COMPLETE = Math.ceil(100 / PROGRESS_STEP);

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('Upload', () => {
  beforeEach(() => {
    mockAuthContext.isSignedIn = true;
    mockAuthContext.username = 'TestUser';
    jest.restoreAllMocks();
  });

  // ── Dropzone rendering ────────────────────────────────────────────────────

  it('renders the dropzone when no file is selected', () => {
    render(<Upload />);
    expect(document.querySelector('.dropzone')).toBeInTheDocument();
    expect(document.querySelector('.upload-status')).not.toBeInTheDocument();
  });

  it('shows upload-inactive text when not signed in', () => {
    mockAuthContext.isSignedIn = false;
    render(<Upload />);
    expect(screen.getAllByText('hero.uploadInactive').length).toBeGreaterThan(0);
  });

  it('shows upload-active text when signed in', () => {
    render(<Upload />);
    expect(screen.getAllByText('hero.uploadActive').length).toBeGreaterThan(0);
  });

  it('disables the file input when not signed in', () => {
    mockAuthContext.isSignedIn = false;
    render(<Upload />);
    const input = document.querySelector<HTMLInputElement>('.drop-input')!;
    expect(input).toBeDisabled();
  });

  it('enables the file input when signed in', () => {
    render(<Upload />);
    const input = document.querySelector<HTMLInputElement>('.drop-input')!;
    expect(input).not.toBeDisabled();
  });

  // ── File selection via input ──────────────────────────────────────────────

  it('does not show upload-status when not signed in and a file is changed', async () => {
    mockAuthContext.isSignedIn = false;
    mockFileReader();
    render(<Upload />);

    const input = document.querySelector<HTMLInputElement>('.drop-input')!;
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile()] } });
    });

    expect(document.querySelector('.upload-status')).not.toBeInTheDocument();
    expect(document.querySelector('.dropzone')).toBeInTheDocument();
  });

  it('shows the file name and analysing message after a valid file is selected', async () => {
    mockFileReader();
    render(<Upload />);

    const input = document.querySelector<HTMLInputElement>('.drop-input')!;
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('plan.png')] } });
    });

    expect(screen.getByText('plan.png')).toBeInTheDocument();
    expect(screen.getByText('hero.analysingFloorPlanMessage')).toBeInTheDocument();
    expect(screen.getByTestId('image-icon')).toBeInTheDocument();
  });

  // ── Progress ──────────────────────────────────────────────────────────────

  it('reaches 100 % progress and shows the redirecting message', async () => {
    jest.useFakeTimers();
    mockFileReader();
    render(<Upload />);

    const input = document.querySelector<HTMLInputElement>('.drop-input')!;
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile()] } });
    });

    act(() => {
      jest.advanceTimersByTime(PROGRESS_INTERVAL_MS * TICKS_TO_COMPLETE);
    });

    expect(screen.getByText('hero.RedirectingMessage')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('shows analysing message while progress is below 100 %', async () => {
    jest.useFakeTimers();
    mockFileReader();
    render(<Upload />);

    const input = document.querySelector<HTMLInputElement>('.drop-input')!;
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile()] } });
    });

    // Advance only halfway
    act(() => {
      jest.advanceTimersByTime(PROGRESS_INTERVAL_MS * Math.floor(TICKS_TO_COMPLETE / 2));
    });

    expect(screen.getByText('hero.analysingFloorPlanMessage')).toBeInTheDocument();

    jest.useRealTimers();
  });

  // ── onComplete callback ───────────────────────────────────────────────────

  it('calls onComplete with the base64 string after REDIRECT_DELAY_MS', async () => {
    jest.useFakeTimers();
    const onComplete = jest.fn();
    mockFileReader(FAKE_BASE64);
    render(<Upload onComplete={onComplete} />);

    const input = document.querySelector<HTMLInputElement>('.drop-input')!;
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile()] } });
    });

    act(() => {
      jest.advanceTimersByTime(PROGRESS_INTERVAL_MS * TICKS_TO_COMPLETE);
    });

    // Not yet called — still within REDIRECT_DELAY_MS
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(REDIRECT_DELAY_MS);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(FAKE_BASE64);

    jest.useRealTimers();
  });

  it('does not call onComplete if no callback is provided', async () => {
    jest.useFakeTimers();
    mockFileReader();
    // Should not throw when onComplete is undefined
    expect(() => render(<Upload />)).not.toThrow();

    const input = document.querySelector<HTMLInputElement>('.drop-input')!;
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile()] } });
    });

    act(() => {
      jest.advanceTimersByTime(PROGRESS_INTERVAL_MS * TICKS_TO_COMPLETE + REDIRECT_DELAY_MS);
    });

    jest.useRealTimers();
  });

  // ── Drag-and-drop ─────────────────────────────────────────────────────────

  it('adds is-dragging class on dragover when signed in', () => {
    render(<Upload />);
    const dropzone = document.querySelector('.dropzone')!;

    act(() => {
      fireEvent.dragOver(dropzone);
    });

    expect(dropzone).toHaveClass('is-dragging');
  });

  it('does not add is-dragging class on dragover when not signed in', () => {
    mockAuthContext.isSignedIn = false;
    render(<Upload />);
    const dropzone = document.querySelector('.dropzone')!;

    act(() => {
      fireEvent.dragOver(dropzone);
    });

    expect(dropzone).not.toHaveClass('is-dragging');
  });

  it('removes is-dragging class on dragleave', () => {
    render(<Upload />);
    const dropzone = document.querySelector('.dropzone')!;

    act(() => {
      fireEvent.dragOver(dropzone);
    });
    expect(dropzone).toHaveClass('is-dragging');

    act(() => {
      fireEvent.dragLeave(dropzone);
    });
    expect(dropzone).not.toHaveClass('is-dragging');
  });

  it('processes a dropped file when signed in', async () => {
    mockFileReader();
    render(<Upload />);
    const dropzone = document.querySelector('.dropzone')!;

    await act(async () => {
      fireEvent.drop(dropzone, {
        dataTransfer: { files: [makeFile('dropped.png')] },
      });
    });

    expect(screen.getByText('dropped.png')).toBeInTheDocument();
  });

  it('does not process a dropped file when not signed in', async () => {
    mockAuthContext.isSignedIn = false;
    mockFileReader();
    render(<Upload />);
    const dropzone = document.querySelector('.dropzone')!;

    await act(async () => {
      fireEvent.drop(dropzone, {
        dataTransfer: { files: [makeFile('dropped.png')] },
      });
    });

    expect(screen.queryByText('dropped.png')).not.toBeInTheDocument();
    expect(document.querySelector('.dropzone')).toBeInTheDocument();
  });

  it('removes is-dragging class after a drop', () => {
    render(<Upload />);
    const dropzone = document.querySelector('.dropzone')!;

    act(() => {
      fireEvent.dragOver(dropzone);
    });
    expect(dropzone).toHaveClass('is-dragging');

    act(() => {
      fireEvent.drop(dropzone, { dataTransfer: { files: [] } });
    });

    expect(dropzone).not.toHaveClass('is-dragging');
  });
});
