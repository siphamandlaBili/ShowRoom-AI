// Jest-safe mock of lib/constants — avoids import.meta.env (Vite-only)
export const PUTER_WORKER_URL = '';

export const STORAGE_PATHS = {
  ROOT: 'showroom',
  SOURCES: 'showroom/sources',
  RENDERS: 'showroom/renders',
} as const;

export const SHARE_STATUS_RESET_DELAY_MS = 1500;
export const PROGRESS_INCREMENT = 15;
export const REDIRECT_DELAY_MS = 600;
export const PROGRESS_INTERVAL_MS = 100;
export const PROGRESS_STEP = 5;

export const GRID_OVERLAY_SIZE = '60px 60px';
export const GRID_COLOR = '#3B82F6';

export const UNAUTHORIZED_STATUSES = [401, 403];

export const IMAGE_RENDER_DIMENSION = 1024;

export const SHOWROOM_RENDER_PROMPT = '';
