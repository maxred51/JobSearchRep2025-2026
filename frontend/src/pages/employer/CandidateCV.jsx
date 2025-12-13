import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/CandidateCV.css";

export default function CandidateCV() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [candidate, setCandidate] = useState(null);
  const [cvPath, setCvPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorCV, setErrorCV] = useState(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/kandydat/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error("Brak dostępu lub kandydat nie istnieje");
        }

        const data = await res.json();
        setCandidate(data);
      } catch (err) {
        navigate("/candidates");
      }
    };

    const fetchCV = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/kandydat/${id}/cv`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          setErrorCV("CV nie istnieje lub brak uprawnień");
          return;
        }

        const data = await res.json();
        setCvPath("http://localhost:5000" + data.cv_path);
      } catch (err) {
        setErrorCV("Błąd ładowania CV");
      }
    };

    fetchCandidate();
    fetchCV();
    setLoading(false);
  }, [id, token, navigate]);

  const handleBack = () => navigate("/candidates");

  if (loading || !candidate) return <div>Ładowanie danych...</div>;

  return (
    <div className="candidate-cv-page">
      <EmployeeHeader />

      <div className="candidate-cv-content">
        <EmployeeSidebar />

        <main className="candidate-cv-main">
          <section className="cv-section">
            <button className="back-btn" onClick={handleBack}>← Powrót</button>

            <div className="cv-card">
              <div className="cv-header">     
                  <h2>CV Kandydata</h2>
              </div>
              <div className="cv-block">
                <h4>Plik CV</h4>
                {cvPath ? (
                  <a className="download-btn" href={cvPath} target="_blank" rel="noopener noreferrer">
                    Pobierz CV
                  </a>
                ) : (
                  <p className="no-cv">{errorCV}</p>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
