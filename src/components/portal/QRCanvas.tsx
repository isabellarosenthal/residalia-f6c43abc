import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function QRCanvas({ value, size = 240 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current || !value) return;
    QRCode.toCanvas(ref.current, value, {
      width: size, margin: 1,
      color: { dark: "#0a1e3f", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).catch(() => {});
  }, [value, size]);
  return <canvas ref={ref} width={size} height={size} className="rounded-xl border border-[#e8ecf3] bg-white" />;
}
