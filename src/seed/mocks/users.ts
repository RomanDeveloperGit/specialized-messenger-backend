import { CreateUserRequest } from '@/modules/user/dto/create-user.dto';

export const USER_MOCKS: CreateUserRequest[] = [
  {
    firstName: 'Admin',
    lastName: 'Admin',
    login: 'admin',
    password: 'admin',
  },
  {
    firstName: 'User',
    lastName: 'User',
    login: 'user',
    password: 'user',
  },
  {
    firstName: 'Роман',
    lastName: 'Роман',
    login: 'roman',
    password: 'romann',
  },
  {
    firstName: 'Артём',
    lastName: 'Артём',
    login: 'artem',
    password: 'artem',
  },
];
