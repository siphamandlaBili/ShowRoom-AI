import puter from '@heyputer/puter.js';

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
