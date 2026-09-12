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
    // Different lucide UMD versions have shipped the per-icon data in
    // slightly different shapes over time:
    //   - a plain array of [tag, attrs] pairs: [["path", {...}], ...]
    //   - the same array wrapped in an object: { iconNode: [["path", {...}], ...] }
    // Normalize to the plain array shape before rendering, so this works
    // regardless of which shape the loaded version uses.
    const resolvedNodes = Array.isArray(nodeData)
      ? nodeData
      : (nodeData && Array.isArray(nodeData.iconNode) ? nodeData.iconNode : null);

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

      if (!resolvedNodes) {
        // Unknown/unexpected shape — render an empty (but valid) svg
        // instead of crashing the whole app.
        return React.createElement("svg", attrs);
      }

      const children = resolvedNodes.map(function (child, i) {
        // Guard against any entry that isn't a proper [tag, attrs] pair —
        // render nothing for that one node rather than passing a bad
        // `type` into React.createElement (which is what crashed the
        // whole app previously).
        if (!Array.isArray(child) || typeof child[0] !== "string") {
          return null;
        }
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

  // One-time diagnostic: print the raw shape of a known icon so we can see
  // exactly what this lucide build's icon data looks like, in case the
  // normalization above ever needs adjusting for a future version.
  console.log("[icon-shim] diagnostic — raw shape of window.lucide.icons.Flame:", window.lucide.icons && window.lucide.icons.Flame);
  console.log("[icon-shim] diagnostic — window.lucide.icons keys sample:", window.lucide.icons ? Object.keys(window.lucide.icons).slice(0, 5) : "icons object missing");

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
