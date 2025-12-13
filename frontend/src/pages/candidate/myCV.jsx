import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/candidate/myCV.css";
import CandidateSidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function MyCV() {
  const [cvLink, setCvLink] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCv();
  }, []);

  async function fetchCv() {
    try {
      const res = await axios.get(`http://localhost:5000/api/kandydat/${getUserId()}/cv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCvLink(res.data.cv_path);
    } catch (err) {
      setCvLink(null); 
    }
  }

  function getUserId() {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  }

  async function uploadCv(e) {
    e.preventDefault();
    if (!selectedFile) return alert("Wybierz plik!");

    const formData = new FormData();
    formData.append("cv", selectedFile);

    try {
      await axios.put("http://localhost:5000/api/kandydat/cv", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("CV zapisane!");
      fetchCv(); 
    } catch (err) {
      alert("Błąd przy zapisie CV");
    }
  }

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-content">
        <CandidateSidebar active="cv" />

        <main className="main-content">
          <section className="cv-content">
            <h2>Moje CV</h2>

            <form onSubmit={uploadCv} className="cv-upload-form">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <button type="submit">Zapisz CV</button>
            </form>

            {cvLink ? (
              <a
                className="download-cv"
                href={`http://localhost:5000${cvLink}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pobierz aktualne CV
              </a>
            ) : (
              <p className="no-cv">Nie przesłałeś jeszcze CV</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
