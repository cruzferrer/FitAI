import React, { useRef, useEffect } from "react";
import { View, Text, useWindowDimensions, Animated } from "react-native";
import Svg, {
  Rect,
  Defs,
  LinearGradient,
  Stop,
  Path,
  Circle,
  Line,
} from "react-native-svg";

interface SparklineProps {
  data: number[];
  labels?: string[]; // optional x labels (dates)
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  background?: string;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  labels,
  width,
  height = 120,
  stroke = "#FF4500",
  strokeWidth = 2,
  background = "transparent",
}) => {
  const window = useWindowDimensions();
  const w = width || Math.min(480, window.width - 24);
  // animation: fade+scale on data change
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [data, anim]);

  if (!data || data.length === 0) {
    return (
      <View style={{ width: w }}>
        <Text style={{ color: "#888" }}>No hay datos</Text>
      </View>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Build points
  const leftPad = 8; // padding inside SVG
  const rightPad = 8;
  const effectiveW = w - leftPad - rightPad - 44; // leave space for y-labels
  const chartHeight = height;
  const points = data.map((v, i) => {
    const x = leftPad + (i / (data.length - 1)) * effectiveW;
    const y = chartHeight - ((v - min) / range) * chartHeight;
    return { x, y, v };
  });

  // Smooth path using quadratic segments between midpoints
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const cur = pts[i];
      const midX = (prev.x + cur.x) / 2;
      const midY = (prev.y + cur.y) / 2;
      d += ` Q ${prev.x.toFixed(2)} ${prev.y.toFixed(2)} ${midX.toFixed(
        2
      )} ${midY.toFixed(2)}`;
    }
    const last = pts[pts.length - 1];
    d += ` T ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
    return d;
  };

  const pathD = buildSmoothPath(points);
  const areaD = `${pathD} L ${
    leftPad + effectiveW
  } ${chartHeight} L ${leftPad} ${chartHeight} Z`;

  // grid lines (3 horizontals)
  const gridYs = [0, 0.5, 1].map((t) => Math.round(t * chartHeight));

  // labels
  const xLabels = labels && labels.length === data.length ? labels : undefined;
  const firstXLabel = xLabels ? xLabels[0] : undefined;
  const lastXLabel = xLabels ? xLabels[xLabels.length - 1] : undefined;

  // y ticks text
  const yMaxText = String(Math.round(max));
  const yMidText = String(Math.round(min + range / 2));
  const yMinText = String(Math.round(min));

  const animStyle = {
    opacity: anim,
    transform: [
      {
        scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }),
      },
    ],
  } as any;

  return (
    <Animated.View style={[{ width: w }, animStyle]}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Y axis labels */}
        <View style={{ width: 44, height: chartHeight }}>
          <Text style={{ fontSize: 11, color: "#888" }}>{yMaxText}</Text>
          <View style={{ flex: 1 }} />
          <Text style={{ fontSize: 11, color: "#888" }}>{yMidText}</Text>
          <View style={{ flex: 1 }} />
          <Text style={{ fontSize: 11, color: "#888" }}>{yMinText}</Text>
        </View>

        {/* Chart */}
        <Svg width={effectiveW} height={chartHeight}>
          <Rect
            x={0}
            y={0}
            width={effectiveW}
            height={chartHeight}
            fill={background}
            rx={6}
          />

          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
              <Stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* grid lines */}
          {gridYs.map((gy, idx) => (
            <Line
              key={`g-${idx}`}
              x1={0}
              y1={gy}
              x2={effectiveW}
              y2={gy}
              stroke="#2b2b2b"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          ))}

          {/* area and path */}
          <Path d={areaD} fill="url(#grad)" />
          <Path
            d={pathD}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* data points */}
          {points.map((p, i) => (
            <Circle
              key={String(i)}
              cx={p.x}
              cy={p.y}
              r={i === points.length - 1 ? 4 : 2.6}
              fill={i === points.length - 1 ? stroke : "#fff"}
              stroke={i === points.length - 1 ? stroke : "#ddd"}
            />
          ))}
        </Svg>
      </View>

      {/* x-axis labels */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 8,
          marginTop: 8,
        }}
      >
        <Text style={{ fontSize: 12, color: "#888" }}>{firstXLabel || ""}</Text>
        <Text style={{ fontSize: 12, color: "#888" }}>{lastXLabel || ""}</Text>
      </View>
    </Animated.View>
  );
};

export default Sparkline;
