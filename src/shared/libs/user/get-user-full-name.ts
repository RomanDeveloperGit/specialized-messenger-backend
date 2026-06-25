const UNDEFINED_USER = 'Неизвестное имя';

export const getUserFullName = (data?: { firstName: string; lastName: string } | null): string => {
  if (!data) {
    return UNDEFINED_USER;
  }

  const { firstName, lastName } = data;

  if (!firstName || !lastName) {
    return UNDEFINED_USER;
  }

  return `${firstName} ${lastName}`;
};
