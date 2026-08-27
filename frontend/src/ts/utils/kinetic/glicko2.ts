export type GlickoTransitionRating = {
  transition: string;
  mu: number; // Glicko-2 rating scale (0 = baseline ~40 WPM, >0 faster, <0 slower)
  phi: number; // Glicko-2 rating deviation / uncertainty (high = unfamiliar/decayed)
  sigma: number; // Glicko-2 volatility (timing consistency)
  lastPracticed: number; // Timestamp of last practice
  sampleCount: number;
  totalErrors: number;
  meanIkiMs: number;
};

// Glicko-2 & Latency Calibration Constants
export const GLICKO_TAU = 0.5; // Volatility change constraint
export const T_REF_MS = 280; // Reference IKI in milliseconds at mu = 0
export const ALPHA_SPEED = 0.18; // Speed sensitivity scaling
export const BETA_STEEPNESS = 0.012; // Logistic outcome steepness
export const PHI_DECAY_RATE = 0.008; // Uncertainty inflation per hour of inactivity
export const MAX_PHI = 1.4; // Max uncertainty cap
export const MIN_PHI = 0.15; // Min uncertainty floor

// Expected Inter-Key Interval (ms) for a given transition skill rating mu
export function expectedIki(mu: number): number {
  return T_REF_MS * Math.exp(-ALPHA_SPEED * mu);
}

// Convert Glicko-2 rating mu to Words Per Minute equivalent (assuming 5 chars/word)
export function transitionSpeedWpm(mu: number): number {
  const iki = expectedIki(mu);
  if (iki <= 0) return 0;
  return Math.round(12000 / iki);
}

// Continuous outcome score s in [0, 1] comparing observed latency to expected latency
export function performanceScore(
  tObsMs: number,
  mu: number,
  correct: boolean,
): number {
  if (!correct) return 0.0;
  const expIki = expectedIki(mu);
  // Faster than expected (tObs < expIki) -> s > 0.5, slower -> s < 0.5
  const diff = tObsMs - expIki;
  const score = 1 / (1 + Math.exp(BETA_STEEPNESS * diff));
  return Math.max(0.01, Math.min(0.99, score));
}

export function createDefaultTransition(
  transition: string,
): GlickoTransitionRating {
  return {
    transition: transition.toLowerCase(),
    mu: 0.0,
    phi: 1.15,
    sigma: 0.06,
    lastPracticed: Date.now(),
    sampleCount: 0,
    totalErrors: 0,
    meanIkiMs: T_REF_MS,
  };
}

// Apply time decay to rating deviation (phi) for unpracticed transitions
export function applyTimeDecay(
  rating: GlickoTransitionRating,
  currentTime = Date.now(),
): GlickoTransitionRating {
  const elapsedHours = Math.max(
    0,
    (currentTime - rating.lastPracticed) / (1000 * 60 * 60),
  );
  if (elapsedHours <= 0) return rating;

  // Phi growth: phi' = min(MAX_PHI, sqrt(phi^2 + decay * elapsedHours))
  const newPhi = Math.min(
    MAX_PHI,
    Math.sqrt(rating.phi * rating.phi + PHI_DECAY_RATE * elapsedHours),
  );

  return {
    ...rating,
    phi: Number(newPhi.toFixed(4)),
  };
}

// Full Glicko-2 update for a single keystroke transition observation
export function glicko2Update(
  current: GlickoTransitionRating,
  tObsMs: number,
  correct: boolean,
  currentTime = Date.now(),
): GlickoTransitionRating {
  // 1. Inflate phi from inactivity decay first
  const decayed = applyTimeDecay(current, currentTime);
  const { mu, phi, sigma } = decayed;

  // 2. Compute continuous score s
  const s = performanceScore(tObsMs, mu, correct);

  // 3. Glicko-2 equations with virtual opponent at current mu level
  const gPhi = 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
  const expectedE = 1 / (1 + Math.exp(-gPhi * 0)); // Opponent at same rating level -> E = 0.5
  const varianceV = 1 / (gPhi * gPhi * expectedE * (1 - expectedE));
  const delta = varianceV * gPhi * (s - expectedE);

  // 4. Update Volatility sigma' using Illinois / Newton-Raphson iteration
  const a = Math.log(sigma * sigma);
  const tau = GLICKO_TAU;
  const f = (x: number): number => {
    const expX = Math.exp(x);
    const phiSq = phi * phi;
    const num = expX * (delta * delta - phiSq - varianceV - expX);
    const den = 2 * Math.pow(phiSq + varianceV + expX, 2);
    return num / den - (x - a) / (tau * tau);
  };

  let A = a;
  let B: number;
  if (delta * delta > phi * phi + varianceV) {
    B = Math.log(delta * delta - phi * phi - varianceV);
  } else {
    let k = 1;
    while (f(a - k * tau) < 0) {
      k++;
    }
    B = a - k * tau;
  }

  let fA = f(A);
  let fB = f(B);

  // Secant / bracket iteration for sigma
  for (let i = 0; i < 20; i++) {
    if (Math.abs(B - A) < 0.00001) break;
    const C = A + ((A - B) * fA) / (fB - fA);
    const fC = f(C);
    if (fC * fB <= 0) {
      A = B;
      fA = fB;
    } else {
      fA /= 2;
    }
    B = C;
    fB = fC;
  }

  const newSigma = Math.exp(A / 2);

  // 5. Update Rating (mu) and Deviation (phi)
  const phiStar = Math.sqrt(phi * phi + newSigma * newSigma);
  const newPhi = Math.max(
    MIN_PHI,
    Math.min(MAX_PHI, 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / varianceV)),
  );
  const newMu = mu + newPhi * newPhi * gPhi * (s - expectedE);

  // Smooth running mean IKI
  const smoothedIki =
    current.sampleCount === 0
      ? tObsMs
      : Math.round(0.85 * current.meanIkiMs + 0.15 * tObsMs);

  return {
    transition: current.transition,
    mu: Number(newMu.toFixed(4)),
    phi: Number(newPhi.toFixed(4)),
    sigma: Number(newSigma.toFixed(5)),
    lastPracticed: currentTime,
    sampleCount: current.sampleCount + 1,
    totalErrors: current.totalErrors + (correct ? 0 : 1),
    meanIkiMs: smoothedIki,
  };
}
