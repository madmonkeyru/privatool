import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Check, r as Copy, t as Undo2 } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CIU0VZzW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GLYPH = {
	"*": "×",
	"+": "+",
	"-": "−"
};
var DIGITS = [
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9
];
function patternLabel(ops) {
	let label = "n";
	for (const op of ops) label += ` ${GLYPH[op]} n`;
	return label;
}
function expressionText(nums, ops, target) {
	let text = String(nums[0]);
	for (let i = 0; i < ops.length; i++) text += ` ${GLYPH[ops[i]]} ${nums[i + 1]}`;
	return `${text} = ${target}`;
}
/** True when × is not entirely before every + or −, so the two modes disagree. */
function modesDiffer(ops) {
	let seenAdd = false;
	for (const op of ops) if (op === "+" || op === "-") seenAdd = true;
	else if (seenAdd) return true;
	return false;
}
function evaluate(nums, ops, mode) {
	if (mode === "ltr") {
		let acc = nums[0];
		for (let i = 0; i < ops.length; i++) {
			const next = nums[i + 1];
			const op = ops[i];
			if (op === "+") acc += next;
			else if (op === "-") acc -= next;
			else acc *= next;
		}
		return acc;
	}
	let sum = 0;
	let sign = 1;
	let term = nums[0];
	for (let i = 0; i < ops.length; i++) {
		const next = nums[i + 1];
		const op = ops[i];
		if (op === "*") term *= next;
		else {
			sum += sign * term;
			sign = op === "+" ? 1 : -1;
			term = next;
		}
	}
	return sum + sign * term;
}
function permutations(k, visit) {
	const used = new Array(10).fill(false);
	const current = [];
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
function solve(ops, target, mode) {
	const width = ops.length + 1;
	if (width > DIGITS.length || !Number.isInteger(target)) return {
		groups: [],
		totalExpressions: 0
	};
	const grouped = /* @__PURE__ */ new Map();
	let totalExpressions = 0;
	permutations(width, (nums) => {
		if (evaluate(nums, ops, mode) !== target) return;
		totalExpressions += 1;
		const digits = [...nums].sort((a, b) => a - b);
		const key = digits.join(",");
		let group = grouped.get(key);
		if (!group) {
			group = {
				digits,
				count: 0,
				examples: []
			};
			grouped.set(key, group);
		}
		group.count += 1;
		if (group.examples.length < 3) group.examples.push([...nums]);
	});
	return {
		groups: [...grouped.values()].sort((a, b) => {
			const length = a.digits.length - b.digits.length;
			if (length !== 0) return length;
			return a.digits.join(",").localeCompare(b.digits.join(","), void 0, { numeric: true });
		}),
		totalExpressions
	};
}
function sameQuery(a, b) {
	if (a.target !== b.target || a.mode !== b.mode || a.ops.length !== b.ops.length) return false;
	return a.ops.every((op, index) => op === b.ops[index]);
}
var HISTORY_KEY = "ninefold.history";
var OP_BUTTONS = [
	{
		op: "*",
		label: "Multiply"
	},
	{
		op: "+",
		label: "Add"
	},
	{
		op: "-",
		label: "Subtract"
	}
];
function Home() {
	const [ops, setOps] = (0, import_react.useState)([]);
	const [targetText, setTargetText] = (0, import_react.useState)("");
	const [mode, setMode] = (0, import_react.useState)("precedence");
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const [error, setError] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const [solved, setSolved] = (0, import_react.useState)(null);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [copiedId, setCopiedId] = (0, import_react.useState)(null);
	const requestId = (0, import_react.useRef)(0);
	const resultsRef = (0, import_react.useRef)(null);
	const copyTimer = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setHistory(readHistory());
		return () => {
			if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
		};
	}, []);
	const target = parseTarget(targetText);
	const draft = target === null ? null : {
		ops,
		target,
		mode
	};
	const stale = phase === "done" && solved !== null && (draft === null || !sameQuery(solved, draft));
	const differ = modesDiffer(ops);
	function addOp(op) {
		setOps((current) => current.length >= 8 ? current : [...current, op]);
	}
	function run(query) {
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
				resultsRef.current?.scrollIntoView({
					behavior: reduce ? "auto" : "smooth",
					block: "start"
				});
			}
		}, 0);
	}
	function onSubmit(event) {
		event.preventDefault();
		if (target === null) {
			setError("Enter a whole number — the result you want.");
			return;
		}
		run({
			ops,
			target,
			mode
		});
	}
	function copyExample(id, text) {
		navigator.clipboard.writeText(text).then(() => {
			setCopiedId(id);
			if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
			copyTimer.current = window.setTimeout(() => setCopiedId(null), 1400);
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-1 rounded-xl bg-ink p-2",
					"aria-hidden": "true",
					children: Array.from({ length: 9 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: index === 8 ? "size-2 rounded-full bg-accent" : "size-2 rounded-full bg-surface" }, index))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-muted",
					children: "Digits 1–9"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl leading-none text-ink",
					children: "Ninefold"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-xl text-base text-ink",
				children: "Tap ×, +, or − in the order they appear. Enter the result and press equals. Ninefold lists the digits from 1–9 that make the equation true. Each digit is used at most once."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid items-start gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit,
					className: "rounded-3xl border border-line bg-surface p-4 sm:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-medium text-muted",
								children: "Pattern"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setOps([]),
								disabled: ops.length === 0,
								className: "min-h-11 px-2 text-sm font-medium text-accent disabled:opacity-40",
								children: "Clear"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex min-h-16 flex-wrap items-center gap-2 rounded-2xl bg-bg px-3 py-3",
							"aria-live": "polite",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slot, {}),
								ops.map((op, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "contents",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-2xl text-accent",
										children: GLYPH[op]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slot, {})]
								}, `${op}-${index}`)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "px-1 font-display text-2xl text-muted",
									children: "="
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-2xl text-ink",
									children: targetText === "" ? "?" : targetText
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: ops.length === 0 ? "No operations yet — that looks for a single digit." : `${ops.length} ${ops.length === 1 ? "operation" : "operations"} · ${ops.length + 1} digits`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex gap-2",
							children: [OP_BUTTONS.map(({ op, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": label,
								disabled: ops.length >= 8,
								onClick: () => addOp(op),
								className: "min-h-16 flex-1 rounded-2xl bg-ink font-display text-3xl text-surface transition-opacity duration-150 disabled:opacity-40",
								children: GLYPH[op]
							}, op)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Remove last operation",
								disabled: ops.length === 0,
								onClick: () => setOps((current) => current.slice(0, -1)),
								className: "min-h-16 min-w-14 rounded-2xl border border-line bg-bg px-3 text-ink disabled:opacity-40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, {
									className: "mx-auto size-5",
									"aria-hidden": "true"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							className: "mt-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
									className: "text-sm font-medium text-muted",
									children: "Order of operations"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 grid grid-cols-2 gap-1 rounded-2xl bg-bg p-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
										pressed: mode === "precedence",
										onClick: () => setMode("precedence"),
										label: "× before + −"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
										pressed: mode === "ltr",
										onClick: () => setMode("ltr"),
										label: "Left to right"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: differ ? mode === "precedence" ? "Multiplication is worked before addition and subtraction." : "Each operation is applied in the order you pressed it." : "This pattern gives the same answers either way."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "result",
									className: "text-sm font-medium text-muted",
									children: "Result"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "result",
									inputMode: "numeric",
									autoComplete: "off",
									spellCheck: false,
									value: targetText,
									placeholder: "?",
									"aria-invalid": error !== null,
									"aria-describedby": error ? "result-error" : void 0,
									onChange: (event) => setTargetText(sanitizeTarget(event.target.value)),
									className: "mt-2 w-full rounded-2xl bg-bg px-4 py-3 font-display text-4xl text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent"
								}),
								error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									id: "result-error",
									role: "alert",
									className: "mt-2 text-sm text-accent",
									children: error
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid grid-cols-3 gap-2",
							children: [
								"1",
								"2",
								"3",
								"4",
								"5",
								"6",
								"7",
								"8",
								"9",
								"±",
								"0",
								"del"
							].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": key === "±" ? "Toggle sign" : key === "del" ? "Delete digit" : void 0,
								onClick: () => setTargetText((current) => pressKey(current, key)),
								className: "min-h-12 rounded-xl bg-bg font-display text-xl text-ink",
								children: key === "del" ? "⌫" : key
							}, key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							disabled: phase === "searching",
							className: "mt-3 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-accent text-surface disabled:opacity-60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-4xl leading-none",
								children: "="
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-base font-medium",
								children: phase === "searching" ? "Searching 1–9" : "Find digits"
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					ref: resultsRef,
					"aria-live": "polite",
					className: "min-w-0",
					children: [phase === "searching" && result === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl leading-tight text-ink",
						children: "Searching 1–9…"
					}) : phase === "idle" || result === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdlePanel, { onTry: () => run({
						ops: ["*", "-"],
						target: 21,
						mode: "precedence"
					}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [phase === "searching" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-sm text-muted",
						children: "Updating…"
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Results, {
						result,
						solved,
						stale,
						copiedId,
						onCopy: copyExample
					})] }), history.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-medium text-muted",
								children: "Recent, on this device"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									localStorage.removeItem(HISTORY_KEY);
									setHistory([]);
								},
								className: "min-h-11 px-2 text-sm font-medium text-accent",
								children: "Clear"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 flex flex-wrap gap-2",
							children: history.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => run(item),
								className: "min-h-11 rounded-full border border-line bg-surface px-3 text-sm text-ink",
								children: [
									patternLabel(item.ops),
									" = ",
									item.target,
									item.mode === "ltr" ? " · left to right" : ""
								]
							}) }, historyKey(item)))
						})]
					}) : null]
				})]
			})
		]
	});
}
function Slot() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex size-11 items-center justify-center rounded-xl border border-line bg-surface font-display text-lg text-muted",
		children: "n"
	});
}
function ModeButton({ pressed, onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": pressed,
		onClick,
		className: pressed ? "min-h-11 rounded-xl bg-ink px-2 text-sm font-medium text-surface" : "min-h-11 rounded-xl px-2 text-sm font-medium text-ink",
		children: label
	});
}
function IdlePanel({ onTry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl border border-dashed border-line px-5 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl leading-tight text-ink",
				children: "Numbers needed will land here."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-md text-base text-muted",
				children: "For number × number − number, tap × once, then −, type the result, and press equals."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onTry,
				className: "mt-5 min-h-11 rounded-full bg-ink px-4 text-sm font-medium text-surface",
				children: "Try × − = 21"
			})
		]
	});
}
function Results({ result, solved, stale, copiedId, onCopy }) {
	if (!solved) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-3xl leading-tight text-ink",
			children: result.totalExpressions === 0 ? "No match" : `${result.groups.length} ${result.groups.length === 1 ? "set" : "sets"}`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-sm text-muted",
			children: [
				patternLabel(solved.ops),
				" = ",
				solved.target,
				solved.mode === "ltr" ? " · left to right" : " · × before + −",
				result.totalExpressions > 0 ? ` · ${result.totalExpressions.toLocaleString()} ${result.totalExpressions === 1 ? "equation" : "equations"}` : ""
			]
		}),
		stale ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 rounded-2xl bg-surface px-3 py-2 text-sm text-ink",
			children: "You changed the pattern or the result. Press equals to search again."
		}) : null,
		result.groups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-base text-ink",
			children: "No selection from 1–9 makes that result with this pattern."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 flex flex-col gap-3",
			children: result.groups.map((group) => {
				const key = group.digits.join("-");
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-3xl border border-line bg-surface p-4 sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-widest text-muted uppercase",
							children: "Numbers needed"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-display text-4xl leading-none text-ink",
							children: group.digits.join(" · ")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: group.count === 1 ? "1 arrangement" : `${group.count.toLocaleString()} arrangements`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 flex flex-col gap-2",
							children: group.examples.map((nums, index) => {
								const id = `${key}-${index}`;
								const text = expressionText(nums, solved.ops, solved.target);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex min-w-0 flex-wrap items-baseline gap-x-2 font-display text-xl leading-snug text-ink",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: nums[0] }),
											solved.ops.map((op, opIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "contents",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-accent",
													children: GLYPH[op]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: nums[opIndex + 1] })]
											}, opIndex)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted",
												children: "="
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: solved.target })
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": `Copy ${text}`,
										onClick: () => onCopy(id, text),
										className: "mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted",
										children: copiedId === id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											className: "size-4 text-accent",
											"aria-hidden": "true"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
											className: "size-4",
											"aria-hidden": "true"
										})
									})]
								}, id);
							})
						}),
						group.count > group.examples.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: [
								"and ",
								(group.count - group.examples.length).toLocaleString(),
								" more ways to arrange them"
							]
						}) : null
					]
				}, key);
			})
		})
	] });
}
function parseTarget(text) {
	if (!/^-?\d+$/.test(text)) return null;
	const value = Number(text);
	if (!Number.isSafeInteger(value)) return null;
	return value;
}
function sanitizeTarget(text) {
	const trimmed = text.replace(/[^\d-]/g, "");
	const negative = trimmed.startsWith("-");
	const digits = trimmed.replace(/-/g, "").slice(0, 7);
	if (digits.length === 0) return negative ? "-" : "";
	return `${negative ? "-" : ""}${digits}`;
}
function pressKey(current, key) {
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
function historyKey(query) {
	return `${query.mode}:${query.ops.join("")}:${query.target}`;
}
function readHistory() {
	try {
		const raw = localStorage.getItem(HISTORY_KEY);
		if (!raw) return [];
		const data = JSON.parse(raw);
		if (!Array.isArray(data)) return [];
		const queries = [];
		for (const item of data) {
			if (!item || typeof item !== "object") continue;
			const record = item;
			if (!Array.isArray(record.ops) || record.ops.length > 8) continue;
			if (!record.ops.every((op) => op === "*" || op === "+" || op === "-")) continue;
			if (typeof record.target !== "number" || !Number.isSafeInteger(record.target)) continue;
			if (record.mode !== "precedence" && record.mode !== "ltr") continue;
			queries.push({
				ops: record.ops,
				target: record.target,
				mode: record.mode
			});
			if (queries.length === 8) break;
		}
		return queries;
	} catch {
		return [];
	}
}
function remember(query) {
	const next = [query, ...readHistory().filter((item) => !sameQuery(item, query))].slice(0, 8);
	localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
	return next;
}
//#endregion
export { Home as component };
