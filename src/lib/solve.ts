export type Op = "*" | "+" | "-";
export type Mode = "precedence" | "ltr";

export type DigitGroup = {
  digits: number[];
  count: number;
  examples: number[][];
};

export type SolveResult = {
  groups: DigitGroup[];
  totalExpressions: number;
};

export type Query = {
  ops: Op[];
  target: number;
  mode: Mode;
};

export const GLYPH: Record<Op, string> = {
  "*": "×",
  "+": "+",
  "-": "−",
};

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function patternLabel(ops: Op[]): string {
  let label = "n";
  for (const op of ops) label += ` ${GLYPH[op]} n`;
  return label;
}

export function expressionText(nums: number[], ops: Op[], target: number): string {
  let text = String(nums[0]);
  for (let i = 0; i < ops.length; i++) {
    text += ` ${GLYPH[ops[i]!]} ${nums[i + 1]}`;
  }
  return `${text} = ${target}`;
}

/** True when × is not entirely before every + or −, so the two modes disagree. */
export function modesDiffer(ops: Op[]): boolean {
  let seenAdd = false;
  for (const op of ops) {
    if (op === "+" || op === "-") seenAdd = true;
    else if (seenAdd) return true;
  }
  return false;
}

export function evaluate(nums: readonly number[], ops: readonly Op[], mode: Mode): number {
  if (mode === "ltr") {
    let acc = nums[0]!;
    for (let i = 0; i < ops.length; i++) {
      const next = nums[i + 1]!;
      const op = ops[i];
      if (op === "+") acc += next;
      else if (op === "-") acc -= next;
      else acc *= next;
    }
    return acc;
  }

  let sum = 0;
  let sign = 1;
  let term = nums[0]!;
  for (let i = 0; i < ops.length; i++) {
    const next = nums[i + 1]!;
    const op = ops[i];
    if (op === "*") {
      term *= next;
    } else {
      sum += sign * term;
      sign = op === "+" ? 1 : -1;
      term = next;
    }
  }
  return sum + sign * term;
}

function permutations(k: number, visit: (nums: number[]) => void) {
  const used = new Array<boolean>(10).fill(false);
  const current: number[] = [];

  const walk = () => {
    if (current.length === k) {
      visit(current);
      return;
    }
    for (const digit of DIGITS) {
      if (used[digit]) continue;
      used[digit] = true;
      current.push(digit);
      walk();
      current.pop();
      used[digit] = false;
    }
  };

  walk();
}

export function solve(ops: Op[], target: number, mode: Mode): SolveResult {
  const width = ops.length + 1;
  if (width > DIGITS.length || !Number.isInteger(target)) {
    return { groups: [], totalExpressions: 0 };
  }

  const grouped = new Map<string, DigitGroup>();
  let totalExpressions = 0;

  permutations(width, (nums) => {
    if (evaluate(nums, ops, mode) !== target) return;
    totalExpressions += 1;
    const digits = [...nums].sort((a, b) => a - b);
    const key = digits.join(",");
    let group = grouped.get(key);
    if (!group) {
      group = { digits, count: 0, examples: [] };
      grouped.set(key, group);
    }
    group.count += 1;
    if (group.examples.length < 3) group.examples.push([...nums]);
  });

  const groups = [...grouped.values()].sort((a, b) => {
    const length = a.digits.length - b.digits.length;
    if (length !== 0) return length;
    return a.digits.join(",").localeCompare(b.digits.join(","), undefined, { numeric: true });
  });

  return { groups, totalExpressions };
}

export function sameQuery(a: Query, b: Query): boolean {
  if (a.target !== b.target || a.mode !== b.mode || a.ops.length !== b.ops.length) return false;
  return a.ops.every((op, index) => op === b.ops[index]);
}
