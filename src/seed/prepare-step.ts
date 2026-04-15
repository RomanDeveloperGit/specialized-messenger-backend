import { execSync } from 'node:child_process';

import { EventEmitter2 } from '@nestjs/event-emitter';

// Временно существует этот шаг для seed, пока не обложил всё нормальными моками напрямую в БД
export const prepareStep = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  EventEmitter2.prototype.emit = () => {};

  execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
};
