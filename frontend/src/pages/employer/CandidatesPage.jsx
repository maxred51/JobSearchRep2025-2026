import React, { useEffect, useState } from "react";
import "../../styles/employer/CandidatesPage.css";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import Header from "../../components/Header";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assignments, setAssignments] = useState([]); 
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");

        const [resCandidates, resCategories, resLinks] = await Promise.all([
          axios.get("http://localhost:5000/api/kandydat", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/kategoriakandydata", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/kandydat_kategoriakandydata", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCandidates(resCandidates.data);
        setCategories(resCategories.data);
        setAssignments(resLinks.data);
      } catch (error) {
        console.error("❌ Błąd przy pobieraniu danych:", error);
      }
    };

    fetchAll();
  }, []);

  const getCandidateCategoryId = (candidateId) => {
    const link = assignments.find((a) => a.Kandydatid === candidateId);
    return link ? link.KategoriaKandydataid : "";
  };

  const handleCategoryChange = async (Kandydatid, newKategoriaId) => {
    try {
      const token = localStorage.getItem("token");
      const current = assignments.find((a) => a.Kandydatid === Kandydatid);

      if (current) {
        await axios.put(
          `http://localhost:5000/api/kandydat_kategoriakandydata/${Kandydatid}`,
          { KategoriaKandydataid: newKategoriaId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `http://localhost:5000/api/kandydat_kategoriakandydata`,
          { Kandydatid, KategoriaKandydataid: newKategoriaId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setAssignments((prev) => {
        const filtered = prev.filter((a) => a.Kandydatid !== Kandydatid);
        return [...filtered, { Kandydatid, KategoriaKandydataid: parseInt(newKategoriaId) }];
      });
    } catch (error) {
      console.error("❌ Błąd przy aktualizacji kategorii:", error);
      alert(error.response?.data?.error || "Nie udało się zmienić kategorii");
    }
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.imie?.toLowerCase().includes(search.toLowerCase()) ||
      c.nazwisko?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="employee-layout">
      <Header />
      <div className="employee-content">
        <EmployeeSidebar />

        <main className="employee-main">
          <section className="candidates-section">
            <h2>Kandydaci</h2>

            <div className="filters">
              <input
                type="text"
                placeholder="🔍 Szukaj..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <table className="candidates-table">
              <thead>
                <tr>
                  <th>Imię</th>
                  <th>Nazwisko</th>
                  <th>E-mail</th>
                  <th>Kategoria</th>
                  <th>Opcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((c) => (
                  <tr key={c.id}>
                    <td>{c.imie}</td>
                    <td>{c.nazwisko}</td>
                    <td>{c.email}</td>
                    <td>
                      <select
                        value={getCandidateCategoryId(c.id) || ""}
                        onChange={(e) =>
                          handleCategoryChange(c.id, e.target.value)
                        }
                      >
                        <option value="">Brak kategorii</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nazwa}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="options">
                      <Link to={`/candidatecv/${c.id}`} title="Podgląd">
                        <FaEye className="icon" />
                      </Link>

                      <Link to={`/candidatechat/${c.id}`} title="Edytuj">
                        <FaEdit className="icon" />
                      </Link>

                      <FaTrash
                        className="icon"
                        title="Usuń przypisanie"
                        onClick={async () => {
                          const current = assignments.find(
                            (a) => a.Kandydatid === c.id
                          );
                          if (!current) return;
                          if (!window.confirm("Usunąć przypisanie kategorii?"))
                            return;
                          try {
                            const token = localStorage.getItem("token");
                            await axios.delete(
                              `/api/kandydat-kategoria/${c.id}/${current.KategoriaKandydataid}`,
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            setAssignments((prev) =>
                              prev.filter((a) => a.Kandydatid !== c.id)
                            );
                          } catch (err) {
                            console.log(err);
                            alert("Nie udało się usunąć przypisania");
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
};

export default CandidatesPage;
