import React, { useState, useEffect } from "react";
import "../../styles/employer/editOffer.css";
import Header from "../../components/Header";
import { useParams } from "react-router-dom";
import EmployeeSidebar from "../../components/EmployeeSidebar";

export default function EditOffer() {
  const { id } = useParams();

  const [form, setForm] = useState({
    title: "",
    description: "",
    salary: "",
    requirements: "",
    location: "",
    workTime: "",
    category: "",
    position: "",
    levelJunior: false,
    levelSenior: false,
    fullTime: false,
    partTime: false,
    stationary: false,
    remote: false,
    contractEmployment: false,
    contractB2B: false,
  });

  useEffect(() => {
    const fakeOffer = {
      title: "Logistyk",
      description: "Obsługa magazynu i dokumentacji logistycznej.",
      salary: "5000-7000 PLN",
      requirements: "Doświadczenie 2 lata, znajomość SAP.",
      location: "Warszawa",
      workTime: "Pełny etat",
      category: "Logistyka",
      position: "Specjalista",
      levelJunior: false,
      levelSenior: true,
      fullTime: true,
      partTime: false,
      stationary: true,
      remote: false,
      contractEmployment: true,
      contractB2B: false,
    };
    setForm(fakeOffer);
  }, [id]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Edytowana oferta:", form);
    alert("Oferta została zaktualizowana (symulacja).");
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
                Czas pracy:
                <input name="workTime" value={form.workTime} onChange={handleChange} type="text" />
              </label>

              <label>
                Kategoria pracy:
                <input name="category" value={form.category} onChange={handleChange} type="text" />
              </label>

              <label>
                Stanowisko:
                <input name="position" value={form.position} onChange={handleChange} type="text" />
              </label>

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
