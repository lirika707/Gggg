export const normalizeLogin = (login: string): string => {
  return login.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
};

export const validateLogin = (login: string): string | null => {
  const normalized = normalizeLogin(login);
  if (normalized.length < 3) {
    return 'Логин должен содержать не менее 3 символов';
  }
  if (normalized.length > 20) {
    return 'Логин должен содержать не более 20 символов';
  }
  if (!/^[a-z0-9_.]+$/.test(normalized)) {
    return 'Логин может содержать только латинские буквы, цифры, подчеркивания и точки';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return 'Пароль должен содержать не менее 6 символов';
  }
  return null;
};
