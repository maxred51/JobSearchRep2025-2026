import React from "react";
import "../../styles/public/register.css";

function Register() {
  return (
    <div className="register-wrapper">
      <h2>Ekran rejestracji</h2>
      <form className="register-form">
        <div className="row">
          <input type="text" placeholder="Imię" />
          <input type="text" placeholder="Nazwisko" />
        </div>

        <input type="email" placeholder="E-mail" />
        <input type="password" placeholder="Hasło" />
        <input type="text" placeholder="Numer telefonu" />

        <div className="radio-group">
  <span>Płeć:</span>
  <input type="radio" id="male" name="gender" value="male" defaultChecked />
  <label htmlFor="male">Mężczyzna</label>

  <input type="radio" id="female" name="gender" value="female" />
  <label htmlFor="female">Kobieta</label>
</div>

<div className="radio-group">
  <span>Rola:</span>
  <input type="radio" id="candidate" name="role" value="candidate" defaultChecked />
  <label htmlFor="candidate">Kandydat</label>

  <input type="radio" id="hr" name="role" value="hr" />
  <label htmlFor="hr">PracownikHR</label>
</div>

        <a href="/register" className="register-link">Zarejestruj się</a>
      </form>

      <p className="login-text">
        Masz już konto?{" "}
        <a href="/login" className="login-link">
          Zaloguj się
        </a>
      </p>
    </div>
  );
}

export default Register;
