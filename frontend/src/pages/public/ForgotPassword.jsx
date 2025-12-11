<<<<<<< HEAD
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/public/login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("kandydat");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/otp/forgot-password", { email, role });
      setMessage("Kod OTP wysłany na e-mail. Sprawdź skrzynkę.");
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.error || "Błąd wysyłania OTP.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/otp/verify-otp", { email, role, otp });
      setResetToken(res.data.resetToken);
      setMessage("Kod OTP zweryfikowany. Możesz ustawić nowe hasło.");
      setStep(3);
    } catch (err) {
      setMessage(err.response?.data?.error || "Nieprawidłowy kod OTP.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/otp/reset-password", { resetToken, newPassword });
      setMessage("Hasło zresetowane pomyślnie. Możesz się zalogować.");
      setStep(4);
    } catch (err) {
      setMessage(err.response?.data?.error || "Błąd resetowania hasła.");
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="login-wrapper">
      <h2>Reset hasła</h2>

      {step === 1 && (
        <form className="login-form" onSubmit={handleRequestOtp}>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="kandydat">Kandydat</option>
            <option value="pracownikHR">Pracownik HR</option>
          </select>
          <input
            type="email"
            placeholder="Podaj e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Wyślij kod OTP</button>
        </form>
      )}

      {step === 2 && (
        <form className="login-form" onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="Wpisz kod OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Zweryfikuj kod</button>
        </form>
      )}

      {step === 3 && (
        <form className="login-form" onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="Nowe hasło"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Zmień hasło</button>
        </form>
      )}

      {message && <p className="message">{message}</p>}

      <button
        onClick={handleBackToLogin}
        className="back-button"
        style={{
          marginTop: "10px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ← Powrót do logowania
      </button>
    </div>
  );
}
=======
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/public/login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("kandydat");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/otp/forgot-password", { email, role });
      setMessage("Kod OTP wysłany na e-mail. Sprawdź skrzynkę.");
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.error || "Błąd wysyłania OTP.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/otp/verify-otp", { email, role, otp });
      setResetToken(res.data.resetToken);
      setMessage("Kod OTP zweryfikowany. Możesz ustawić nowe hasło.");
      setStep(3);
    } catch (err) {
      setMessage(err.response?.data?.error || "Nieprawidłowy kod OTP.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/otp/reset-password", { resetToken, newPassword });
      setMessage("Hasło zresetowane pomyślnie. Możesz się zalogować.");
      setStep(4);
    } catch (err) {
      setMessage(err.response?.data?.error || "Błąd resetowania hasła.");
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="login-wrapper">
      <h2>Reset hasła</h2>

      {step === 1 && (
        <form className="login-form" onSubmit={handleRequestOtp}>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="kandydat">Kandydat</option>
            <option value="pracownikHR">Pracownik HR</option>
          </select>
          <input
            type="email"
            placeholder="Podaj e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Wyślij kod OTP</button>
        </form>
      )}

      {step === 2 && (
        <form className="login-form" onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="Wpisz kod OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Zweryfikuj kod</button>
        </form>
      )}

      {step === 3 && (
        <form className="login-form" onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="Nowe hasło"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Zmień hasło</button>
        </form>
      )}

      {message && <p className="message">{message}</p>}

      <button
        onClick={handleBackToLogin}
        className="back-button"
        style={{
          marginTop: "10px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ← Powrót do logowania
      </button>
    </div>
  );
}
>>>>>>> def9ccd (Poprawki)
