import React, { useState, useEffect } from "react";
import "../../styles/private/accountSettings.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AccountSettings() {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({
    imie: "",
    nazwisko: "",
    email: "",
    telefon: "",
    rola: "",
    plec: "M",
    
  });
  const navigate = useNavigate();

  const detectRole = () => {
    const storedRole = localStorage.getItem("rola");
    if (storedRole) return storedRole.toLowerCase();
    return "kandydat"; 
  };

  const [role] = useState(detectRole);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          console.error("Brak userId lub tokena");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/${role}/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { imie, nazwisko, email, telefon, plec, rola, Firmaid } = response.data;

        setFormData({
          imie: imie ?? "",
          nazwisko: nazwisko ?? "",
          email: email ?? "",
          telefon: telefon ?? "",
          plec: plec ?? "M",
          rola: rola ?? role,
          Firmaid: Firmaid ?? 0
        });
      } catch (error) {
        console.error("Błąd pobierania danych użytkownika:", error);
      }
    };

    fetchUserData();
  }, [role, navigate]);

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/${role}/${userId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Dane zostały zaktualizowane!");
    } catch (err) {
      console.error("Błąd edycji danych:", err);
      alert("Wystąpił błąd podczas edycji.");
    }
  };

  const handleDelete = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        alert("Nie jesteś zalogowany!");
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/api/${role}/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message || "Konto zostało usunięte.");
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Błąd usuwania konta:", error);
      alert("Wystąpił błąd podczas usuwania konta.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">
        <main className="settings-section">
          <div className="settings-header">
          <h2>Ustawienia konta</h2>
          <button
            className="home-link"
            onClick={() => {
              if (role === "admin") navigate("/admin");
              else if (role === "pracownikhr") navigate("/employee");
              else navigate("/");
            }}
          >
            ← Powrót na stronę główną
          </button>
        </div>


          <section className="account-info">
            <h3>Dane konta</h3>
            <div className="info-fields">
              <p><b>Imię:</b> {formData.imie}</p>
              <p><b>Nazwisko:</b> {formData.nazwisko}</p>
              <p><b>E-mail:</b> {formData.email}</p>
              <p><b>Telefon:</b> {formData.telefon}</p>
              <p><b>Rola:</b> {formData.rola}</p>
            </div>

            <label className="accessibility-mode">
              <input type="checkbox" /> Tryb dla słabowidzących
            </label>

            <div className="delete-account">
              <label className="delete-label">
                <input
                  type="checkbox"
                  checked={confirmDelete}
                  onChange={() => setConfirmDelete(!confirmDelete)}
                />
                Wciśnij, aby potwierdzić usunięcie konta
              </label>

              {confirmDelete && (
                <button className="delete-btn" onClick={handleDelete}>
                  Usuń konto
                </button>
              )}
            </div>
          </section>

          <section className="edit-account">
            <h3>Edytuj dane konta</h3>
            <p>
              Aby zaktualizować dane, wprowadź zmiany w polach poniżej, a następnie kliknij{" "}
              <strong>"Edytuj konto"</strong>.
            </p>

            <form className="edit-form" onSubmit={handleEdit}>
              <input
                type="text"
                name="imie"
                value={formData.imie}
                onChange={handleChange}
                placeholder="Imię"
              />
              <input
                type="text"
                name="nazwisko"
                value={formData.nazwisko}
                onChange={handleChange}
                placeholder="Nazwisko"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="E-mail"
              />
              <input
                type="text"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                placeholder="Telefon"
              />

              <button type="submit" className="edit-btn">
                Edytuj konto
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AccountSettings;
