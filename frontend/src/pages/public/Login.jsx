import React from "react";
import "../../styles/public/login.css";

function Login() {
  return (
    <div className="login-wrapper">
      <h2>Ekran logowania</h2>
      <form className="login-form">
        <input type="email" placeholder="E-mail" />
        <input type="password" placeholder="Hasło" />

        <a href="/dashboard" className="login-link">Zaloguj się</a>
      </form>

      <p className="register-text">
        Nie masz konta?{" "}
        <a href="/register" className="register-link">
          Zarejestruj się
        </a>
      </p>
    </div>
  );
}

export default Login;
