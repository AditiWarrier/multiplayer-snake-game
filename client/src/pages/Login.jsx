import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    try {

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await res.json();

      if (res.ok) {

        localStorage.setItem("token", data.token);

        navigate("/lobby");

      } else {

        alert(data.message);

      }

    } catch (error) {

      alert("Server error");

    }

  };

  return (

    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top, #111118 0%, #050507 65%)"
      }}
    >

      {/* ========================================= */}
      {/* BACKGROUND GLOW */}
      {/* ========================================= */}

      <div
        style={{
          position: "absolute",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "#ff3c5a22",
          filter: "blur(140px)",
          top: "-220px",
          left: "-180px"
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "#ffffff10",
          filter: "blur(140px)",
          bottom: "-180px",
          right: "-180px"
        }}
      />

      {/* ========================================= */}
      {/* MAIN LAYOUT */}
      {/* ========================================= */}

      <div
        style={{
          position: "relative",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8rem",
          minHeight: "100vh",
          paddingLeft: "8%",
          paddingRight: "10%"
        }}
      >

        {/* ========================================= */}
        {/* LEFT TITLE */}
        {/* ========================================= */}

        <div
          style={{
            width: "36%",
            position: "relative",
            zIndex: 10
          }}
        >

          <h1
            className="neon-red"
            style={{
              fontSize: "5.8rem",
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "0.12em"
            }}
          >
            MULTI
          </h1>

          <h1
            className="neon-white"
            style={{
              fontSize: "6rem",
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "0.12em",
              marginTop: "10px"
            }}
          >
            SNAKE
          </h1>

          <h1
            className="neon-white"
            style={{
              fontSize: "6rem",
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "0.12em",
              marginTop: "10px"
            }}
          >
            ARENA
          </h1>

          <p
            style={{
              color: "#666",
              marginTop: "2rem",
              letterSpacing: "0.35em",
              fontSize: "0.82rem"
            }}
          >
            ENTER THE ARENA
          </p>

        </div>

        {/* ========================================= */}
        {/* RIGHT LOGIN AREA */}
        {/* ========================================= */}

        <div
          style={{
            width: "520px",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >

          {/* ========================================= */}
          {/* BACK SNAKE */}
          {/* ========================================= */}

          <img
            src="/snake.png"
            alt="snake-back"
            style={{
              position: "absolute",

              height: "1350px",

              right: "-180px",
              top: "-300px",

              zIndex: 1,

              opacity: 0.98,

              transform: "rotate(-10deg)",

              mixBlendMode: "screen",

              filter:
                `
                drop-shadow(0 0 12px #00e5ff)
                drop-shadow(0 0 35px #8a2eff)
                drop-shadow(0 0 90px rgba(255,255,255,0.22))
                saturate(1.2)
                contrast(1.08)
                `
            }}
          />

          {/* ========================================= */}
          {/* LOGIN CARD */}
          {/* ========================================= */}

          <div
            className="glass-card"
            style={{
              width: "100%",
              padding: "3rem",
              borderRadius: "28px",
              position: "relative",
              zIndex: 20
            }}
          >

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
              }}
            >

              <input
                type="email"
                placeholder="EMAIL"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="PASSWORD"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                onClick={handleLogin}
                className="neon-btn"
              >
                LOGIN
              </button>

            </div>

            <p
              style={{
                color: "#666",
                marginTop: "1.5rem",
                textAlign: "center",
                fontSize: "0.82rem"
              }}
            >
              Don't have an account?{" "}

              <Link
                to="/register"
                style={{
                  color: "#ff3c5a",
                  textDecoration: "none",
                  fontWeight: 700
                }}
              >
                Create Account
              </Link>

            </p>
                      </div>

          <div
  style={{
    position: "absolute",

    width: "240px",
    height: "240px",

    borderRadius: "50%",

    overflow: "hidden",

    right: "-70px",
    bottom: "-20px",

    zIndex: 50,

    pointerEvents: "none"
  }}
>

  <img
    src="/snake.png"
    alt="snake-coil"
    style={{
      position: "absolute",

      width: "720px",

      right: "-160px",
      bottom: "-260px",

      transform: "rotate(-8deg)",

      opacity: 0.95,

      mixBlendMode: "screen",

      filter:
        `
        drop-shadow(0 0 10px #00e5ff)
        drop-shadow(0 0 35px #8a2eff)
        `
    }}
  />

</div>

        </div>

      </div>

    </div>

  );
}

