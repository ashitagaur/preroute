import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { testService } from '../../services/test.service';
import { useTestStore } from '../../store/useTestStore';
import { Test } from '../../types';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res: any = await testService.getAll();
      if (Array.isArray(res)) {
        setTests(res);
      } else if (res.success || res.status === 'success') {
        if (Array.isArray(res.data)) {
          setTests(res.data);
        } else if (res.data && Array.isArray(res.data.tests)) {
          setTests(res.data.tests);
        } else if (res.data && Array.isArray(res.data.data)) {
          setTests(res.data.data);
        } else {
          setTests([]); // Fallback
        }
      } else if (res.tests && Array.isArray(res.tests)) {
        setTests(res.tests);
      } else {
        setTests([]);
      }
    } catch (error) {
      console.error('Failed to fetch tests', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Manage your tests and view their status</p>
        </div>
        <Button onClick={() => {
          useTestStore.getState().clearDraft();
          navigate('/tests/create');
        }}>Create New Test</Button>
      </div>

      <Card className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>Loading tests...</div>
        ) : tests.length === 0 ? (
          <div className={styles.empty}>No tests found. Create one to get started!</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td className={styles.nameCell}>{test.name}</td>
                  <td>{test.subject}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[test.status || 'draft']}`}>
                      {test.status || 'Draft'}
                    </span>
                  </td>
                  <td>{test.created_at ? new Date(test.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => navigate(`/tests/${test.id}/preview`)}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};
