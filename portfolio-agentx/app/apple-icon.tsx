import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: "#0A0A0A",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "36px",
      }}
    >
      <div
        style={{
          color: "#E8D5B8",
          fontSize: "72px",
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
