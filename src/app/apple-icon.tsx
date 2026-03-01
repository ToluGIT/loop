import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 36,
          background: "#111116",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: "#F97354",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          L
        </span>
      </div>
    ),
    { ...size }
  );
}
