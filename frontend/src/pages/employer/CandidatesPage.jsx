import React from "react";
import "../../styles/employer/CandidatesPage.css";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import Header from "../../components/Header";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";

const CandidatesPage = () => {
  const candidates = [
    {
      id: 1,
      firstName: "Adam",
      lastName: "Nowak",
      email: "an@email.com",
      category: "W przyszłości",
    },
  ];

  return (
    <div className="employee-layout">
      <Header />

      <div className="employee-content">
        <EmployeeSidebar />

        <main className="employee-main">
          <section className="candidates-section">
            <h2>Kandydaci</h2>

            <div className="filters">
              <input type="text" placeholder="🔍 Szukaj..." />
              <select>
                <option>Sortuj</option>
                <option>Alfabetycznie</option>
              </select>
              <select>
                <option>Stanowisko</option>
              </select>
              <select>
                <option>Kategoria</option>
              </select>
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
                {candidates.map((c) => (
                  <tr key={c.id}>
                    <td>{c.firstName}</td>
                    <td>{c.lastName}</td>
                    <td>{c.email}</td>
                    <td>
                      <select defaultValue={c.category}>
                        <option>W przyszłości</option>
                        <option>Odrzuceni</option>
                        <option>Do kontaktu</option>
                      </select>
                    </td>
                    <td className="options">
                      <Link to="/candidatecv" title="Podgląd">
                        <FaEye className="icon" />
                      </Link>

                      <Link to="/candidatechat" title="Edytuj">
                        <FaEdit className="icon" />
                      </Link>
                      <FaTrash className="icon" title="Usuń" />
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
