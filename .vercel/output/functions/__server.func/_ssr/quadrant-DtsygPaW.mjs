import { J as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quadrant-DtsygPaW.js
var import_jsx_runtime = require_jsx_runtime();
function QuadrantPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		"aria-label": "Quadrant Dots",
		className: "w-full overflow-hidden",
		style: { height: "calc(100dvh - 3rem)" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
			src: "/tools/quadrant-dots.html",
			title: "Quadrant Dots",
			className: "h-full w-full border-0"
		})
	});
}
//#endregion
export { QuadrantPage as component };
