export interface DuelRoundState {
  p1Locked: boolean;
  p2Locked: boolean;
  roundCompleted: boolean;
  p1Score: number;
  p2Score: number;
}

export interface DuelAnswerResult {
  nextState: DuelRoundState;
  feedback: 'correct' | 'wrong';
  shouldAdvance: boolean;
  awardedPlayer: 1 | 2 | null;
  ignored: boolean;
}

/**
 * Pure evaluation function for simultaneous two-player duel answers.
 * Guarantees that:
 * 1. Both players answering wrong locks both and advances the round without freezing.
 * 2. Answering after round completion or when locked is ignored.
 * 3. Simultaneous correct answers only award the first tap and advance once.
 */
export function evaluateDuelAnswer(
  player: 1 | 2,
  isCorrect: boolean,
  currentState: DuelRoundState
): DuelAnswerResult {
  const isP1 = player === 1;
  const isLocked = isP1 ? currentState.p1Locked : currentState.p2Locked;

  if (isLocked || currentState.roundCompleted) {
    return {
      nextState: { ...currentState },
      feedback: 'wrong',
      shouldAdvance: false,
      awardedPlayer: null,
      ignored: true,
    };
  }

  if (isCorrect) {
    return {
      nextState: {
        ...currentState,
        p1Locked: isP1 ? true : currentState.p1Locked,
        p2Locked: !isP1 ? true : currentState.p2Locked,
        roundCompleted: true,
        p1Score: isP1 ? currentState.p1Score + 10 : currentState.p1Score,
        p2Score: !isP1 ? currentState.p2Score + 10 : currentState.p2Score,
      },
      feedback: 'correct',
      shouldAdvance: true,
      awardedPlayer: player,
      ignored: false,
    };
  }

  // Wrong answer
  const nextP1Locked = isP1 ? true : currentState.p1Locked;
  const nextP2Locked = !isP1 ? true : currentState.p2Locked;
  const bothLocked = nextP1Locked && nextP2Locked;

  return {
    nextState: {
      ...currentState,
      p1Locked: nextP1Locked,
      p2Locked: nextP2Locked,
      roundCompleted: bothLocked,
    },
    feedback: 'wrong',
    shouldAdvance: bothLocked,
    awardedPlayer: null,
    ignored: false,
  };
}

export interface DuelRoundControllerHandlers {
  /** Called when the next question starts (after the feedback pause). */
  onRoundStart: (round: number) => void;
  /** Called exactly once per game, when the last question's feedback pause ends. */
  onGameOver: () => void;
}

export interface DuelRoundController {
  readonly round: number;
  readonly isFinished: boolean;
  readonly hasPendingAdvance: boolean;
  /** Schedules the move to the next question (or game over) after the feedback pause. */
  scheduleAdvance: () => void;
  /** Cancels a pending advance (exit, unmount, blur). */
  cancel: () => void;
  /** Starts a fresh game at question 0; cancels any pending advance. */
  reset: () => void;
}

/**
 * Owns the duel's round counter and its single feedback-pause timer, outside React state, so:
 * - a Reset or Exit during the pause can never apply the old game's advance to the new game;
 * - game over (and its coin award) fires exactly once per game;
 * - the decision is made from the controller's own counter, not inside a React state updater
 *   (updaters must be pure: React may replay them).
 */
export function createDuelRoundController(
  totalRounds: number,
  delayMs: number,
  handlers: DuelRoundControllerHandlers
): DuelRoundController {
  let round = 0;
  let finished = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return {
    get round() {
      return round;
    },
    get isFinished() {
      return finished;
    },
    get hasPendingAdvance() {
      return timer !== null;
    },
    scheduleAdvance() {
      if (finished) return;
      cancel();
      timer = setTimeout(() => {
        timer = null;
        if (round + 1 < totalRounds) {
          round += 1;
          handlers.onRoundStart(round);
        } else if (!finished) {
          finished = true;
          handlers.onGameOver();
        }
      }, delayMs);
    },
    cancel,
    reset() {
      cancel();
      round = 0;
      finished = false;
    },
  };
}
