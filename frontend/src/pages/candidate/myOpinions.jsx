import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/candidate/myOpinions.css";
import CandidateSidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function MyOpinions() {
  const [opinions, setOpinions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOpinions = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get("http://localhost:5000/api/opinie", { headers });
        setOpinions(response.data || []);
      } catch (err) {
        console.error("Błąd podczas pobierania opinii:", err);
        setError("Nie udało się pobrać opinii.");
      } finally {
        setLoading(false);
      }
    };
    fetchOpinions();
  }, []);

  const handleUpdate = async (firmaId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(
        `http://localhost:5000/api/opinie/${firmaId}`,
        { tresc: newContent },
        { headers }
      );

      setOpinions((prev) =>
        prev.map((op) =>
          op.Firmaid === firmaId ? { ...op, tresc: newContent } : op
        )
      );

      setEditingId(null);
      setNewContent("");
    } catch (err) {
      console.error("Błąd przy aktualizacji opinii:", err);
      alert(err.response?.data?.error || "Nie udało się zaktualizować opinii.");
    }
  };

  if (loading) return <p>Ładowanie opinii...</p>;

  return (
    <div className="dashboard">
      <Header />

      <div className="dashboard-content">
        <CandidateSidebar active="opinions" />

        <main className="main-content">
          <section className="opinions-content">
            <h2>Moje Opinie</h2>

            {error && <p className="error">{error}</p>}

            {opinions.length === 0 ? (
              <p>Nie masz jeszcze żadnych opinii.</p>
            ) : (
              opinions.map((opinion) => (
                <div className="opinion" key={opinion.Firmaid}>
                  <div className="opinion-header">
                    <p><b>{opinion.nazwa_firmy}</b></p>
                    {editingId === opinion.Firmaid ? (
                      <button
                        className="cancel-btn"
                        onClick={() => setEditingId(null)}
                      >
                        Anuluj
                      </button>
                    ) : (
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingId(opinion.Firmaid);
                          setNewContent(opinion.tresc || "");
                        }}
                      >
                        Edytuj
                      </button>
                    )}
                  </div>

                  {editingId === opinion.Firmaid ? (
                    <div className="edit-form">
                      <textarea
                        value={newContent}
                        maxLength={80}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Wpisz nową treść opinii (max 80 znaków)"
                      />
                      <button
                        className="save-btn"
                        onClick={() => handleUpdate(opinion.Firmaid)}
                      >
                        Zapisz
                      </button>
                    </div>
                  ) : (
                    <p>{opinion.tresc || "Brak treści opinii"}</p>
                  )}
                </div>
              ))
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
