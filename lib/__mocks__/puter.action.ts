export const signIn = jest.fn();
export const signOut = jest.fn();
export const getCurrentUser = jest.fn().mockResolvedValue(null);
export const createProject = jest.fn().mockResolvedValue(null);
