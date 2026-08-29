import React, { forwardRef } from 'react';
import styles from './Select.module.css';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        {label && <label className={styles.label}>{label}</label>}
        <select
          ref={ref}
          className={`${styles.select} ${error ? styles.selectError : ''}`}
          required
          {...props}
        >
          <option value="" disabled hidden>{props.placeholder || 'Choose from Drop-down'}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
