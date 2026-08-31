import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { TestSummaryCard } from '../../components/ui/TestSummaryCard';
import toast from 'react-hot-toast';
import { useTestStore } from '../../store/useTestStore';
import { testService } from '../../services/test.service';
import { questionService } from '../../services/question.service';
import { Test } from '../../types';
import styles from './PreviewPublish.module.css';
import { FiCheckCircle, FiChevronsLeft, FiCheck } from 'react-icons/fi';

export const PreviewPublish: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const draft = useTestStore((state) => state.draft);
  const clearDraft = useTestStore((state) => state.clearDraft);
  
  const [viewTest, setViewTest] = React.useState<Test | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const [publishTab, setPublishTab] = useState<'now' | 'schedule'>('now');
  const [durationMode, setDurationMode] = useState<string>('always');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  
  const [selectedPreviewIdx, setSelectedPreviewIdx] = useState<number | null>(null);

  const isDraftMode = draft?.id === testId;
  const isLive = viewTest?.status === 'live' || (isDraftMode && draft?.status === 'live');

  React.useEffect(() => {
    if (testId) {
      loadTestFromAPI(testId);
    }
  }, [testId]);

  const loadTestFromAPI = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      const res: any = await testService.getById(id);
      
      const testData = res.data || res;
      if (testData && testData.id) {
        if (testData.questions && testData.questions.length > 0 && typeof testData.questions[0] === 'string') {
          const qRes: any = await questionService.fetchBulk(testData.questions);
          const qData = qRes.data || qRes;
          if (qData && Array.isArray(qData)) {
            testData.questions = qData;
          }
        }
        setViewTest(testData);
      } else {
        setError('Failed to fetch test details.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading the test.');
    } finally {
      setLoading(false);
    }
  };

  const onConfirm = async () => {
    try {
      if (!testId) return;
      // Depending on durationMode/publishTab, we might send extra data if API supported it.
      // Currently API only expects { status: 'live' }.
      const res: any = await testService.publish(testId);
      if (res.success || res.status === 'success') {
        toast.success('Test published successfully!');
        clearDraft();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to publish test');
    }
  };

  const activeQuestions = (viewTest?.questions && viewTest.questions.length > 0)
    ? viewTest.questions
    : (isDraftMode ? draft?.questions : []);

  const activeTest = viewTest 
    ? { ...viewTest, questions: activeQuestions } 
    : (isDraftMode && draft ? { ...draft, questions: draft.questions } : null);

  if (loading && !activeTest) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}><h2>Loading Test Data...</h2></div>
      </div>
    );
  }

  if (error || !activeTest) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>{error || 'Test data not found'}</h2>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>Test creation</div>

      <div className={styles.mainLayout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitleRow}>
              <span>Question creation</span>
              <FiChevronsLeft className={styles.collapseIcon} size={16} />
            </div>
            <span>Total Questions . {activeTest.total_questions || activeTest.questions?.length || 5}</span>
          </div>
          <div className={styles.questionList}>
            {activeTest.questions?.map((_, idx) => (
              <button 
                key={idx} 
                type="button" 
                className={`${styles.questionTab} ${styles.completed} ${selectedPreviewIdx === idx ? styles.active : ''}`}
                onClick={() => setSelectedPreviewIdx(idx)}
              >
                <span className={styles.checkIcon}>✓</span> Question {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Test created</h1>
            <div className={styles.successPill}>
              <FiCheckCircle size={14} /> All {activeTest.total_questions || activeTest.questions?.length || 5} Questions done
            </div>
          </div>          <div className={styles.summaryWrapper}>
            <TestSummaryCard test={activeTest} />
          </div>

          {selectedPreviewIdx !== null && activeTest.questions?.[selectedPreviewIdx] && (
            <div className={styles.previewQuestionDiv}>
              {(() => {
                const q = activeTest.questions[selectedPreviewIdx] as any;
                return (
                  <div className={styles.questionCard}>
                    <div className={styles.questionHeader}>
                      <span className={styles.questionNumber}>Question {selectedPreviewIdx + 1}</span>
                      <div className={styles.questionMeta}>
                        <span className={styles.metaBadge}>{q.difficulty || 'Easy'}</span>
                      </div>
                    </div>
                    
                    <div className={styles.questionBody}>
                      <p>{q.question}</p>
                      
                      <div className={styles.optionsGrid}>
                        {['option1', 'option2', 'option3', 'option4'].map((optKey, i) => (
                          <div 
                            key={optKey} 
                            className={`${styles.optionItem} ${q.correct_option === optKey ? styles.correctOption : ''}`}
                          >
                            <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                            <span className={styles.optionText}>{q[optKey]}</span>
                            {q.correct_option === optKey && <FiCheck className={styles.checkIcon} />}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className={styles.explanationBox}>
                          <strong>Explanation:</strong>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {!isLive && (
            <>
              <div className={styles.tabsWrapper}>
                <button 
                  className={`${styles.tab} ${publishTab === 'now' ? styles.activeTab : ''}`}
                  onClick={() => setPublishTab('now')}
                >
                  Publish Now
                </button>
                <button 
                  className={`${styles.tab} ${publishTab === 'schedule' ? styles.activeTab : ''}`}
                  onClick={() => setPublishTab('schedule')}
                >
                  Schedule Publish
                </button>
              </div>

              <div className={styles.configSection}>
                <h2 className={styles.sectionTitle}>Live Until</h2>
                <p className={styles.sectionDesc}>Choose how long this test should remain available on the platform.</p>
                
                <div className={styles.radioGrid}>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="duration" checked={durationMode === 'always'} onChange={() => setDurationMode('always')} />
                    <span className={styles.radioCustom}></span>
                    Always Available
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="duration" checked={durationMode === '3_weeks'} onChange={() => setDurationMode('3_weeks')} />
                    <span className={styles.radioCustom}></span>
                    3 Weeks
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="duration" checked={durationMode === '1_week'} onChange={() => setDurationMode('1_week')} />
                    <span className={styles.radioCustom}></span>
                    1 Week
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="duration" checked={durationMode === '1_month'} onChange={() => setDurationMode('1_month')} />
                    <span className={styles.radioCustom}></span>
                    1 Month
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="duration" checked={durationMode === '2_weeks'} onChange={() => setDurationMode('2_weeks')} />
                    <span className={styles.radioCustom}></span>
                    2 Weeks
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="duration" checked={durationMode === 'custom'} onChange={() => setDurationMode('custom')} />
                    <span className={styles.radioCustom}></span>
                    Custom Duration
                  </label>
                </div>

                <div className={styles.customDateRow}>
                  <div className={styles.inputWrapper}>
                    <input 
                      type="date" 
                      className={styles.input} 
                      disabled={durationMode !== 'custom'}
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      placeholder="Select End Date"
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <input 
                      type="time" 
                      className={styles.input} 
                      disabled={durationMode !== 'custom'}
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      placeholder="Select End Time"
                    />
                  </div>
                </div>

                <div className={styles.actionsRow}>
                  <button className={styles.cancelBtn} onClick={() => navigate(-1)}>Cancel</button>
                  <button className={styles.confirmBtn} onClick={onConfirm}>Confirm</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
