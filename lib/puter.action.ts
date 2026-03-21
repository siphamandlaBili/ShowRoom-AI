import puter from '@heyputer/puter.js';
import toast from 'react-hot-toast';
import { PUTER_WORKER_URL } from './constants';
import { getOrCreateHostingConfig, uploadImageToHosting } from './puter.hosting';
import { isHostedUrl } from './utils';

export interface PuterUser {
  username: string;
  uuid: string;
}

export const signIn = () => puter.auth.signIn();

export const signOut = () => puter.auth.signOut();

export const getCurrentUser = async (): Promise<PuterUser | null> => {
  try {
    return (await puter.auth.getUser()) as PuterUser;
  } catch {
    return null;
  }
};

export const createProject = async ({
  item,
  visibility,
}: CreateProjectParams): Promise<DesignItem | null | undefined> => {
  if (!PUTER_WORKER_URL) {
    console.warn('Missing VITE_PUTER_WORKER_URL; skip history fetch;');
    return null;
  }

  const projectId = item.id;

  const hosting = await getOrCreateHostingConfig();

  const hostedSource = projectId
    ? await uploadImageToHosting({
        hosting,
        url: item.sourceImage,
        projectId,
        label: 'source',
      })
    : null;

  const hostedRender =
    projectId && item.renderedImage
      ? await uploadImageToHosting({
          hosting,
          url: item.renderedImage,
          projectId,
          label: 'rendered',
        })
      : null;

  const resolvedSource =
    hostedSource?.url || (isHostedUrl(item.sourceImage) ? item.sourceImage : '');

  if (!resolvedSource) {
    throw new Error(`Failed to resolve source image for project ${projectId}`);
  }

  const resolvedRender = hostedRender?.url
    ? hostedRender?.url
    : item.renderedImage && isHostedUrl(item.renderedImage)
      ? item.renderedImage
      : undefined;

  const {
    // sourcePath: _sourcePath,
    // renderedPath: _renderedPath,
    // publicPath: _publicPath,
    ...rest
  } = item;

  const payload = {
    ...rest,
    sourceImage: resolvedSource,
    renderedImage: resolvedRender,
  };

  try {
    const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project: payload, visibility }),
    });

    if (!response.ok) {
      let detail = `${response.status}`;
      try {
        const errText = await response.text();
        if (errText) {
          detail = `${response.status} – ${errText}`;
          console.error(`[createProject] Worker error for ${projectId}:`, errText);
        }
      } catch {
        // body read failed — use status only
      }
      throw new Error(`Failed to save project: ${detail}`);
    }

    const data = (await response.json()) as { project?: DesignItem | null };
    return data?.project ?? null;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};

export const getProjects = async () => {
  if (!PUTER_WORKER_URL) {
    console.warn('Missing VITE_PUTER_WORKER_URL; skip history fetch;');
    return [];
  }

  try {
    const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/list`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('Failed to fetch history', await response.text());
      return [];
    }

    const data = (await response.json()) as { projects?: DesignItem[] | null };
    return Array.isArray(data?.projects) ? data?.projects : [];
  } catch (e) {
    console.error('Failed to get projects', e);
    return [];
  }
};

export const getProjectById = async ({ id }: { id: string }) => {
  if (!PUTER_WORKER_URL) {
    toast.error('Missing VITE_PUTER_WORKER_URL; skipping project fetch.');
    return null;
  }

  try {
    const response = await puter.workers.exec(
      `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
      { method: 'GET' },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      project?: DesignItem | null;
    };

    return data?.project ?? null;
  } catch (error) {
    toast.error(
      `Failed to fetch project: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
};
