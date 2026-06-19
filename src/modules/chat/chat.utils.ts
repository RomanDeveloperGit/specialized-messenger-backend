import { ConversationParticipantRoleName } from '@/shared/modules/generated/prisma/enums';

export const splitParticipants = <T extends { leavedAt: Date | null }>(
  participants: T[],
): { activeParticipants: T[]; removedParticipants: T[] } => {
  const activeParticipants: T[] = [];
  const removedParticipants: T[] = [];

  for (const p of participants) {
    if (p.leavedAt === null) {
      activeParticipants.push(p);
    } else {
      removedParticipants.push(p);
    }
  }

  return { activeParticipants, removedParticipants };
};

export const sortParticipants = <T extends { role: { name: string } }>(participants: T[]): T[] => {
  return [...participants].sort((a, b) => {
    if (a.role.name === ConversationParticipantRoleName.OWNER) return -1;
    if (b.role.name === ConversationParticipantRoleName.OWNER) return 1;
    return 0;
  });
};
