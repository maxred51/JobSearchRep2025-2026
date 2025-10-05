import React, { useState } from "react";
import "../../styles/private/accountSettings.css";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";

function AccountSettings() {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    navigate("/login");
  };

  return (
    <div className="dashboard-wrapper">

      <div className="dashboard-content">

        <main className="settings-section">
          <div className="settings-header">
            <h2>Ustawienia konta</h2>
            <a href="/" className="home-link">← Powrót na stronę główną</a>
          </div>

          <section className="account-info">
            <h3>Dane konta</h3>
            <div className="info-fields">
              <p><b>Imię:</b> lorem</p>
              <p><b>Nazwisko:</b> lorem</p>
              <p><b>E-mail:</b> lorem</p>
              <p><b>Telefon:</b> lorem</p>
              <p><b>Rola:</b> lorem</p>
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

            <form className="edit-form">
              <input type="text" placeholder="Imię: lorem" />
              <input type="text" placeholder="Nazwisko: lorem" />
              <input type="email" placeholder="E-mail: lorem" />
              <input type="text" placeholder="Telefon: lorem" />
              <button type="submit" className="edit-btn">Edytuj konto</button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AccountSettings;
