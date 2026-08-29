import React from 'react';
import { FiEdit2, FiClock, FiFileText, FiBarChart2 } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '../../store/useTestStore';
import styles from './TestSummaryCard.module.css';

interface TestSummaryCardProps {
  test: any;
  onEdit?: () => void;
}

export const TestSummaryCard: React.FC<TestSummaryCardProps> = ({ test, onEdit }) => {
  const navigate = useNavigate();
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      useTestStore.getState().setDraft(test);
      navigate('/tests/create', { state: { edit: true } });
    }
  };

  return (
    <div className={styles.summaryCard}>
      <FiEdit2 className={styles.editIcon} size={18} onClick={handleEdit} />
      
      <div className={styles.summaryHeader}>
        <span className={styles.pillDark}>Chapter Wise</span>
      </div>
      
      <div className={styles.summaryTitleRow}>
        <div className={styles.summaryTitle}>
          <img src="/vite.svg" alt="icon" width={24} /> Chapter 1
        </div>
        <span className={styles.pillTeal}>
          <FaBrain /> {test?.difficulty ? test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1) : 'Easy'}
        </span>
      </div>

      <div className={styles.summaryDetails}>
        <div>Subject</div>
        <div>: <span>{test?.subjectName || test?.subject || 'English'}</span></div>
        
        <div>Topic</div>
        <div>: <span className={styles.pillYellow}>{test?.topicName || test?.topics?.[0] || 'Grammar'}</span></div>
        
        <div>Sub Topic</div>
        <div>: <span className={styles.pillYellow}>{test?.subTopicName || test?.sub_topics?.[0] || 'Application'}</span></div>
      </div>

      <div className={styles.summaryStatsRow}>
        <div className={styles.statItem}><FiClock /> {test?.total_time || 60} Min</div>
        <div>|</div>
        <div className={styles.statItem}><FiFileText /> {test?.total_questions || test?.questions?.length || 5} Q's</div>
        <div>|</div>
        <div className={styles.statItem}><FiBarChart2 /> {test?.total_marks || 250} Marks</div>
      </div>
    </div>
  );
};
