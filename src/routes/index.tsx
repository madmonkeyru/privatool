import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Undo2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  expressionText,
  GLYPH,
  modesDiffer,
  patternLabel,
  sameQuery,
  solve,
  type Mode,
  type Op,
  type Query,
  type SolveResult,
} from "@/lib/solve";

export const Route = createFileRoute("/")({ component: Home });

const HISTORY_KEY = "ninefold.history";
const OP_BUTTONS: { op: Op; label: string }[] = [
  { op: "*", label: "Multiply" },
  { op: "+", label: "Add" },
  { op: "-", label: "Subtract" },
];

function Home() {
  const [ops, setOps] = useState<Op[]>([]);
  const [targetText, setTargetText] = useState("");
  const [mode, setMode] = useState<Mode>("precedence");
  const [phase, setPhase] = useState<"idle" | "searching" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [solved, setSolved] = useState<Query | null>(null);
  const [history, setHistory] = useState<Query[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const requestId = useRef(0);
  const resultsRef = useRef<HTMLElement | null>(null);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    setHistory(readHistory());
    return () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  }, []);

  const target = parseTarget(targetText);
  const draft: Query | null = target === null ? null : { ops, target, mode };
  const stale =
    phase === "done" && solved !== null && (draft === null || !sameQuery(solved, draft));
  const differ = modesDiffer(ops);

  function addOp(op: Op) {
    setOps((current) => (current.length >= 8 ? current : [...current, op]));
  }

  function run(query: Query) {
    const id = ++requestId.current;
    setPhase("searching");
    setError(null);
    setOps(query.ops);
    setMode(query.mode);
    setTargetText(String(query.target));
    window.setTimeout(() => {
      if (id !== requestId.current) return;
      const next = solve(query.ops, query.target, query.mode);
      setResult(next);
      setSolved(query);
      setPhase("done");
      setHistory(remember(query));
      if (window.matchMedia("(max-width: 767px)").matches) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        resultsRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    }, 0);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (target === null) {
      setError("Enter a whole number — the result you want.");
      return;
    }
    run({ ops, target, mode });
  }

  function copyExample(id: string, text: string) {
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopiedId(null), 1400);
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex items-center gap-3">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-ink p-2" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => (
            <span
              key={index}
              className={index === 8 ? "size-2 rounded-full bg-accent" : "size-2 rounded-full bg-surface"}
            />
          ))}
        </div>
        <div>
          <p className="text-sm font-medium text-muted">Digits 1–9</p>
          <h1 className="font-display text-4xl leading-none text-ink">Ninefold</h1>
        </div>
      </header>

      <p className="mt-4 max-w-xl text-base text-ink">
        Tap ×, +, or − in the order they appear. Enter the result and press equals. Ninefold
        lists the digits from 1–9 that make the equation true. Each digit is used at most once.
      </p>

      <div className="mt-6 grid items-start gap-6 md:grid-cols-2">
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-line bg-surface p-4 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted">Pattern</h2>
            <button
              type="button"
              onClick={() => setOps([])}
              disabled={ops.length === 0}
              className="min-h-11 px-2 text-sm font-medium text-accent disabled:opacity-40"
            >
              Clear
            </button>
          </div>

          <div
            className="mt-2 flex min-h-16 flex-wrap items-center gap-2 rounded-2xl bg-bg px-3 py-3"
            aria-live="polite"
          >
            <Slot />
            {ops.map((op, index) => (
              <span key={`${op}-${index}`} className="contents">
                <span className="font-display text-2xl text-accent">{GLYPH[op]}</span>
                <Slot />
              </span>
            ))}
            <span className="px-1 font-display text-2xl text-muted">=</span>
            <span className="font-display text-2xl text-ink">{targetText === "" ? "?" : targetText}</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            {ops.length === 0
              ? "No operations yet — that looks for a single digit."
              : `${ops.length} ${ops.length === 1 ? "operation" : "operations"} · ${ops.length + 1} digits`}
          </p>

          <div className="mt-4 flex gap-2">
            {OP_BUTTONS.map(({ op, label }) => (
              <button
                key={op}
                type="button"
                aria-label={label}
                disabled={ops.length >= 8}
                onClick={() => addOp(op)}
                className="min-h-16 flex-1 rounded-2xl bg-ink font-display text-3xl text-surface transition-opacity duration-150 disabled:opacity-40"
              >
                {GLYPH[op]}
              </button>
            ))}
            <button
              type="button"
              aria-label="Remove last operation"
              disabled={ops.length === 0}
              onClick={() => setOps((current) => current.slice(0, -1))}
              className="min-h-16 min-w-14 rounded-2xl border border-line bg-bg px-3 text-ink disabled:opacity-40"
            >
              <Undo2 className="mx-auto size-5" aria-hidden="true" />
            </button>
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-muted">Order of operations</legend>
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-2xl bg-bg p-1">
              <ModeButton
                pressed={mode === "precedence"}
                onClick={() => setMode("precedence")}
                label="× before + −"
              />
              <ModeButton pressed={mode === "ltr"} onClick={() => setMode("ltr")} label="Left to right" />
            </div>
            <p className="mt-2 text-sm text-muted">
              {differ
                ? mode === "precedence"
                  ? "Multiplication is worked before addition and subtraction."
                  : "Each operation is applied in the order you pressed it."
                : "This pattern gives the same answers either way."}
            </p>
          </fieldset>

          <div className="mt-5">
            <label htmlFor="result" className="text-sm font-medium text-muted">
              Result
            </label>
            <input
              id="result"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              value={targetText}
              placeholder="?"
              aria-invalid={error !== null}
              aria-describedby={error ? "result-error" : undefined}
              onChange={(event) => setTargetText(sanitizeTarget(event.target.value))}
              className="mt-2 w-full rounded-2xl bg-bg px-4 py-3 font-display text-4xl text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent"
            />
            {error ? (
              <p id="result-error" role="alert" className="mt-2 text-sm text-accent">
                {error}
              </p>
            ) : null}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "±", "0", "del"].map((key) => (
              <button
                key={key}
                type="button"
                aria-label={key === "±" ? "Toggle sign" : key === "del" ? "Delete digit" : undefined}
                onClick={() => setTargetText((current) => pressKey(current, key))}
                className="min-h-12 rounded-xl bg-bg font-display text-xl text-ink"
              >
                {key === "del" ? "⌫" : key}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={phase === "searching"}
            className="mt-3 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-accent text-surface disabled:opacity-60"
          >
            <span className="font-display text-4xl leading-none">=</span>
            <span className="text-base font-medium">
              {phase === "searching" ? "Searching 1–9" : "Find digits"}
            </span>
          </button>
        </form>

        <section ref={resultsRef} aria-live="polite" className="min-w-0">
          {phase === "searching" && result === null ? (
            <p className="font-display text-3xl leading-tight text-ink">Searching 1–9…</p>
          ) : phase === "idle" || result === null ? (
            <IdlePanel onTry={() => run({ ops: ["*", "-"], target: 21, mode: "precedence" })} />
          ) : (
            <>
              {phase === "searching" ? <p className="mb-3 text-sm text-muted">Updating…</p> : null}
              <Results
                result={result}
                solved={solved}
                stale={stale}
                copiedId={copiedId}
                onCopy={copyExample}
              />
            </>
          )}

          {history.length > 0 ? (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted">Recent, on this device</h2>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(HISTORY_KEY);
                    setHistory([]);
                  }}
                  className="min-h-11 px-2 text-sm font-medium text-accent"
                >
                  Clear
                </button>
              </div>
              <ul className="mt-2 flex flex-wrap gap-2">
                {history.map((item) => (
                  <li key={historyKey(item)}>
                    <button
                      type="button"
                      onClick={() => run(item)}
                      className="min-h-11 rounded-full border border-line bg-surface px-3 text-sm text-ink"
                    >
                      {patternLabel(item.ops)} = {item.target}
                      {item.mode === "ltr" ? " · left to right" : ""}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Slot() {
  return (
    <span className="inline-flex size-11 items-center justify-center rounded-xl border border-line bg-surface font-display text-lg text-muted">
      n
    </span>
  );
}

function ModeButton({
  pressed,
  onClick,
  label,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={
        pressed
          ? "min-h-11 rounded-xl bg-ink px-2 text-sm font-medium text-surface"
          : "min-h-11 rounded-xl px-2 text-sm font-medium text-ink"
      }
    >
      {label}
    </button>
  );
}

function IdlePanel({ onTry }: { onTry: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-line px-5 py-8">
      <h2 className="font-display text-3xl leading-tight text-ink">Numbers needed will land here.</h2>
      <p className="mt-3 max-w-md text-base text-muted">
        For number × number − number, tap × once, then −, type the result, and press equals.
      </p>
      <button
        type="button"
        onClick={onTry}
        className="mt-5 min-h-11 rounded-full bg-ink px-4 text-sm font-medium text-surface"
      >
        Try × − = 21
      </button>
    </div>
  );
}

function Results({
  result,
  solved,
  stale,
  copiedId,
  onCopy,
}: {
  result: SolveResult;
  solved: Query | null;
  stale: boolean;
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
}) {
  if (!solved) return null;

  return (
    <div>
      <h2 className="font-display text-3xl leading-tight text-ink">
        {result.totalExpressions === 0
          ? "No match"
          : `${result.groups.length} ${result.groups.length === 1 ? "set" : "sets"}`}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {patternLabel(solved.ops)} = {solved.target}
        {solved.mode === "ltr" ? " · left to right" : " · × before + −"}
        {result.totalExpressions > 0
          ? ` · ${result.totalExpressions.toLocaleString()} ${result.totalExpressions === 1 ? "equation" : "equations"}`
          : ""}
      </p>
      {stale ? (
        <p className="mt-3 rounded-2xl bg-surface px-3 py-2 text-sm text-ink">
          You changed the pattern or the result. Press equals to search again.
        </p>
      ) : null}

      {result.groups.length === 0 ? (
        <p className="mt-4 text-base text-ink">
          No selection from 1–9 makes that result with this pattern.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {result.groups.map((group) => {
            const key = group.digits.join("-");
            return (
              <li key={key} className="rounded-3xl border border-line bg-surface p-4 sm:p-5">
                <p className="text-xs font-medium tracking-widest text-muted uppercase">Numbers needed</p>
                <p className="mt-1 font-display text-4xl leading-none text-ink">
                  {group.digits.join(" · ")}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {group.count === 1 ? "1 arrangement" : `${group.count.toLocaleString()} arrangements`}
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {group.examples.map((nums, index) => {
                    const id = `${key}-${index}`;
                    const text = expressionText(nums, solved.ops, solved.target);
                    return (
                      <li key={id} className="flex items-start justify-between gap-3">
                        <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 font-display text-xl leading-snug text-ink">
                          <span>{nums[0]}</span>
                          {solved.ops.map((op, opIndex) => (
                            <span key={opIndex} className="contents">
                              <span className="text-accent">{GLYPH[op]}</span>
                              <span>{nums[opIndex + 1]}</span>
                            </span>
                          ))}
                          <span className="text-muted">=</span>
                          <span>{solved.target}</span>
                        </p>
                        <button
                          type="button"
                          aria-label={`Copy ${text}`}
                          onClick={() => onCopy(id, text)}
                          className="mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted"
                        >
                          {copiedId === id ? (
                            <Check className="size-4 text-accent" aria-hidden="true" />
                          ) : (
                            <Copy className="size-4" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {group.count > group.examples.length ? (
                  <p className="mt-2 text-sm text-muted">
                    and {(group.count - group.examples.length).toLocaleString()} more ways to arrange them
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function parseTarget(text: string): number | null {
  if (!/^-?\d+$/.test(text)) return null;
  const value = Number(text);
  if (!Number.isSafeInteger(value)) return null;
  return value;
}

function sanitizeTarget(text: string): string {
  const trimmed = text.replace(/[^\d-]/g, "");
  const negative = trimmed.startsWith("-");
  const digits = trimmed.replace(/-/g, "").slice(0, 7);
  if (digits.length === 0) return negative ? "-" : "";
  return `${negative ? "-" : ""}${digits}`;
}

function pressKey(current: string, key: string): string {
  if (key === "del") return current.slice(0, -1);
  if (key === "±") {
    if (current.startsWith("-")) return current.slice(1);
    if (current === "" || current === "0") return current === "0" ? "0" : "-";
    return `-${current}`;
  }
  const negative = current.startsWith("-");
  const digits = negative ? current.slice(1) : current;
  if (digits.length >= 7) return current;
  const nextDigits = digits === "0" ? key : `${digits}${key}`;
  return `${negative ? "-" : ""}${nextDigits}`;
}

function historyKey(query: Query): string {
  return `${query.mode}:${query.ops.join("")}:${query.target}`;
}

function readHistory(): Query[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const queries: Query[] = [];
    for (const item of data) {
      if (!item || typeof item !== "object") continue;
      const record = item as Partial<Query>;
      if (!Array.isArray(record.ops) || record.ops.length > 8) continue;
      if (!record.ops.every((op) => op === "*" || op === "+" || op === "-")) continue;
      if (typeof record.target !== "number" || !Number.isSafeInteger(record.target)) continue;
      if (record.mode !== "precedence" && record.mode !== "ltr") continue;
      queries.push({ ops: record.ops, target: record.target, mode: record.mode });
      if (queries.length === 8) break;
    }
    return queries;
  } catch {
    return [];
  }
}

function remember(query: Query): Query[] {
  const previous = readHistory().filter((item) => !sameQuery(item, query));
  const next = [query, ...previous].slice(0, 8);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}
