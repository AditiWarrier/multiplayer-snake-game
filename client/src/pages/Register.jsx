import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {

    try {

      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      });

      const data = await res.json();

      if (res.ok) {

        alert("Account created successfully");

        navigate("/");

      } else {

        alert(data.message);

      }

    } catch (error) {

      alert("Server error");

    }

  };

  return (
    <main
      className="register-page"
      style={{ background: "radial-gradient(circle at top, #111118 0%, #050507 65%)" }}
    >
      <div className="register-glow register-glow-red" aria-hidden="true" />
      <div className="register-glow register-glow-white" aria-hidden="true" />
      <section className="register-layout">
        <header className="register-heading">
          <p className="register-kicker">MULTIPLAYER // SNAKE ARENA</p>
          <h1 className="neon-white">JOIN THE<br /><span className="neon-red">ARENA</span></h1>
          <p className="register-caption">CREATE YOUR PLAYER PROFILE</p>
        </header>

        <div className="glass-card register-card">
          <div className="register-card-heading">
            <span className="register-index">01 / NEW PLAYER</span>
            <h2 className="neon-white">CREATE ACCOUNT</h2>
          </div>
          <div className="register-fields">
            <input
              type="text"
              placeholder="USERNAME"
              aria-label="Username"
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="EMAIL"
              aria-label="Email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="PASSWORD"
              aria-label="Password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleRegister} className="neon-btn">CREATE ACCOUNT</button>
          </div>
          <p className="register-login-prompt">
            Already have an account?{" "}
            <Link to="/" className="register-login-link">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
