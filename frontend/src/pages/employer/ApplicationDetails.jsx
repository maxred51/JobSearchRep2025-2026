import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/ApplicationDetails.css";

export default function ApplicationDetails() {
  const navigate = useNavigate();
  const { Kandydatid, Ofertaid } = useParams();
  const [application, setApplication] = useState({});

  const handleBack = () => {
    navigate("/applicationoverview");
  };

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:5000/api/aplikacja/${Kandydatid}/${Ofertaid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplication(data);
      } catch (error) {
        console.error("Błąd podczas pobierania aplikacji:", error);
        alert(error.response?.data?.error || "Nie udało się pobrać aplikacji");
      }
    };

    fetchApplication();
  }, [Kandydatid, Ofertaid]);

  return (
    <div className="app-page">
      <EmployeeHeader />

      <div className="page-body">
        <aside className="left-sidebar">
          <EmployeeSidebar />
        </aside>

        <main className="content-area">
          <div className="application-details">
            <button className="back-btn" onClick={handleBack}>
              ← Powrót
            </button>

            <h2 className="page-title">Treść aplikacji kandydata</h2>

            <div className="application-box">
              <p><strong>Imię:</strong> {application.imie}</p>
              <p><strong>Nazwisko:</strong> {application.nazwisko}</p>
              <p><strong>Telefon:</strong> {application.telefon}</p>
              <p><strong>E-mail:</strong> {application.email}</p>

              <p><strong>Stanowisko:</strong> {application.stanowisko}</p>
              <p><strong>Oczekiwania finansowe:</strong> {application.kwota} PLN</p>
              <p><strong>Status aplikacji:</strong> {application.status}</p>

              <p><strong>Odpowiedź pracodawcy:</strong></p>
              <p className="application-text">
                {application.odpowiedz || "Brak odpowiedzi"}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
