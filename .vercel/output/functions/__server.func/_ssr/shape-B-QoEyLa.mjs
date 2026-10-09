import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shape-B-QoEyLa.js
var import_jsx_runtime = require_jsx_runtime();
function ShapePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		"aria-label": "Shape Operator Solver",
		className: "w-full overflow-hidden",
		style: { height: "calc(100dvh - 3rem)" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
			src: "/tools/shape-solver.html",
			title: "Shape Operator Solver",
			className: "h-full w-full border-0"
		})
	});
}
//#endregion
export { ShapePage as component };
