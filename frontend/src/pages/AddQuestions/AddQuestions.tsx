import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useTestStore } from '../../store/useTestStore';
import { questionService } from '../../services/question.service';
import { Question } from '../../types';
import styles from './AddQuestions.module.css';
import { FiTrash2 } from 'react-icons/fi';

const questionSchema = z.object({
  question: z.string().min(1, 'Question text is required'),
  option1: z.string().min(1, 'Option 1 is required'),
  option2: z.string().min(1, 'Option 2 is required'),
  option3: z.string().min(1, 'Option 3 is required'),
  option4: z.string().min(1, 'Option 4 is required'),
  correct_option: z.enum(['option1', 'option2', 'option3', 'option4'], { required_error: 'Correct option is required' }),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'difficult']).optional(),
});

type QuestionForm = z.infer<typeof questionSchema>;

export const AddQuestions: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const draft = useTestStore((state) => state.draft);
  const addQuestionsToStore = useTestStore((state) => state.addQuestions);
  
  const [questionsList, setQuestionsList] = useState<Question[]>(draft?.questions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
  });

  const onAddQuestion = (data: QuestionForm) => {
    const newQuestion: Question = {
      type: 'mcq',
      ...data,
      test_id: testId
    };
    const updatedList = [...questionsList, newQuestion];
    setQuestionsList(updatedList);
    addQuestionsToStore([newQuestion]);
    reset(); // Clear form for next question
    setCurrentQuestionIndex(updatedList.length);
  };

  const onNext = async () => {
    if (questionsList.length === 0) {
      alert('Please add at least 1 question.');
      return;
    }
    try {
      const res: any = await questionService.bulkCreate(questionsList);
      if (res.success) {
        navigate(`/tests/${testId}/preview`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save questions');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          Test Creation / Create Test / <span>Chapter Wise</span>
        </div>
        <Button onClick={() => navigate(`/tests/${testId}/preview`)}>Preview</Button>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span>Total Questions : {draft?.total_questions || 50}</span>
          </div>
          <div className={styles.questionList}>
            {questionsList.map((q, idx) => (
              <button key={idx} className={`${styles.questionTab} ${styles.completed}`}>
                <span className={styles.checkIcon}>✓</span> Question {idx + 1}
              </button>
            ))}
            <button className={`${styles.questionTab} ${styles.active}`}>
              Question {questionsList.length + 1}
            </button>
            {/* Mock remaining questions for UI purposes */}
            {Array.from({ length: Math.max(0, (draft?.total_questions || 5) - questionsList.length - 1) }).map((_, i) => (
              <button key={`mock-${i}`} className={styles.questionTab}>
                Question {questionsList.length + 2 + i}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSubmit(onAddQuestion)} className={styles.form}>
            <div className={styles.formHeader}>
              <h3 className={styles.questionTitle}>Question {questionsList.length + 1} ({draft?.correct_marks || 5})</h3>
              <div className={styles.typeSelector}>
                <label><input type="radio" checked readOnly /> MCQ</label>
                <label><input type="radio" disabled /> OQA</label>
              </div>
            </div>
            
            <button type="button" className={styles.deleteBtn}>
              <FiTrash2 /> Delete All Edits
            </button>

            <div className={styles.editorBox}>
              <textarea 
                className={styles.textarea} 
                placeholder="Type question here..."
                {...register('question')}
              />
              {errors.question && <span className={styles.error}>{errors.question.message}</span>}
            </div>

            <div className={styles.optionsSection}>
              <h4>Type the options below</h4>
              <div className={styles.optionRow}>
                <input type="radio" value="option1" {...register('correct_option')} />
                <Input placeholder="Type Option 1 here" {...register('option1')} error={errors.option1?.message} />
              </div>
              <div className={styles.optionRow}>
                <input type="radio" value="option2" {...register('correct_option')} />
                <Input placeholder="Type Option 2 here" {...register('option2')} error={errors.option2?.message} />
              </div>
              <div className={styles.optionRow}>
                <input type="radio" value="option3" {...register('correct_option')} />
                <Input placeholder="Type Option 3 here" {...register('option3')} error={errors.option3?.message} />
              </div>
              <div className={styles.optionRow}>
                <input type="radio" value="option4" {...register('correct_option')} />
                <Input placeholder="Type Option 4 here" {...register('option4')} error={errors.option4?.message} />
              </div>
              {errors.correct_option && <span className={styles.error}>Please select the correct option via the radio button.</span>}
            </div>

            <div className={styles.solutionSection}>
              <h4>Add Solution</h4>
              <textarea 
                className={styles.textarea} 
                placeholder="Type explanation here..."
                {...register('explanation')}
              />
            </div>

            <div className={styles.settingsSection}>
              <h4>Question settings</h4>
              <div className={styles.grid}>
                <Select 
                  label="Level of Difficulty"
                  options={[
                    {value: 'easy', label: 'Easy'},
                    {value: 'medium', label: 'Medium'},
                    {value: 'difficult', label: 'Difficult'}
                  ]}
                  {...register('difficulty')}
                />
              </div>
            </div>

            <div className={styles.actions}>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Exit Test Creator</Button>
              <Button type="submit" variant="secondary">Add Another Question</Button>
              <Button type="button" variant="primary" onClick={onNext}>Save & Continue</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
