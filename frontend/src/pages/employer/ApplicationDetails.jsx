import React from "react";
import { useNavigate } from "react-router-dom";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/ApplicationDetails.css";

export default function ApplicationDetails() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/applicationoverview"); 
  };

  return (
    <div className="app-page">
      <EmployeeHeader />

      <div className="page-body">
        <aside className="left-sidebar">
          <EmployeeSidebar />
        </aside>

        <main className="content-area">
          <div className="content-grid">
            <div className="left-col">
              <button className="back-btn" onClick={handleBack}>← Powrót</button>
              <h2 className="page-title">Treść aplikacji kandydata</h2>
            </div>

            <div className="right-col">
              <div className="application-box">
                <p><strong>Imię:</strong> Jan</p>
                <p><strong>Nazwisko:</strong> Kowalski</p>
                <p><strong>Telefon:</strong> 123-456-789</p>
                <p><strong>E-mail:</strong> jan.kowalski@example.com</p>

                <p><strong>Jak kandydat zamierza wykorzystać swoje kompetencje na stanowisku:</strong></p>
                <p className="application-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse pulvinar, 
                  metus at bibendum vehicula, purus nunc varius sapien...
                </p>

                <p><strong>Oczekiwania finansowe kandydata:</strong> 5000 PLN</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
