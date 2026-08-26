import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useTestStore } from '../../store/useTestStore';
import { testService } from '../../services/test.service';
import styles from './PreviewPublish.module.css';

export const PreviewPublish: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const draft = useTestStore((state) => state.draft);
  const clearDraft = useTestStore((state) => state.clearDraft);

  const onPublish = async () => {
    try {
      if (!testId) return;
      const res: any = await testService.publish(testId);
      if (res.success) {
        alert('Test published successfully!');
        clearDraft();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to publish test');
    }
  };

  if (!draft) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Test data not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Preview & Publish</h1>
        <div className={styles.actions}>
          <Button variant="outline" onClick={() => navigate(-1)}>Edit Questions</Button>
          <Button variant="primary" onClick={onPublish}>Publish Test</Button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.testOverview}>
          <h2>{draft.name}</h2>
          <div className={styles.meta}>
            <span><strong>Subject:</strong> {draft.subject}</span>
            <span><strong>Duration:</strong> {draft.total_time} mins</span>
            <span><strong>Marks:</strong> {draft.total_marks}</span>
            <span><strong>Questions:</strong> {draft.questions?.length} / {draft.total_questions}</span>
          </div>
        </div>

        <div className={styles.questionsList}>
          <h3>Questions Preview</h3>
          {draft.questions?.map((q, idx) => (
            <div key={idx} className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span className={styles.qNum}>Q{idx + 1}.</span>
                <p className={styles.qText}>{q.question}</p>
              </div>
              <div className={styles.optionsList}>
                <div className={`${styles.option} ${q.correct_option === 'option1' ? styles.correct : ''}`}>
                  A. {q.option1}
                </div>
                <div className={`${styles.option} ${q.correct_option === 'option2' ? styles.correct : ''}`}>
                  B. {q.option2}
                </div>
                <div className={`${styles.option} ${q.correct_option === 'option3' ? styles.correct : ''}`}>
                  C. {q.option3}
                </div>
                <div className={`${styles.option} ${q.correct_option === 'option4' ? styles.correct : ''}`}>
                  D. {q.option4}
                </div>
              </div>
              {q.explanation && (
                <div className={styles.solution}>
                  <strong>Solution:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
