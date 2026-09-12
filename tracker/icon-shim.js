/**
 * Lucide-to-React icon shim for a no-build (plain HTML/CDN) setup.
 *
 * The React source (app.jsx) was written against `lucide-react`, which
 * needs a bundler. This shim reads the same icon path data from the
 * plain `lucide` UMD build (loaded as window.lucide) and wraps each one
 * as a small React function component with the same name — so app.jsx's
 * <Flame />, <ChevronRight /> etc. work unmodified as browser globals.
 *
 * Load order in index.html:
 *   1. React, ReactDOM, Babel
 *   2. lucide UMD build  (defines window.lucide)
 *   3. this file          (defines window.Flame, window.ChevronRight, ...)
 *   4. app.jsx            (type="text/babel", uses those globals directly)
 */
(function () {
  const ICON_NAMES = [
    "LayoutDashboard", "ClipboardList", "Wrench", "FlaskConical", "Wallet", "Users",
    "FileCheck2", "ChevronLeft", "ChevronRight", "Search", "Filter", "Plus", "X",
    "Camera", "Cloud", "CalendarDays", "AlertTriangle", "CheckCircle2", "Circle",
    "Clock", "MoreHorizontal", "ArrowUpRight", "ArrowDownRight", "Download",
    "MapPin", "Gauge", "Flame", "Truck", "HardHat", "ChevronDown", "Kanban",
    "ListTodo", "LayoutGrid", "CircleDot", "Paperclip", "Menu", "Building2",
    "ListChecks", "Trash2", "Fuel", "Radio", "Hammer", "Shield", "PackageSearch",
    "Check", "FolderKanban", "Pencil", "Save", "FileSpreadsheet", "TrendingUp",
    "Route", "Waves", "Sparkles", "ArrowRight", "Zap"
  ];

  // lucide's PascalCase export names differ slightly in casing/format from
  // the kebab-case `data-lucide` names; the UMD build also exposes them
  // directly as PascalCase keys on window.lucide (e.g. lucide.ChevronRight),
  // each holding raw icon node data: [tag, attrs, children].
  function buildIconComponent(nodeData) {
    return function LucideIcon(props) {
      const { size = 24, color = "currentColor", strokeWidth = 2, className, style, ...rest } = props || {};
      const attrs = {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth: strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className,
        style,
        ...rest,
      };
      const children = (nodeData || []).map(function (child, i) {
        const tag = child[0];
        const childAttrs = Object.assign({ key: i }, child[1]);
        return React.createElement(tag, childAttrs);
      });
      return React.createElement("svg", attrs, children);
    };
  }

  if (!window.lucide) {
    console.error("Lucide UMD build not found on window.lucide — check the <script> order in index.html.");
    return;
  }

  // Fallback so a missing/renamed icon never crashes the whole app with a
  // blank white screen (React error #130: "element type is invalid").
  // Renders a small dashed placeholder box instead, and logs which name
  // was missing so it can be fixed properly.
  function buildPlaceholderComponent(name) {
    return function MissingIcon(props) {
      const { size = 24, style, className } = props || {};
      return React.createElement("svg", {
        width: size, height: size, viewBox: "0 0 24 24",
        style, className,
        "data-missing-icon": name,
      }, React.createElement("rect", {
        x: 2, y: 2, width: 20, height: 20, rx: 4,
        fill: "none", stroke: "#cbd5e1", strokeWidth: 1.5, strokeDasharray: "3 2",
      }));
    };
  }

  let missing = [];
  ICON_NAMES.forEach(function (name) {
    const iconData = window.lucide.icons && window.lucide.icons[name];
    if (!iconData) {
      missing.push(name);
      window[name] = buildPlaceholderComponent(name);
      return;
    }
    window[name] = buildIconComponent(iconData);
  });

  if (missing.length > 0) {
    console.warn(
      "[icon-shim] " + missing.length + " icon(s) not found in the loaded lucide build — " +
      "showing dashed placeholders instead of crashing. Missing: " + missing.join(", ")
    );
  }
})();
