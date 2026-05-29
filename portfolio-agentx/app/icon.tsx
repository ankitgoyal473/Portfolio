import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: "#0A0A0A",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
      }}
    >
      <div
        style={{
          color: "#E8D5B8",
          fontSize: "18px",
          fontWeight: "bold",
          fontFamily: "sans-serif",
        }}
      >
        AX
      </div>
    </div>,
    { ...size }
  );
}
