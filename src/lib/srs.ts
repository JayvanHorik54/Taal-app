/** Spaced repetition — een afgeslankte SM-2. */

export const DAY = 86_400_000;

export type Grade = 0 | 1 | 2; // 0 = opnieuw, 1 = goed, 2 = makkelijk

export type Schedule = {
  ease: number;
  interval: number;
  reps: number;
  lapses: number;
  due: number;
};

export const freshSchedule = (): Schedule => ({
  ease: 2.3,
  interval: 0,
  reps: 0,
  lapses: 0,
  due: Date.now(),
});

export function review(card: Schedule, grade: Grade, now = Date.now()): Schedule {
  const next = { ...card };

  if (grade === 0) {
    next.ease = Math.max(1.3, next.ease - 0.2);
    next.lapses += 1;
    next.interval = 0;
    next.reps = 0;
    next.due = now;
    return next;
  }

  if (next.reps === 0) next.interval = 1;
  else if (next.reps === 1) next.interval = 3;
  else next.interval = Math.round(next.interval * next.ease);

  if (grade === 2) {
    next.interval = Math.round(next.interval * 1.35);
    next.ease = Math.min(2.9, next.ease + 0.15);
  }

  next.reps += 1;
  next.due = now + next.interval * DAY;
  return next;
}

/** 0 = nieuw, 1 = aan het leren, 2 = in herhaling, 3 = zit vast. */
export type Mastery = 0 | 1 | 2 | 3;

export function mastery(card: Schedule | undefined): Mastery {
  if (!card || card.reps === 0) return 0;
  if (card.interval < 3) return 1;
  if (card.interval < 14) return 2;
  return 3;
}

export const isDue = (card: Schedule, now = Date.now()) => card.due <= now;

/** Score omrekenen naar een Nederlands rapportcijfer. */
export function cijfer(score: number, total: number): number {
  if (!total) return 1;
  return Math.max(1, Math.round((1 + 9 * (score / total)) * 10) / 10);
}

export const PASS = 6.0;
