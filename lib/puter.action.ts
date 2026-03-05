import puter from '@heyputer/puter.js';
import toast from 'react-hot-toast';
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
}: CreateProjectParams): Promise<DesignItem | null | undefined> => {
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
    toast.error(`Failed to resolve source image for project ${projectId}`);
    return null;
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
    return payload;
  } catch (error) {
    toast.error(
      `Failed to create project ${projectId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
