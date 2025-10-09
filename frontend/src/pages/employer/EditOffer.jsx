import React, { useState, useEffect } from "react";
import "../../styles/employer/editOffer.css";
import Header from "../../components/Header";
import { useParams } from "react-router-dom";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import axios from "axios";

export default function EditOffer() {
  const { id } = useParams();

  const [form, setForm] = useState({
    title: "",
    description: "",
    salary: "",
    requirements: "",
    location: "",
    workTime: "",
    category: "", // oczekujemy tu ID kategorii (liczba jako string)
    position: "",
    levelJunior: false,
    levelSenior: false,
    fullTime: false,
    partTime: false,
    stationary: false,
    remote: false,
    contractEmployment: false,
    contractB2B: false,
    active: true,
  });

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Brak tokena w localStorage");
          return;
        }

        const res = await axios.get(`http://localhost:5000/api/oferta/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const d = res.data;
        // mapujemy odpowiedź backendu na pola formularza
        setForm({
          title: d.tytul ?? "",
          description: d.opis ?? "",
          salary: d.wynagrodzenie !== undefined ? String(d.wynagrodzenie) : "",
          requirements: d.wymagania ?? "",
          location: d.lokalizacja ?? "",
          workTime: d.czas !== undefined ? String(d.czas) : "",
          category: d.KategoriaPracyid !== undefined ? String(d.KategoriaPracyid) : "",
          position: d.stanowisko ?? "",
          // Jeśli backend przechowuje te flagi pod innymi nazwami, zmień mapowanie
          levelJunior: !!d.poziomJunior,
          levelSenior: !!d.poziomSenior,
          fullTime: !!d.pelnyEtat,
          partTime: !!d.czescEtatu,
          stationary: !!d.stacjonarna,
          remote: !!d.zdalna,
          contractEmployment: !!d.umowaPraca,
          contractB2B: !!d.umowaB2B,
          active: d.aktywna === undefined ? true : !!d.aktywna,
        });
      } catch (err) {
        console.error("❌ Błąd pobierania oferty:", err.response?.data || err);
      }
    };

    fetchOffer();
  }, [id]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // WALIDACJA przed wysłaniem (te same zabezpieczenia co backend - szybka weryfikacja po stronie klienta)
    if (!form.title || !form.description || !form.salary || !form.location || !form.workTime || !form.category) {
      alert("Uzupełnij wszystkie wymagane pola: tytuł, opis, wynagrodzenie, lokalizacja, czas, kategoria (ID).");
      return;
    }

    const wynagrodzenieNum = Number(form.salary);
    if (Number.isNaN(wynagrodzenieNum) || wynagrodzenieNum <= 0) {
      alert("Wynagrodzenie musi być liczbą dodatnią (np. 5000.00).");
      return;
    }

    const czasInt = parseInt(form.workTime, 10);
    if (Number.isNaN(czasInt) || czasInt <= 0) {
      alert("Czas pracy musi być liczbą całkowitą dodatnią.");
      return;
    }

    const kategoriaId = parseInt(form.category, 10);
    if (Number.isNaN(kategoriaId)) {
      alert("Kategoria pracy (ID) musi być liczbą całkowitą.");
      return;
    }

    // BUDOWANIE payload z nazwami wymaganymi przez backend (zwróć uwagę na 'tytuł' z polską literą)
    const payload = {
      ["tytuł"]: form.title,
      opis: form.description,
      wynagrodzenie: wynagrodzenieNum,
      wymagania: form.requirements || null,
      lokalizacja: form.location,
      czas: czasInt,
      KategoriaPracyid: kategoriaId,
      aktywna: !!form.active,
    };

    console.log("📤 Wysyłany payload:", payload);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Brak tokena - zaloguj się ponownie.");
        return;
      }

      const res = await axios.put(`http://localhost:5000/api/oferta/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Oferta została zaktualizowana ✅");
    } catch (err) {
      console.error("❌ Błąd przy edycji oferty:", err.response?.data || err);
      alert(err.response?.data?.error || "Wystąpił błąd przy aktualizacji oferty.");
    }
  };

  return (
    <div className="edit-offer-page">
      <Header />
      <div className="edit-offer-content">
        <EmployeeSidebar />

        <main className="edit-offer-main">
          <a href="/employee" className="back-link">← Powrót</a>
          <h2>Edytowanie oferty</h2>
          <form className="edit-offer-form" onSubmit={handleSubmit}>
            <div className="form-card">
              <label>
                Tytuł oferty:
                <input name="title" value={form.title} onChange={handleChange} type="text" />
              </label>

              <label>
                Opis:
                <textarea name="description" value={form.description} onChange={handleChange} />
              </label>

              <label>
                Wynagrodzenie:
                <input name="salary" value={form.salary} onChange={handleChange} type="text" />
              </label>

              <label>
                Wymagania:
                <textarea name="requirements" value={form.requirements} onChange={handleChange} />
              </label>

              <label>
                Lokalizacja:
                <input name="location" value={form.location} onChange={handleChange} type="text" />
              </label>

              <label>
                Czas pracy (liczba całkowita):
                <input name="workTime" value={form.workTime} onChange={handleChange} type="text" />
              </label>

              <label>
                Kategoria pracy (ID):
                <input name="category" value={form.category} onChange={handleChange} type="text" />
              </label>

              {/* reszta pól (checkboxy) */}
              <div className="checkbox-row">
                <div className="checkbox-group">
                  <div className="group-title">Poziom stanowiska</div>
                  <label>
                    <input type="checkbox" name="levelJunior" checked={form.levelJunior} onChange={handleChange} />
                    Junior
                  </label>
                  <label>
                    <input type="checkbox" name="levelSenior" checked={form.levelSenior} onChange={handleChange} />
                    Senior
                  </label>
                </div>

                <div className="checkbox-group">
                  <div className="group-title">Wymiar pracy</div>
                  <label>
                    <input type="checkbox" name="fullTime" checked={form.fullTime} onChange={handleChange} />
                    Pełny etat
                  </label>
                  <label>
                    <input type="checkbox" name="partTime" checked={form.partTime} onChange={handleChange} />
                    Część etatu
                  </label>
                </div>

                <div className="checkbox-group">
                  <div className="group-title">Tryb pracy</div>
                  <label>
                    <input type="checkbox" name="stationary" checked={form.stationary} onChange={handleChange} />
                    Stacjonarna
                  </label>
                  <label>
                    <input type="checkbox" name="remote" checked={form.remote} onChange={handleChange} />
                    Zdalna
                  </label>
                </div>

                <div className="checkbox-group">
                  <div className="group-title">Umowa</div>
                  <label>
                    <input type="checkbox" name="contractEmployment" checked={form.contractEmployment} onChange={handleChange} />
                    Umowa o pracę
                  </label>
                  <label>
                    <input type="checkbox" name="contractB2B" checked={form.contractB2B} onChange={handleChange} />
                    B2B
                  </label>
                </div>
              </div>

              <label>
                Aktywna:
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
              </label>

              <div className="form-actions">
                <button type="submit" className="btn-edit">Edytuj</button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
