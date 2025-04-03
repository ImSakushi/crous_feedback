import React from 'react';
import styles from './FormSection.module.css';

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, icon, subtitle, children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={styles.iconContainer}>{icon}</div>
        <h2 className={styles.title}>{title}</h2>
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default FormSection;
