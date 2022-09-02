export const setLocalTeamId = (id: string) => {
  window.localStorage.setItem('localTeamId', id);
};

export const getLocalTeamId = (): string => {
  return window.localStorage.getItem('localTeamId') ?? '';
};
