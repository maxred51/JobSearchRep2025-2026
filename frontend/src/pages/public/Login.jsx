import React, { useState } from "react";
import axios from "axios";
import "../../styles/public/login.css";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [haslo, setHaslo] = useState("");
  const [rola, setRola] = useState("kandydat");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = `http://localhost:5000/api/${rola}/login`;
      const response = await axios.post(endpoint, { email, haslo });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user.id);
      localStorage.setItem("rola", rola);

      switch (rola) {
        case "kandydat":
          navigate("/");
          break;
        case "pracownikHR":
          navigate("/employee");
          break;
        case "administrator":
          navigate("/admin");
          break;
        default:
          navigate("/");
          break;
      }
    } catch (err) {
      setError(err.response?.data?.error || "Błąd połączenia z serwerem");
    }
  };

  return (
    <div className="login-wrapper">
      <h2>Ekran logowania</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <select
          value={rola}
          onChange={(e) => setRola(e.target.value)}
          className="role-select"
        >
          <option value="kandydat">Kandydat</option>
          <option value="pracownikHR">Pracownik HR</option>
          <option value="administrator">Administrator</option>
        </select>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Hasło"
          value={haslo}
          onChange={(e) => setHaslo(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}
        <button type="submit">Zaloguj się</button>
      </form>

      <p className="register-text">
        Nie masz konta?{" "}
        <a href="/register" className="register-link">
          Zarejestruj się
        </a>
      </p>

      <p className="forgot-password-text">
        Nie pamiętasz hasła?{" "}
        <a href="/forgot-password" className="forgot-password-link">
          Zresetuj je
        </a>
      </p>
    </div>
  );
}

export default Login;
