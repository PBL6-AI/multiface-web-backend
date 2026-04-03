export const SYSTEM_ROLES = ['admin', 'teacher', 'student'] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const DEFAULT_STUDENT_ROLE: SystemRole = 'student';
