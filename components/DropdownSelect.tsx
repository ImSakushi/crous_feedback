import React from 'react';
import styles from './DropdownSelect.module.css';

interface DropdownSelectProps {
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Sélectionnez une option" 
}) => {
  return (
    <div className={styles.container}>
      <select 
        className={styles.select}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownSelect; 