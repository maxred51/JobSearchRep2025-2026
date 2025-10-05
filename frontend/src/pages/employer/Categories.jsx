import React from "react";
import { useNavigate } from "react-router-dom";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/Categories.css";

export default function Categories() {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: "Logistyka", candidates: 8 },
    { id: 2, name: "IT", candidates: 5 },
    { id: 3, name: "Marketing", candidates: 3 },
  ];

  const handleAdd = () => {
    navigate("/employee/add-category");
  };

  const handleEdit = (id) => {
    navigate(`/employee/edit-category/${id}`);
  };

  return (
    <div className="categories-page">
      <EmployeeHeader />

      <div className="categories-content">
        <EmployeeSidebar />

        <main className="categories-main">
          <section className="content-section">
            <h2>Kategorie kandydatów</h2>

            <div className="categories-controls">
              <input
                type="text"
                placeholder="Szukaj kategorii..."
                className="search-input"
              />
              <select className="filter-select">
                <option>Sortuj</option>
                <option>Nazwa A–Z</option>
                <option>Nazwa Z–A</option>
                <option>Liczba kandydatów ↑</option>
                <option>Liczba kandydatów ↓</option>
              </select>
              <button className="add-btn" onClick={handleAdd}>
                ➕ Dodaj kategorię
              </button>
            </div>

            <table className="categories-table">
              <thead>
                <tr>
                  <th>Nazwa</th>
                  <th>Liczba kandydatów</th>
                  <th>Opcje</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.name}</td>
                    <td>{cat.candidates}</td>
                    <td className="options">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(cat.id)}
                      >
                        ✏️ Edytuj
                      </button>
                      <button className="delete-btn">🗑️ Usuń</button>
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
}
