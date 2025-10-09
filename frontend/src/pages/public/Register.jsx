import React, { useState } from "react";
import axios from "axios";
import "../../styles/public/register.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    imie: "",
    nazwisko: "",
    telefon: "",
    email: "",
    haslo: "",
    plec: "M",
    rola: "kandydat",
    cv_path: "",
    firmaNazwa: "" 
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let url = "";
      let payload = { ...formData };

      if (formData.rola === "kandydat") {
        url = "http://localhost:5000/api/kandydat/";
      } else if (formData.rola === "pracownik") {
        const firmaResponse = await axios.post(
          "http://localhost:5000/api/firma/dodajLubZnajdz",
          { nazwa: formData.firmaNazwa }
        );

        const Firmaid = firmaResponse.data.id;
        console.log("Uzyskano Firmaid:", Firmaid);

        url = "http://localhost:5000/api/pracownikHR/";
        payload = { ...payload, Firmaid };
      }

      const res = await axios.post(url, payload);
      setMessage("Rejestracja zakończona sukcesem!");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Błąd serwera");
    }
  };

  return (
    <div className="register-wrapper">
      <h2>Rejestracja użytkownika</h2>

      <form className="register-form" onSubmit={handleSubmit}>
        <input type="text" name="imie" placeholder="Imię" onChange={handleChange} required />
        <input type="text" name="nazwisko" placeholder="Nazwisko" onChange={handleChange} required />
        <input type="text" name="telefon" placeholder="Telefon" onChange={handleChange} required />
        <input type="email" name="email" placeholder="E-mail" onChange={handleChange} required />
        <input type="password" name="haslo" placeholder="Hasło" onChange={handleChange} required />

        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="plec"
              value="M"
              checked={formData.plec === "M"}
              onChange={handleChange}
            />
            Mężczyzna
          </label>
          <label>
            <input
              type="radio"
              name="plec"
              value="K"
              checked={formData.plec === "K"}
              onChange={handleChange}
            />
            Kobieta
          </label>
        </div>

        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="rola"
              value="kandydat"
              checked={formData.rola === "kandydat"}
              onChange={handleChange}
            />
            Kandydat
          </label>
          <label>
            <input
              type="radio"
              name="rola"
              value="pracownik"
              checked={formData.rola === "pracownik"}
              onChange={handleChange}
            />
            Pracownik HR
          </label>
        </div>

        {formData.rola === "pracownik" && (
          <input
            type="text"
            name="firmaNazwa"
            placeholder="Nazwa firmy"
            onChange={handleChange}
            required
          />
        )}

        <button type="submit">Zarejestruj się</button>
      </form>

      {message && <p className="message">{message}</p>}

      <button
        className="back-to-login"
        onClick={() => navigate("/login")}
        style={{
          marginTop: "10px",
          backgroundColor: "#ccc",
          color: "#000",
          border: "none",
          padding: "8px 16px",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        ← Powrót do logowania
      </button>
    </div>
  );
}

export default Register;
