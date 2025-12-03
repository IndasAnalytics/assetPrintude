"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2>Something went wrong!</h2>
          <p style={{ color: "#666" }}>
            {error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
