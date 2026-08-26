import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/useAuthStore';
import styles from './Login.module.css';

const loginSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);
      const res: any = await authService.login(data.userId, data.password);
      if (res.success) {
        setAuth(res.data.token, res.data.user);
        navigate('/dashboard');
      } else {
        setError('Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.graphicSection}>
          <div className={styles.graphicPlaceholder}>
            {/* Using an SVG placeholder matching Figma aesthetic */}
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
               <rect x="50" y="50" width="100" height="100" rx="10" fill="#E2E8F0" />
               <path d="M70 120H130M70 100H100" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className={styles.formSection}>
          <div className={styles.logo}>
            <span className={styles.logoBlue}>Prep</span>
            <span className={styles.logoDark}>route</span>
          </div>
          <h1 className={styles.title}>Login</h1>
          <p className={styles.subtitle}>Use your company provided Login credentials</p>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <Input
              label="User ID"
              placeholder="Enter User ID"
              {...register('userId')}
              error={errors.userId?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter Password"
              {...register('password')}
              error={errors.password?.message}
            />

            <div className={styles.forgotPassword}>
              <a href="#">Forgot password?</a>
            </div>

            <Button type="submit" variant="primary" className={styles.submitBtn} isLoading={isLoading}>
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
