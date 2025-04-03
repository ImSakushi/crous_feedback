import React from 'react';
import styles from './RadioOption.module.css';

interface RadioOptionProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

const RadioOption: React.FC<RadioOptionProps> = ({ label, selected, onSelect }) => {
  return (
    <div 
      className={`${styles.radioOption} ${selected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      <div className={styles.radioButton}>
        {selected && <div className={styles.radioInner} />}
      </div>
      <span className={styles.radioLabel}>{label}</span>
    </div>
  );
};

export default RadioOption;
