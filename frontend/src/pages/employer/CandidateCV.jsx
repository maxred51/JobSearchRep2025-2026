import React from "react";
import { useNavigate } from "react-router-dom";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/CandidateCV.css";

export default function CandidateCV() {
  const navigate = useNavigate();

  const candidate = {
    firstName: "Adam",
    lastName: "Nowak",
    email: "an@email.com",
    phone: "+48 555 555 555",
    birthDate: "23.01.1990",
    city: "Warszawa",
    experience: [
      { id: 1, company: "ABC Logistics", position: "Magazynier", years: "2018–2022" },
      { id: 2, company: "TransPol", position: "Kierowca", years: "2015–2018" },
    ],
    education: [
      { id: 1, school: "Politechnika Warszawska", degree: "Inżynier Logistyki", years: "2011–2015" },
    ],
    languages: ["Angielski – B2", "Niemiecki – A2"],
    skills: ["Obsługa wózka widłowego", "Planowanie dostaw", "Excel", "Prawo jazdy kat. B"],
    interests: ["Podróże", "Motoryzacja", "Nowe technologie"],
  };

  const handleBack = () => {
    navigate("/candidates");
  };

  return (
    <div className="candidate-cv-page">
      <EmployeeHeader />

      <div className="candidate-cv-content">
        <EmployeeSidebar />

        <main className="candidate-cv-main">
          <section className="cv-section">
            <button className="back-btn" onClick={handleBack}>
              ← Powrót
            </button>

            <div className="cv-card">
              <div className="cv-header">
                <div className="cv-photo" />
                <div className="cv-info">
                  <h2>CV Kandydata</h2>
                  <h3>
                    {candidate.firstName} {candidate.lastName}
                  </h3>
                  <p><strong>E-mail:</strong> {candidate.email}</p>
                  <p><strong>Telefon:</strong> {candidate.phone}</p>
                  <p><strong>Data urodzenia:</strong> {candidate.birthDate}</p>
                  <p><strong>Miasto:</strong> {candidate.city}</p>
                </div>
              </div>

              <div className="cv-block">
                <h4>Doświadczenie zawodowe</h4>
                <ul>
                  {candidate.experience.map((exp) => (
                    <li key={exp.id}>
                      <strong>{exp.position}</strong> – {exp.company} ({exp.years})
                    </li>
                  ))}
                </ul>
              </div>

              <div className="cv-block">
                <h4>Wykształcenie</h4>
                <ul>
                  {candidate.education.map((edu) => (
                    <li key={edu.id}>
                      <strong>{edu.school}</strong> – {edu.degree} ({edu.years})
                    </li>
                  ))}
                </ul>
              </div>

              <div className="cv-block">
                <h4>Znajomość języków</h4>
                <ul>
                  {candidate.languages.map((lang, index) => (
                    <li key={index}>{lang}</li>
                  ))}
                </ul>
              </div>

              <div className="cv-block">
                <h4>Umiejętności</h4>
                <ul>
                  {candidate.skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </div>

              <div className="cv-block">
                <h4>Zainteresowania</h4>
                <ul>
                  {candidate.interests.map((interest, index) => (
                    <li key={index}>{interest}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
