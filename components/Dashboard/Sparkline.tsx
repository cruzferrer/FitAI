import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import Svg, {
  Path,
  Circle,
  Line,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  G,
  Text as SvgText,
} from "react-native-svg";

interface SparklineProps {
  data: number[];
  labels?: string[];
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  labels,
  width,
  height = 160,
  stroke = "#1FB6FF",
  strokeWidth = 2.4,
}) => {
  const window = useWindowDimensions();
  const w = width || Math.min(490, window.width - 24);

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

  // Increased padding for less cramped layout
  const leftPad = 20;
  const rightPad = 20;
  const topPad = 28;
  const bottomPad = 28;
  const yLabelWidth = 50;

  const effectiveW = w - leftPad - rightPad - yLabelWidth;
  const svgWidth = effectiveW + leftPad + rightPad;
  const svgHeight = height + topPad + bottomPad;
  const chartHeight = height;
  const chartWidth = effectiveW;

  // Build points with padding and include values
  const points = data.map((v, i) => {
    const x = leftPad + (i / (data.length - 1)) * chartWidth;
    const y = topPad + chartHeight - ((v - min) / range) * chartHeight;
    return { x, y, value: Math.round(v) };
  });

  // Linear path (straight lines connecting points)
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Filled area under curve
  const areaD = `${pathD} L ${leftPad + chartWidth} ${
    topPad + chartHeight
  } L ${leftPad} ${topPad + chartHeight} Z`;

  // Grid lines (3 horizontal lines)
  const gridYs = [0, 0.5, 1].map((t) => topPad + t * chartHeight);

  // Labels
  const firstLabel = labels?.[0] || "";
  const lastLabel = labels?.[labels.length - 1] || "";

  // Y-axis values
  const yMaxText = Math.round(max);
  const yMidText = Math.round(min + range / 2);
  const yMinText = Math.round(min);

  return (
    <View style={{ width: w }}>
      {/* Chart Row */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Y-axis labels */}
        <View
          style={{
            width: yLabelWidth,
            height: svgHeight,
            justifyContent: "space-around",
            paddingVertical: topPad,
          }}
        >
          <Text style={{ color: "#d1d1d1", fontSize: 12, fontWeight: "500" }}>
            {yMaxText}
          </Text>
          <Text style={{ color: "#d1d1d1", fontSize: 12, fontWeight: "500" }}>
            {yMidText}
          </Text>
          <Text style={{ color: "#d1d1d1", fontSize: 12, fontWeight: "500" }}>
            {yMinText}
          </Text>
        </View>

        {/* SVG Chart */}
        <Svg width={svgWidth} height={svgHeight}>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={svgWidth}
            height={svgHeight}
            fill="transparent"
          />

          {/* Gradient definition */}
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={stroke} stopOpacity="0.12" />
              <Stop offset="100%" stopColor={stroke} stopOpacity="0.01" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {gridYs.map((gy, idx) => (
            <Line
              key={`grid-${idx}`}
              x1={leftPad}
              y1={gy}
              x2={leftPad + chartWidth}
              y2={gy}
              stroke="#ffffff"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <Path d={areaD} fill="url(#grad)" />

          {/* Line path */}
          <Path
            d={pathD}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points - always visible and large */}
          {points.map((p, i) => (
            <Circle
              key={`point-${i}`}
              cx={p.x}
              cy={p.y}
              r={i === points.length - 1 ? 5 : 4}
              fill={i === points.length - 1 ? stroke : "#ffffff"}
              stroke={stroke}
              strokeWidth="1.2"
            />
          ))}

          {/* Value labels above each point */}
          {points.map((p, i) => (
            <G key={`label-${i}`}>
              <SvgText
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                fontSize="11"
                fill={stroke}
                fontWeight="600"
              >
                {p.value}
              </SvgText>
            </G>
          ))}
        </Svg>
      </View>

      {/* X-axis labels */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: yLabelWidth + leftPad,
          marginTop: 6,
          paddingRight: rightPad,
        }}
      >
        <Text style={{ fontSize: 12, color: "#d1d1d1" }}>{firstLabel}</Text>
        <Text style={{ fontSize: 12, color: "#d1d1d1" }}>{lastLabel}</Text>
      </View>
    </View>
  );
};

export default Sparkline;
