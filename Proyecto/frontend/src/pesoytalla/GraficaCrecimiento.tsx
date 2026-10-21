import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { Fila } from "./cdc";

type Props = {
  titulo: string;
  filas: Fila[];
  curvas: string[]; // percentiles a dibujar, p.ej. ["p3", "p50", "p97"]
  etiquetaX: string;
  etiquetaY: string;
  xDivisor?: number; // 12 para pasar meses -> años
  punto: { x: number; y: number } | null; // x en las mismas unidades de la tabla
};

const pasoBonito = (bruto: number) => {
  const p = 10 ** Math.floor(Math.log10(bruto));
  const f = bruto / p;
  const m = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return m * p;
};

const marcas = (min: number, max: number, n = 6) => {
  if (!(max > min)) return [min];
  const paso = pasoBonito((max - min) / n);
  const res: number[] = [];
  for (let v = Math.ceil(min / paso) * paso; v <= max + 1e-9; v += paso) {
    res.push(Number(v.toFixed(6)));
  }
  return res;
};

export const GraficaCrecimiento = ({
  titulo,
  filas,
  curvas,
  etiquetaX,
  etiquetaY,
  xDivisor = 1,
  punto,
}: Props) => {
  const theme = useTheme();

  if (filas.length === 0) return null;

  const usadas = curvas.filter((c) => filas[0].pct[c] !== undefined);

  const W = 640;
  const H = 380;
  const m = { t: 16, r: 44, b: 48, l: 56 };

  const xs = filas.map((f) => f.x / xDivisor);
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);

  const ys = filas.flatMap((f) => usadas.map((c) => f.pct[c]));
  if (punto) ys.push(punto.y);
  const yminBruto = Math.min(...ys);
  const ymaxBruto = Math.max(...ys);
  const margenY = (ymaxBruto - yminBruto) * 0.05;
  const ymin = yminBruto - margenY;
  const ymax = ymaxBruto + margenY;

  const sx = (x: number) => m.l + ((x - xmin) / (xmax - xmin)) * (W - m.l - m.r);
  const sy = (y: number) =>
    H - m.b - ((y - ymin) / (ymax - ymin)) * (H - m.t - m.b);

  const colorTexto = theme.palette.text.secondary;
  const colorGrid = theme.palette.divider;
  const colorCurva = theme.palette.primary.main;

  const px = punto ? punto.x / xDivisor : null;
  const puntoVisible =
    punto !== null && px !== null && px >= xmin && px <= xmax;

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
        {titulo}
      </Typography>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={titulo}
        style={{ display: "block" }}
      >
        {/* Cuadrícula y ejes */}
        {marcas(ymin, ymax).map((v) => (
          <g key={`y${v}`}>
            <line
              x1={m.l}
              x2={W - m.r}
              y1={sy(v)}
              y2={sy(v)}
              stroke={colorGrid}
              strokeWidth={1}
            />
            <text
              x={m.l - 6}
              y={sy(v) + 3}
              textAnchor="end"
              fontSize={10}
              fill={colorTexto}
            >
              {v}
            </text>
          </g>
        ))}

        {marcas(xmin, xmax).map((v) => (
          <g key={`x${v}`}>
            <line
              x1={sx(v)}
              x2={sx(v)}
              y1={m.t}
              y2={H - m.b}
              stroke={colorGrid}
              strokeWidth={1}
            />
            <text
              x={sx(v)}
              y={H - m.b + 14}
              textAnchor="middle"
              fontSize={10}
              fill={colorTexto}
            >
              {v}
            </text>
          </g>
        ))}

        <text
          x={(m.l + W - m.r) / 2}
          y={H - 8}
          textAnchor="middle"
          fontSize={11}
          fill={colorTexto}
        >
          {etiquetaX}
        </text>
        <text
          x={14}
          y={H / 2}
          textAnchor="middle"
          fontSize={11}
          fill={colorTexto}
          transform={`rotate(-90 14 ${H / 2})`}
        >
          {etiquetaY}
        </text>

        {/* Curvas de percentiles */}
        {usadas.map((c) => {
          const d = filas
            .map(
              (f, i) =>
                `${i === 0 ? "M" : "L"}${sx(f.x / xDivisor).toFixed(1)},${sy(
                  f.pct[c]
                ).toFixed(1)}`
            )
            .join(" ");
          const ultima = filas[filas.length - 1];
          const esMediana = c === "p50";

          return (
            <g key={c}>
              <path
                d={d}
                fill="none"
                stroke={colorCurva}
                strokeWidth={esMediana ? 2.5 : 1.2}
                strokeOpacity={esMediana ? 1 : 0.55}
                strokeDasharray={esMediana ? undefined : "4 3"}
              />
              <text
                x={W - m.r + 4}
                y={sy(ultima.pct[c]) + 3}
                fontSize={10}
                fill={colorTexto}
              >
                P{c.slice(1)}
              </text>
            </g>
          );
        })}

        {/* Punto del paciente */}
        {puntoVisible && punto && px !== null && (
          <g>
            <circle
              cx={sx(px)}
              cy={sy(punto.y)}
              r={6}
              fill={theme.palette.error.main}
              stroke="#fff"
              strokeWidth={2}
            />
          </g>
        )}
      </svg>
    </Box>
  );
};
