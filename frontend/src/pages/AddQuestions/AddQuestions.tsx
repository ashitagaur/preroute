import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useTestStore } from '../../store/useTestStore';
import { questionService } from '../../services/question.service';
import { subjectService } from '../../services/subject.service';
import { Question, Topic, SubTopic } from '../../types';
import { TestSummaryCard } from '../../components/ui/TestSummaryCard';
import styles from './AddQuestions.module.css';
import { FiTrash2, FiChevronsLeft, FiPlus, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';


const questionSchema = z.object({
  question: z.string().min(1, 'Question text is required'),
  option1: z.string().min(1, 'Option 1 is required'),
  option2: z.string().min(1, 'Option 2 is required'),
  option3: z.string().min(1, 'Option 3 is required'),
  option4: z.string().min(1, 'Option 4 is required'),
  correct_option: z.enum(['option1', 'option2', 'option3', 'option4'], { required_error: 'Correct option is required' }),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'difficult']).optional(),
  topic: z.string().optional(),
  subTopic: z.string().optional(),
});

type QuestionForm = z.infer<typeof questionSchema>;

export const AddQuestions: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const draft = useTestStore((state) => state.draft);
  const addQuestionsToStore = useTestStore((state) => state.addQuestions);
  const updateQuestionToStore = useTestStore((state) => state.updateQuestion);
  
  const [questionsList, setQuestionsList] = useState<Question[]>(draft?.questions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    trigger,
    getValues,
    formState: { errors }
  } = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      difficulty: '' as any,
      topic: '',
      subTopic: '',
      explanation: '',
    }
  });

  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);

  useEffect(() => {
    const loadTopics = async () => {
      let subjectId = draft?.subject;
      // If subject ID is missing but we have subjectName, try to recover the ID
      if (!subjectId && draft?.subjectName) {
        try {
          const res: any = await subjectService.getAllSubjects();
          const subjects = Array.isArray(res) ? res : res.data;
          const match = subjects?.find((s: any) => s.name === draft.subjectName);
          if (match) subjectId = match.id;
        } catch (e) {
          console.error("Failed to recover subject ID", e);
        }
      }

      if (subjectId) {
        subjectService.getTopicsBySubject(subjectId).then((res: any) => {
          const data = Array.isArray(res) ? res : res.data;
          if (data && Array.isArray(data)) setTopics(data);
        }).catch(e => console.error("Failed to load topics", e));
      }
    };
    loadTopics();
  }, [draft?.subject, draft?.subjectName]);

  const selectedTopic = watch('topic');
  useEffect(() => {
    if (selectedTopic) {
      subjectService.getSubTopicsByTopic(selectedTopic).then((res: any) => {
        const data = Array.isArray(res) ? res : res.data;
        if (data && Array.isArray(data)) setSubTopics(data);
      });
    } else {
      setSubTopics([]);
    }
  }, [selectedTopic]);

  const onSubmitQuestion = async (formData: QuestionForm) => {
    const { topic, subTopic, ...restData } = formData;
    
    // Clean payload of empty strings/undefined
    const cleanRestData = Object.fromEntries(
      Object.entries(restData).filter(([_, v]) => v !== '' && v !== undefined)
    );

    const questionData: Question = {
      type: 'mcq',
      ...cleanRestData,
      test_id: testId,
      subject: draft?.subject,
    } as Question;

    if (topic) questionData.topic_id = topic;
    if (subTopic) questionData.sub_topic_id = subTopic;

    let updatedList = [...questionsList];

    if (currentQuestionIndex < questionsList.length) {
      // Update existing question
      updatedList[currentQuestionIndex] = questionData;
      setQuestionsList(updatedList);
      updateQuestionToStore(currentQuestionIndex, questionData);
    } else {
      // Add new question
      updatedList = [...questionsList, questionData];
      setQuestionsList(updatedList);
      addQuestionsToStore([questionData]);
    }

    // If last question, submit all to backend
    if (currentQuestionIndex + 1 >= (draft?.total_questions || Math.max(5, questionsList.length))) {
      if (updatedList.length === 0) {
        toast.error('Please add at least 1 question.');
        return;
      }
      try {
        // Filter out any questions that are completely empty
        const filledQuestions = updatedList.filter(q => q.question || q.option1);
        
        if (filledQuestions.length === 0) {
          toast.error('Please add at least 1 question with content.');
          return;
        }

        // Final safety clean for all questions (in case older state still has empty strings)
        const cleanList = filledQuestions.map(q => {
          return Object.fromEntries(
            Object.entries(q).filter(([_, v]) => v !== '' && v !== undefined)
          ) as Question;
        });

        console.log("Submitting bulk...", cleanList);
        await questionService.bulkCreate(cleanList);
        // Update the draft to reflect actual created questions
        if (draft) {
          useTestStore.getState().setDraft({ 
            ...draft, 
            total_questions: cleanList.length,
            questions: cleanList 
          });
        }
        
        toast.success('Questions saved successfully!');
        navigate(`/tests/${testId}/preview`);
      } catch (err: any) {
        console.error('Backend validation error:', err);
        let errorMsg = 'Validation failed';
        if (err.errors && Array.isArray(err.errors)) {
          errorMsg = err.errors.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ');
        } else if (err.message) {
          errorMsg = err.message;
        }
        toast.error(errorMsg);
      }
    } else {
      // Just go to the next question
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      if (nextIdx < questionsList.length) {
        reset(questionsList[nextIdx] as any);
      } else {
        reset({
          question: '',
          option1: '', option2: '', option3: '', option4: '',
          explanation: '',
          topic: '',
          subTopic: '',
          difficulty: '' as any,
        });
      }
    }
  };

  const saveCurrentQuestion = () => {
    const formData = getValues();
    const { topic, subTopic, ...restData } = formData;
    
    const cleanRestData = Object.fromEntries(
      Object.entries(restData).filter(([_, v]) => v !== '' && v !== undefined)
    );

    const questionData: Question = {
      type: 'mcq',
      ...cleanRestData,
      test_id: testId,
      subject: draft?.subject,
    } as Question;

    if (topic) questionData.topic_id = topic;
    if (subTopic) questionData.sub_topic_id = subTopic;
    let updatedList = [...questionsList];
    if (currentQuestionIndex < questionsList.length) {
      updatedList[currentQuestionIndex] = questionData;
      updateQuestionToStore(currentQuestionIndex, questionData);
    } else {
      updatedList = [...questionsList, questionData];
      addQuestionsToStore([questionData]);
    }
    setQuestionsList(updatedList);
  };

  const onSelectQuestion = async (idx: number) => {
    if (idx === currentQuestionIndex) return;
    
    // Allow escaping a completely empty new question
    const currentValues = getValues();
    const isEmptyNew = currentQuestionIndex === questionsList.length && 
      !currentValues.question && 
      !currentValues.option1 && !currentValues.option2 && !currentValues.option3 && !currentValues.option4 &&
      !currentValues.explanation;

    if (isEmptyNew) {
      setCurrentQuestionIndex(idx);
      const q = questionsList[idx];
      reset({ ...q, topic: q.topic_id, subTopic: q.sub_topic_id } as any);
      return;
    }

    const isValid = await trigger();
    if (isValid) {
      saveCurrentQuestion();
      setCurrentQuestionIndex(idx);
      const q = questionsList[idx];
      reset({ ...q, topic: q.topic_id, subTopic: q.sub_topic_id } as any);
    } else {
      toast.error('Please complete the current question before switching.');
    }
  };

  const onNewQuestionClick = async () => {
    const isValid = await trigger();
    if (isValid) {
      saveCurrentQuestion();
      setCurrentQuestionIndex(questionsList.length);
      reset({
        question: '',
        option1: '', option2: '', option3: '', option4: '',
        explanation: '',
        topic: '',
        subTopic: '',
        difficulty: '' as any,
      });
    } else {
      toast.error('Please complete the current question first.');
    }
  };

  // (Removed onNext since it's merged into onSubmitQuestion)

  const onPublishTest = async () => {
    if (!testId) return;
    
    // We want to bulk create all filled questions before publishing
    const filledQuestions = questionsList.filter(q => q.question || q.option1);
    
    // Also include current question if it has data
    const currentValues = getValues();
    if (currentValues.question || currentValues.option1) {
      const { topic, subTopic, ...restData } = currentValues;
      const cleanRestData = Object.fromEntries(
        Object.entries(restData).filter(([_, v]) => v !== '' && v !== undefined)
      );
      const q: Question = { type: 'mcq', ...cleanRestData, test_id: testId, subject: draft?.subject } as Question;
      if (topic) q.topic_id = topic;
      if (subTopic) q.sub_topic_id = subTopic;
      
      // Replace if existing, append if new
      if (currentQuestionIndex < filledQuestions.length) {
        filledQuestions[currentQuestionIndex] = q;
      } else {
        filledQuestions.push(q);
      }
    }

    if (filledQuestions.length === 0) {
      toast.error('Please add at least 1 question.');
      return;
    }

    try {
      const cleanList = filledQuestions.map(q => {
        return Object.fromEntries(Object.entries(q).filter(([_, v]) => v !== '' && v !== undefined)) as Question;
      });

      await questionService.bulkCreate(cleanList);
      toast.success('Questions saved successfully!');
      
      // Update the draft to reflect actual created questions length so Preview displays it correctly
      if (draft) {
        useTestStore.getState().setDraft({ 
          ...draft, 
          total_questions: cleanList.length,
          questions: cleanList
        });
      }
      
      navigate(`/tests/${testId}/preview`);
    } catch (error: any) {
      let errorMsg = 'Failed to save questions';
      if (error.errors && Array.isArray(error.errors)) {
        errorMsg = error.errors.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ');
      }
      toast.error(errorMsg);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          Test Creation / Create Test / <span>Chapter Wise</span>
        </div>
        <Button variant="primary" onClick={onPublishTest}>Publish</Button>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitleRow}>
              <span>Question creation</span>
              <FiChevronsLeft className={styles.collapseIcon} size={16} />
            </div>
            <span>Total Questions . {draft?.total_questions || Math.max(5, questionsList.length)}</span>
          </div>
          <div className={styles.questionList}>
            {questionsList.map((_, idx) => (
              <button 
                key={idx} 
                type="button"
                className={`${styles.questionTab} ${currentQuestionIndex === idx ? styles.active : styles.completed}`}
                onClick={() => onSelectQuestion(idx)}
              >
                <span className={styles.checkIcon}>✓</span> Question {idx + 1}
              </button>
            ))}
            {questionsList.length < (draft?.total_questions || Math.max(5, questionsList.length)) && (
              <button 
                type="button"
                className={`${styles.questionTab} ${currentQuestionIndex === questionsList.length ? styles.active : ''}`}
                onClick={onNewQuestionClick}
              >
                Question {questionsList.length + 1}
              </button>
            )}
            {/* Mock remaining questions for UI purposes */}
            {Array.from({ length: Math.max(0, (draft?.total_questions || Math.max(5, questionsList.length)) - questionsList.length - 1) }).map((_, i) => (
              <button key={`mock-${i}`} type="button" className={styles.questionTab}>
                Question {questionsList.length + 2 + i}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.content}>
          {/* Summary Card */}
          <TestSummaryCard test={draft} />

          <form onSubmit={handleSubmit(onSubmitQuestion)} className={styles.form}>
            <div className={styles.formHeader}>
              <h3 className={styles.questionTitle}>Question {currentQuestionIndex + 1}<span>/{draft?.total_questions || Math.max(5, questionsList.length)}</span></h3>
              <div className={styles.actionButtons}>
                <button type="button" className={styles.actionBtn}><FiPlus /> MCQ</button>
                <button type="button" className={styles.actionBtn}><FiDownload /> CSV</button>
              </div>
            </div>
            
            <button type="button" className={styles.deleteBtn}>
              <FiTrash2 /> Delete All Edits
            </button>

            <div className={styles.editorBox}>
              <div className={styles.editorToolbar}>
                <i>I</i> <b>B</b> <u>U</u> <s>S</s> <span>🔗</span> <span>≣</span> <span>≡</span> <span>#</span> <span>∑</span>
              </div>
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

            <div className={styles.solutionContainer}>
              <h4>Add Solution</h4>
              <div className={styles.solutionBox}>
                <textarea 
                  className={styles.solutionTextarea} 
                  placeholder="Type here"
                  {...register('explanation')}
                />
                <button type="button" className={styles.solutionTrashBtn} onClick={() => setValue('explanation', '')}>
                  <FiTrash2 size={16} />
                </button>
              </div>
              <div className={styles.navArrows}>
                <button type="button" className={styles.navArrowBtn}><FiChevronLeft size={16} /></button>
                <button type="button" className={styles.navArrowBtn}><FiChevronRight size={16} /></button>
              </div>
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
                  placeholder="Select from Drop-down"
                  {...register('difficulty')}
                  value={watch('difficulty')}
                />
                <Select 
                  label="Topic"
                  options={topics.map(t => ({ value: t.id, label: t.name }))}
                  placeholder="Select from Drop-down"
                  {...register('topic')}
                  value={watch('topic')}
                />
                <Select 
                  label="Sub-topic"
                  options={subTopics.map(st => ({ value: st.id, label: st.name }))}
                  placeholder="Select from Drop-down"
                  {...register('subTopic')}
                  value={watch('subTopic')}
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.exitBtn} onClick={() => navigate(-1)}>Exit Test Creation</button>
              <button type="submit" className={styles.nextBtn}>
                {currentQuestionIndex + 1 >= (draft?.total_questions || Math.max(5, questionsList.length)) ? 'Submit & Preview' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
