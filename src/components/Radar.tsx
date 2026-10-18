// Radar chart as inline SVG. Styling lives in styles/global.css.

const WIDTH = 460;
const HEIGHT = 420;
const CX = WIDTH / 2;
const CY = 205;
const RADIUS = 125;
const LABEL_RADIUS = RADIUS + 22;
const RINGS = [25, 50, 75, 100];

interface Props {
  items: { label: string; score: number }[];
  description: string;
}

const angle = (i: number, n: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

function point(i: number, n: number, radius: number): [number, number] {
  return [CX + radius * Math.cos(angle(i, n)), CY + radius * Math.sin(angle(i, n))];
}

const toPoints = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

export function Radar({ items, description }: Props) {
  const n = items.length;
  const shape = items.map((item, i) => point(i, n, (RADIUS * item.score) / 100));

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="radar" role="img" aria-label={description}>
      {RINGS.map((ring) => (
        <polygon
          key={ring}
          className="radar-ring"
          points={toPoints(items.map((_, i) => point(i, n, (RADIUS * ring) / 100)))}
        />
      ))}
      {items.map((item, i) => {
        const [x, y] = point(i, n, RADIUS);
        return <line key={item.label} x1={CX} y1={CY} x2={x} y2={y} className="radar-axis" />;
      })}
      <polygon className="radar-shape" points={toPoints(shape)} />
      {shape.map(([x, y], i) => (
        <circle key={items[i]!.label} cx={x} cy={y} r={4} className="radar-dot" />
      ))}
      {items.map((item, i) => {
        const [x, y] = point(i, n, LABEL_RADIUS);
        const side = Math.cos(angle(i, n));
        const anchor = Math.abs(side) < 0.15 ? "middle" : side > 0 ? "start" : "end";
        const below = y > CY + RADIUS * 0.8;
        return (
          <text key={item.label} x={x} y={below ? y + 8 : y - 2} textAnchor={anchor} className="radar-label">
            <tspan x={x}>{item.label}</tspan>
            <tspan x={x} dy="1.25em" className="radar-value">
              {item.score}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
