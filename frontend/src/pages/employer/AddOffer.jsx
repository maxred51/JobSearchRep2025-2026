import React, { useState } from "react";
import "../../styles/employer/addOffer.css";
import axios from "axios";

import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";

export default function AddOffer() {
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

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Brak tokena — zaloguj się ponownie.");
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/oferta",
        {
          tytuł: form.title,
          opis: form.description,
          wynagrodzenie: parseFloat(form.salary),
          wymagania: form.requirements,
          lokalizacja: form.location,
          czas: parseInt(form.workTime),
          KategoriaPracyid: parseInt(form.category),
          dodatkowe: {
            stanowisko: form.position,
            poziomJunior: form.levelJunior,
            poziomSenior: form.levelSenior,
            pelnyEtat: form.fullTime,
            czescEtatu: form.partTime,
            stacjonarna: form.stationary,
            zdalna: form.remote,
            umowaPraca: form.contractEmployment,
            umowaB2B: form.contractB2B,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 201) {
        alert("Oferta została dodana ✅");
        setForm({
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
      }
    } catch (error) {
      console.error(error);
      if (error.response?.data?.error) {
        alert(`Błąd: ${error.response.data.error}`);
      } else {
        alert("Nie udało się dodać oferty (błąd połączenia z serwerem)");
      }
    }
  };

  return (
    <div className="employee-layout">
      <EmployeeHeader />

      <div className="employee-content">
        <EmployeeSidebar />

        <main className="employee-main">
          <section className="add-offer-section">
            <a href="/employee" className="back-link">← Powrót</a>
            <h2>Dodawanie nowej oferty</h2>

            <form className="add-offer-form" onSubmit={handleSubmit}>
              <div className="form-card">
                <label>
                  Tytuł oferty:
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    type="text"
                    placeholder="Tytuł oferty"
                  />
                </label>

                <label>
                  Opis:
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Opis stanowiska"
                  />
                </label>

                <label>
                  Wynagrodzenie:
                  <input
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    type="number"
                    placeholder="np. 4000"
                  />
                </label>

                <label>
                  Wymagania:
                  <textarea
                    name="requirements"
                    value={form.requirements}
                    onChange={handleChange}
                    placeholder="Wymagania"
                  />
                </label>

                <label>
                  Lokalizacja:
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    type="text"
                  />
                </label>

                <label>
                  Czas pracy (w dniach):
                  <input
                    name="workTime"
                    value={form.workTime}
                    onChange={handleChange}
                    type="number"
                  />
                </label>

                <label>
                  Kategoria pracy (ID):
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    type="number"
                  />
                </label>

                <label>
                  Stanowisko:
                  <input
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    type="text"
                  />
                </label>

                <div className="checkbox-row">
                  <div className="checkbox-group">
                    <div className="group-title">Poziom stanowiska</div>
                    <label>
                      <input
                        type="checkbox"
                        name="levelJunior"
                        checked={form.levelJunior}
                        onChange={handleChange}
                      /> Junior
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="levelSenior"
                        checked={form.levelSenior}
                        onChange={handleChange}
                      /> Senior
                    </label>
                  </div>

                  <div className="checkbox-group">
                    <div className="group-title">Wymiar pracy</div>
                    <label>
                      <input
                        type="checkbox"
                        name="fullTime"
                        checked={form.fullTime}
                        onChange={handleChange}
                      /> Pełny etat
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="partTime"
                        checked={form.partTime}
                        onChange={handleChange}
                      /> Część etatu
                    </label>
                  </div>

                  <div className="checkbox-group">
                    <div className="group-title">Tryb pracy</div>
                    <label>
                      <input
                        type="checkbox"
                        name="stationary"
                        checked={form.stationary}
                        onChange={handleChange}
                      /> Stacjonarna
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="remote"
                        checked={form.remote}
                        onChange={handleChange}
                      /> Zdalna
                    </label>
                  </div>

                  <div className="checkbox-group">
                    <div className="group-title">Umowa</div>
                    <label>
                      <input
                        type="checkbox"
                        name="contractEmployment"
                        checked={form.contractEmployment}
                        onChange={handleChange}
                      /> Umowa o pracę
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="contractB2B"
                        checked={form.contractB2B}
                        onChange={handleChange}
                      /> B2B
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-add">Dodaj</button>
                </div>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
