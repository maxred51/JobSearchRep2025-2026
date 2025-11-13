import React, { useEffect, useState } from "react";
import "../../styles/employer/CandidatesPage.css";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import EmployeeHeader from "../../components/EmployeeHeader";
import { FaEye, FaEdit } from "react-icons/fa";
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

      const [
        resCandidates,
        resCategories,
        resAssignments,
        resApplications,
        resOffers,
      ] = await Promise.all([
        axios.get("http://localhost:5000/api/kandydat", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/kategoriakandydata", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/kandydat_kategoriakandydata", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/aplikacja", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/oferta", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCategories(resCategories.data);
      setAssignments(resAssignments.data);

      console.log("Kandydaci:", resCandidates.data);
      console.log("Aplikacje:", resApplications.data);
      console.log("Oferty:", resOffers.data);
      

      const pracownikHRId = parseInt(localStorage.getItem("userId")); 

      const myOffers = resOffers.data.filter(
        (o) =>
          o.PracownikHRid === pracownikHRId || o.pracownikHRId === pracownikHRId
      );
      const myOfferIds = myOffers.map((o) => o.id);


      const candidatesWithApplications = resApplications.data
        .filter((app) => myOfferIds.includes(app.Ofertaid))
        .map((app) => app.Kandydatid);

      console.log("Kandydaci z aplikacją na moje oferty:", candidatesWithApplications);


      const filteredCandidates = resCandidates.data.filter((c) =>
        candidatesWithApplications.includes(c.id)
      );

      setCandidates(filteredCandidates);
    } catch (error) {
      console.error("Błąd przy pobieraniu danych:", error);
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
    const headers = { Authorization: `Bearer ${token}` };
    const current = assignments.find((a) => a.Kandydatid === Kandydatid);

    if (!newKategoriaId) {
      if (current) {
        const confirmDelete = window.confirm(
          "Czy na pewno chcesz usunąć kategorię przypisaną do tego kandydata?"
        );
        if (!confirmDelete) return;

        await axios.delete(
          `http://localhost:5000/api/kandydat_kategoriakandydata/${Kandydatid}/${current.KategoriaKandydataid}`,
          { headers }
        );

        setAssignments((prev) =>
          prev.filter((a) => a.Kandydatid !== Kandydatid)
        );

        alert("Kategoria została usunięta.");
      }
      return;
    }

    if (current) {
      await axios.put(
        `http://localhost:5000/api/kandydat_kategoriakandydata/${Kandydatid}`,
        { KategoriaKandydataid: newKategoriaId },
        { headers }
      );
    } else {
      await axios.post(
        `http://localhost:5000/api/kandydat_kategoriakandydata`,
        { Kandydatid, KategoriaKandydataid: newKategoriaId },
        { headers }
      );
    }

    setAssignments((prev) => {
      const filtered = prev.filter((a) => a.Kandydatid !== Kandydatid);
      return [
        ...filtered,
        { Kandydatid, KategoriaKandydataid: parseInt(newKategoriaId) },
      ];
    });

    alert("Kategoria została zmieniona.");
  } catch (error) {
    console.error("Błąd przy aktualizacji kategorii:", error);
    alert(error.response?.data?.error || "Nie udało się zmienić kategorii");
  }
};


  const submittedCategory = categories.find(
    (cat) => cat.nazwa?.toLowerCase() === "złożona aplikacja"
  );
  const submittedCategoryId = submittedCategory?.id;

  const filteredCandidates = candidates
    .filter(
      (c) =>
        c.imie?.toLowerCase().includes(search.toLowerCase()) ||
        c.nazwisko?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((c) => {
      const catId = getCandidateCategoryId(c.id);
      return catId !== submittedCategoryId; 
    });

  return (
    <div className="employee-layout">
      <EmployeeHeader />
      <div className="employee-content">
        <EmployeeSidebar />

        <main className="employee-main">
          <section className="candidates-section">
            <h2>Kandydaci</h2>

            <div className="filters">
              <input
                type="text"
                placeholder="Szukaj..."
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
