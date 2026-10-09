import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluate, solve, type Mode, type Op } from "./solve.ts";

function referenceEvaluate(nums: number[], ops: Op[], mode: Mode): number {
  if (mode === "ltr") {
    return ops.reduce((value, op, index) => {
      const next = nums[index + 1]!;
      if (op === "+") return value + next;
      if (op === "-") return value - next;
      return value * next;
    }, nums[0]!);
  }

  const values = [nums[0]!];
  const operators: Op[] = [];
  const precedence = (op: Op) => (op === "*" ? 2 : 1);
  const reduce = () => {
    const right = values.pop()!;
    const left = values.pop()!;
    const op = operators.pop()!;
    values.push(op === "*" ? left * right : op === "+" ? left + right : left - right);
  };

  for (let index = 0; index < ops.length; index++) {
    const op = ops[index]!;
    while (operators.length > 0 && precedence(operators.at(-1)!) >= precedence(op)) reduce();
    operators.push(op);
    values.push(nums[index + 1]!);
  }
  while (operators.length > 0) reduce();
  return values[0]!;
}

function forEachDigitOrder(width: number, visit: (digits: number[]) => void) {
  const used = new Set<number>();
  const digits: number[] = [];
  const walk = () => {
    if (digits.length === width) {
      visit(digits);
      return;
    }
    for (let digit = 1; digit <= 9; digit++) {
      if (used.has(digit)) continue;
      used.add(digit);
      digits.push(digit);
      walk();
      digits.pop();
      used.delete(digit);
    }
  };
  walk();
}

function operatorPatterns(maxLength: number): Op[][] {
  const patterns: Op[][] = [[]];
  const choices: Op[] = ["*", "+", "-"];
  for (let length = 1; length <= maxLength; length++) {
    const extend = (prefix: Op[]) => {
      if (prefix.length === length) {
        patterns.push(prefix);
        return;
      }
      for (const op of choices) extend([...prefix, op]);
    };
    extend([]);
  }
  return patterns;
}

describe("evaluate", () => {
  it("honors standard multiplication precedence and explicit left-to-right mode", () => {
    const nums = [2, 3, 4];
    const ops: Op[] = ["+", "*"];

    assert.equal(evaluate(nums, ops, "precedence"), 14);
    assert.equal(evaluate(nums, ops, "ltr"), 20);
  });

  it("evaluates subtraction chains from left to right within each precedence level", () => {
    assert.equal(evaluate([9, 2, 3], ["-", "-"], "precedence"), 4);
    assert.equal(evaluate([2, 3, 4], ["+", "*"], "precedence"), 14);
    assert.equal(evaluate([8, 3, 2], ["-", "*"], "precedence"), 2);
  });
});

describe("solve", () => {
  it("matches an independent enumeration for every operator pattern up to three operations", () => {
    for (const ops of operatorPatterns(3)) {
      for (const mode of ["precedence", "ltr"] as const) {
        const expected = new Map<number, Map<string, number>>();
        forEachDigitOrder(ops.length + 1, (digits) => {
          const target = referenceEvaluate(digits, ops, mode);
          const key = [...digits].sort((a, b) => a - b).join(",");
          const groups = expected.get(target) ?? new Map<string, number>();
          groups.set(key, (groups.get(key) ?? 0) + 1);
          expected.set(target, groups);
        });

        const expectedTargets = [...expected.keys()];
        const targetsToCheck =
          ops.length < 3
            ? expectedTargets
            : [
                expectedTargets[0]!,
                expectedTargets[Math.floor(expectedTargets.length / 2)]!,
                expectedTargets[expectedTargets.length - 1]!,
              ];
        targetsToCheck.push(999_999);
        for (const target of new Set(targetsToCheck)) {
          const actual = solve(ops, target, mode);
          const expectedGroups = expected.get(target) ?? new Map<string, number>();

          assert.equal(
            actual.totalExpressions,
            [...expectedGroups.values()].reduce((sum, count) => sum + count, 0),
            `${ops.join(" ")} = ${target} (${mode})`,
          );
          assert.deepEqual(
            new Map(actual.groups.map((group) => [group.digits.join(","), group.count])),
            expectedGroups,
            `${ops.join(" ")} = ${target} (${mode})`,
          );
          for (const group of actual.groups) {
            assert.ok(group.examples.length <= 3);
            for (const example of group.examples) {
              assert.equal(referenceEvaluate(example, ops, mode), target);
              assert.equal(new Set(example).size, example.length);
            }
          }
        }
      }
    }
  });

  it("uses all nine distinct digits once at the maximum supported width", () => {
    const result = solve(Array<Op>(8).fill("+"), 45, "precedence");

    assert.equal(result.totalExpressions, 362_880);
    assert.deepEqual(
      result.groups.map(({ digits, count }) => ({ digits, count })),
      [{ digits: [1, 2, 3, 4, 5, 6, 7, 8, 9], count: 362_880 }],
    );
    assert.equal(result.groups[0]!.examples.length, 3);
  });

  it("returns no solutions for unsupported widths or non-integer targets", () => {
    assert.deepEqual(solve(Array<Op>(9).fill("+"), 55, "precedence"), {
      groups: [],
      totalExpressions: 0,
    });
    assert.deepEqual(solve(["+"], 1.5, "precedence"), { groups: [], totalExpressions: 0 });
  });

  it("finds negative results without reusing a digit", () => {
    const result = solve(["-"], -8, "precedence");

    assert.equal(result.totalExpressions, 1);
    assert.deepEqual(result.groups[0]?.digits, [1, 9]);
    assert.deepEqual(result.groups[0]?.examples, [[1, 9]]);
  });
});
