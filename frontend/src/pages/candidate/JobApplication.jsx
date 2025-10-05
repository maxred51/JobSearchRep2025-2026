import React, { useState } from "react";
import "../../styles/candidate/JobApplication.css";
import Header from "../../components/Header";

function JobApplication() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    salary: "",
    competence: "",
    consent: false,
    cvFile: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files[0]
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dane aplikacji:", formData);
    alert("Formularz wysłany!");
  };

  return (
    <div className="application-page">
      <Header />

      <main className="application-container">
        <h2 className="form-title">Formularz aplikacyjny</h2>

        <form className="application-form" onSubmit={handleSubmit}>
          <div className="form-columns">
            <div className="form-left">
              <label>
                Imię*:
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jan"
                  required
                />
              </label>

              <label>
                Nazwisko*:
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Kowalski"
                  required
                />
              </label>

              <label>
                E-mail*:
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jan.kowalski@email.com"
                  required
                />
              </label>

              <label>
                Telefon:
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+48 555 555 555"
                />
              </label>

              <label>
                CV*:
                <input
                  type="file"
                  name="cvFile"
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="consent">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  required
                />
                Wyrażam zgodę na przetwarzanie moich danych osobowych w celu
                realizacji procesu rekrutacji.*
              </label>
            </div>

            <div className="form-right">
              <label>
                Oczekiwania finansowe*:
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="np. 7000 PLN"
                  required
                />
              </label>

              <label>
                Jak zamierzasz wykorzystać swoje kompetencje*:
                <textarea
                  name="competence"
                  value={formData.competence}
                  onChange={handleChange}
                  placeholder="Opisz swoje podejście i doświadczenie..."
                  required
                />
              </label>
            </div>
          </div>

          <div className="form-buttons">
            <a href="/" className="back-link">
              ← Powrót
            </a>
            <button type="submit" className="apply-btn">
              Aplikuj
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default JobApplication;
