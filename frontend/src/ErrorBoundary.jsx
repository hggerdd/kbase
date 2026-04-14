import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Unknown frontend error",
    };
  }

  componentDidCatch(error) {
    console.error("kbase frontend crashed", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            background: "linear-gradient(180deg, #07101c 0%, #050b14 100%)",
            color: "#eef5ff",
            fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: "720px",
              width: "100%",
              padding: "24px",
              borderRadius: "24px",
              border: "1px solid rgba(125, 176, 255, 0.18)",
              background: "rgba(10, 22, 37, 0.82)",
            }}
          >
            <p style={{ color: "#58e5ff", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              frontend runtime error
            </p>
            <h1 style={{ marginTop: 0 }}>The app failed to render.</h1>
            <p style={{ color: "#88a1be" }}>{this.state.message}</p>
            <p style={{ color: "#88a1be" }}>
              Check that the backend is running on <code>http://127.0.0.1:8000</code> and the
              frontend on <code>http://127.0.0.1:5173</code>.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
