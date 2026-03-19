import { ReactFlowState, useStore } from "@xyflow/react";
import { CSSProperties, useEffect, useRef } from "react";

const canvasStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  position: "absolute",
  zIndex: 10,
  pointerEvents: "none",
};

const storeSelector = (state: ReactFlowState) => ({
  width: state.width,
  height: state.height,
  transform: state.transform,
});

export interface BaseFlowHelperLinesProps {
  horizontal?: number;
  vertical?: number;

  // Configurações visuais
  strokeColor?: string;
  lineWidth?: number;
  dashPattern?: number[];
  opacity?: number;

  // Classes CSS
  className?: string;
}

export function BaseFlowHelperLines({
  horizontal,
  vertical,
  strokeColor = "#1d5ade",
  lineWidth = 1,
  dashPattern = [5, 5],
  opacity = 1,
  className,
}: BaseFlowHelperLinesProps) {
  const { width, height, transform } = useStore(storeSelector);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) {
      return;
    }

    const dpi = window.devicePixelRatio;
    canvas.width = width * dpi;
    canvas.height = height * dpi;

    ctx.scale(dpi, dpi);
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = opacity;
    ctx.setLineDash(dashPattern);

    // Linha vertical
    if (typeof vertical === "number") {
      ctx.beginPath();
      ctx.moveTo(vertical * transform[2] + transform[0], 0);
      ctx.lineTo(vertical * transform[2] + transform[0], height);
      ctx.stroke();
    }

    // Linha horizontal
    if (typeof horizontal === "number") {
      ctx.beginPath();
      ctx.moveTo(0, horizontal * transform[2] + transform[1]);
      ctx.lineTo(width, horizontal * transform[2] + transform[1]);
      ctx.stroke();
    }
  }, [width, height, transform, horizontal, vertical, strokeColor, lineWidth, dashPattern, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={className || "react-flow__canvas"}
      style={canvasStyle}
    />
  );
}
