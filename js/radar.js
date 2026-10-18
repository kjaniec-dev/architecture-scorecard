// Radar chart rendered as inline SVG. Styling lives in css/styles.css (classes below).

const NS = "http://www.w3.org/2000/svg";

const WIDTH = 460;
const HEIGHT = 420;
const CX = WIDTH / 2;
const CY = 205;
const RADIUS = 125;
const LABEL_RADIUS = RADIUS + 22;
const RINGS = [25, 50, 75, 100];

function svg(name, attrs = {}) {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
}

function point(index, count, radius) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)];
}

const fmt = (points) => points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

// items: [{ label, score }] with score 0-100
export function radarChart(items, description) {
  const n = items.length;
  const root = svg("svg", {
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    class: "radar",
    role: "img",
    "aria-label": description,
  });

  for (const ring of RINGS) {
    const pts = items.map((_, i) => point(i, n, (RADIUS * ring) / 100));
    root.append(svg("polygon", { points: fmt(pts), class: "radar-ring" }));
  }

  items.forEach((_, i) => {
    const [x, y] = point(i, n, RADIUS);
    root.append(svg("line", { x1: CX, y1: CY, x2: x, y2: y, class: "radar-axis" }));
  });

  const shape = items.map((item, i) => point(i, n, (RADIUS * item.score) / 100));
  root.append(svg("polygon", { points: fmt(shape), class: "radar-shape" }));
  shape.forEach(([x, y]) => root.append(svg("circle", { cx: x, cy: y, r: 4, class: "radar-dot" })));

  items.forEach((item, i) => {
    const [x, y] = point(i, n, LABEL_RADIUS);
    const side = Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / n);
    const anchor = Math.abs(side) < 0.15 ? "middle" : side > 0 ? "start" : "end";
    const below = y > CY + RADIUS * 0.8;
    const label = svg("text", { x, y: below ? y + 8 : y - 2, "text-anchor": anchor, class: "radar-label" });
    const name = svg("tspan", { x, dy: 0 });
    name.textContent = item.label;
    const value = svg("tspan", { x, dy: "1.25em", class: "radar-value" });
    value.textContent = String(item.score);
    label.append(name, value);
    root.append(label);
  });

  return root;
}
