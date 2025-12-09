import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/candidate/JobApplication.css";
import Header from "../../components/Header";
import { useParams } from "react-router-dom";

function JobApplication() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    salary: "",
    competence: "",
    consent: false,
  });

  const [errors, setErrors] = useState({
    salary: "",
    competence: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        const userId = payload.id;

        const res = await axios.get(
          `http://localhost:5000/api/kandydat/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { imie, nazwisko, email, telefon } = res.data;
        setFormData((prev) => ({
          ...prev,
          firstName: imie || "",
          lastName: nazwisko || "",
          email: email || "",
          phone: telefon || "",
        }));
      } catch (err) {
        console.error("Błąd przy pobieraniu profilu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const validateField = (name, value) => {
    let error = "";

    if (name === "salary") {
      if (!/^[0-9]+$/.test(value)) {
        error = "Oczekiwania finansowe muszą być liczbą dodatnią.";
      }
    }

    if (name === "competence") {
      if (value.trim().length == 0) {
        error = "Opis kompetencji musi być niepustym ciągiem znaków";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return error === "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));

    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const validSalary = validateField("salary", formData.salary);
    const validCompetence = validateField("competence", formData.competence);

    if (!validSalary || !validCompetence) {
      setSubmitting(false);
      setMessage("Popraw błędy w formularzu.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Musisz być zalogowany, aby aplikować.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        Ofertaid: id,
        kwota: parseFloat(formData.salary),
        odpowiedz: formData.competence,
      };

      await axios.post("http://localhost:5000/api/aplikacja", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/");
    } catch (err) {
      console.error(
        "Błąd przy wysyłaniu aplikacji:",
        err.response?.data || err
      );
      setMessage(
        err.response?.data?.error || "Nie udało się wysłać aplikacji."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Ładowanie danych użytkownika...</p>;

  return (
    <div className="application-page">
      <Header />

      <main className="application-container">
        <h2 className="form-title">Formularz aplikacyjny</h2>

        {message && <p className="form-message">{message}</p>}

        <form className="application-form" onSubmit={handleSubmit}>
          <div className="form-columns">
            <div className="form-left">
              <label>
                Imię*:
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  readOnly
                  required
                />
              </label>

              <label>
                Nazwisko*:
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  readOnly
                  required
                />
              </label>

              <label>
                E-mail*:
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  required
                />
              </label>

              <label>
                Telefon:
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  readOnly
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
                  placeholder="np. 7000"
                  required
                />
                {errors.salary && <p className="error-msg">{errors.salary}</p>}
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
                {errors.competence && (
                  <p className="error-msg">{errors.competence}</p>
                )}
              </label>
            </div>
          </div>

          <div className="form-buttons">
            <a href="/" className="back-link">
              ← Powrót
            </a>
            <button type="submit" className="apply-btn" disabled={submitting}>
              {submitting ? "Wysyłanie..." : "Aplikuj"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default JobApplication;
