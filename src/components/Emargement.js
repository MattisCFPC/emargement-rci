// src/components/Emargement.js
import React, { useState } from 'react';

const Emargement = ({ rciName, students }) => {
  const [presence, setPresence] = useState(
    students.reduce((acc, student) => {
      acc[student] = false;
      return acc;
    }, {})
  );

  const togglePresence = (student) => {
    setPresence({
      ...presence,
      [student]: !presence[student],
    });
  };

  return (
    <div>
      <h2>Émargement pour : {rciName}</h2>
      <table>
        <thead>
          <tr>
            <th>Élève</th>
            <th>Présent</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index}>
              <td>{student}</td>
              <td>
                <input
                  type="checkbox"
                  checked={presence[student]}
                  onChange={() => togglePresence(student)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Vous pouvez ajouter un bouton pour sauvegarder les données ici */}
    </div>
  );
};

export default Emargement;
