import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!);

    const handleIncrement = () => {
      if (inputRef.current) {
        inputRef.current.stepUp();
        inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    const handleDecrement = () => {
      if (inputRef.current) {
        inputRef.current.stepDown();
        inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    return (
      <div className={`${styles.container} ${className || ''}`}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputWrapper}>
          <input 
            ref={inputRef} 
            className={`${styles.input} ${error ? styles.inputError : ''}`} 
            {...props} 
          />
          {props.type === 'number' && (
            <div className={styles.spinnerContainer}>
              <button type="button" tabIndex={-1} className={styles.spinnerButton} onClick={handleIncrement}>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L5 1L9 5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button type="button" tabIndex={-1} className={styles.spinnerButton} onClick={handleDecrement}>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}
        </div>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
