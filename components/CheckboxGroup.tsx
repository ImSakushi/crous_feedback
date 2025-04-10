// components/CheckboxGroup.tsx
import React from 'react';
import styles from './CheckboxGroup.module.css';

interface CheckboxGroupProps {
  options: string[];
  selected: string[]; // Sélection multiple
  onSelect: (newSelected: string[]) => void;
  customValue: string;
  onCustomChange: (value: string) => void;
  label: string;
  className?: string; // Propriété optionnelle ajoutée
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  selected,
  onSelect,
  customValue,
  onCustomChange,
  label,
  className,
}) => {
  // Fonction pour basculer la sélection d'une option
  const handleOptionClick = (option: string) => {
    if (selected.includes(option)) {
      onSelect(selected.filter(item => item !== option));
    } else {
      onSelect([...selected, option]);
    }
  };

  // Gérer le changement de l'input personnalisé pour "Autre"
  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onCustomChange(value);
    // Si "other" n'est pas encore sélectionné, l'ajouter
    if (!selected.includes("other")) {
      onSelect([...selected, "other"]);
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {label && <p>{label}</p>}
      {options.map((option, index) => (
        <div
          key={index}
          className={styles.option}
          onClick={() => handleOptionClick(option)}
        >
          <input
            type="checkbox"
            readOnly
            checked={selected.includes(option)}
            // Ajout de la classe CSS "radioInput" déjà définie dans app/page.module.css
            className={styles.radioButton}
          />
          <span>{option}</span>
        </div>
      ))}
      <div
        className={styles.option}
        onClick={() => handleOptionClick("other")}
      >
        <input
          type="checkbox"
          readOnly
          checked={selected.includes("other")}
          className={styles.radioButton}
        />
        <input
          type="text"
          placeholder="Autre"
          value={customValue}
          onChange={handleOtherInputChange}
          className={styles.radioInput}
        />
      </div>
    </div>
  );
};

export default CheckboxGroup;