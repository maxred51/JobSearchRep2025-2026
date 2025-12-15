import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
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
          headers: { Authorization: `Bearer ${token}` },
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
          headers: { Authorization: `Bearer ${token}` },
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

  const downloadCv = async () => {
    if (!cvPath) return;

    try {
      const res = await axios.get(cvPath, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "cv.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Błąd przy pobieraniu CV:", err);
    }
  };

  if (loading || !candidate) return <div>Ładowanie danych...</div>;

  return (
    <div className="candidate-cv-page">
      <EmployeeHeader />

      <div className="candidate-cv-content">
        <EmployeeSidebar active="candidates" />

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
                  <button className="download-btn" onClick={downloadCv}>
                    Pobierz CV
                  </button>
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
