import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { subjectService } from '../../services/subject.service';
import { testService } from '../../services/test.service';
import { useTestStore } from '../../store/useTestStore';
import { Subject, Topic, SubTopic } from '../../types';
import styles from './CreateTest.module.css';

const createTestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  topics: z.string().min(1, 'Topic is required'),
  sub_topics: z.string().min(1, 'Sub topic is required'),
  total_time: z.coerce.number().min(1, 'Duration is required'),
  difficulty: z.enum(['easy', 'medium', 'difficult']),
  wrong_marks: z.coerce.number(),
  unattempt_marks: z.coerce.number(),
  correct_marks: z.coerce.number().min(1),
  total_questions: z.coerce.number().min(1),
  total_marks: z.coerce.number().min(1),
});

type CreateTestForm = z.infer<typeof createTestSchema>;

export const CreateTest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.edit;
  const setDraft = useTestStore((state) => state.setDraft);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateTestForm>({
    resolver: zodResolver(createTestSchema),
    defaultValues: {
      subject: '',
      topics: '',
      sub_topics: '',
      difficulty: 'easy',
      wrong_marks: -1,
      unattempt_marks: 0,
      correct_marks: 5,
    }
  });

  const draft = useTestStore((state) => state.draft);

  useEffect(() => {
    if (isEditMode && draft) {
      reset({
        name: draft.name || '',
        difficulty: (draft.difficulty as 'easy' | 'medium' | 'difficult') || 'easy',
        total_time: draft.total_time,
        wrong_marks: draft.wrong_marks || -1,
        unattempt_marks: draft.unattempt_marks || 0,
        correct_marks: draft.correct_marks || 5,
        total_questions: draft.total_questions,
        total_marks: draft.total_marks || ((draft.total_questions || 0) * (draft.correct_marks || 5)),
      });
    } else if (!isEditMode && draft) {
      useTestStore.getState().clearDraft();
    }
  }, [isEditMode, draft, reset]);

  const selectedSubject = watch('subject');
  const selectedTopic = watch('topics');

  useEffect(() => {
    // Fetch subjects on load
    subjectService.getAllSubjects().then((res: any) => {
      const data = Array.isArray(res) ? res : res.data;
      if (data && Array.isArray(data)) setSubjects(data);
    });
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      subjectService.getTopicsBySubject(selectedSubject).then((res: any) => {
        const data = Array.isArray(res) ? res : res.data;
        if (data && Array.isArray(data)) setTopics(data);
      });
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedTopic) {
      subjectService.getSubTopicsByTopic(selectedTopic).then((res: any) => {
        const data = Array.isArray(res) ? res : res.data;
        if (data && Array.isArray(data)) setSubTopics(data);
      });
    }
  }, [selectedTopic]);

  // Safe cascaded resolution of IDs from names
  useEffect(() => {
    if (isEditMode && draft && subjects.length > 0) {
      const draftSubject = draft.subjectName || draft.subject || '';
      const matchingSubject = subjects.find(s => s.id === draftSubject || s.name === draftSubject);
      if (matchingSubject && watch('subject') !== matchingSubject.id) {
        setValue('subject', matchingSubject.id);
      }
    }
  }, [isEditMode, draft, subjects, setValue, watch]);

  useEffect(() => {
    if (isEditMode && draft && topics.length > 0) {
      const draftTopic = draft.topicName || draft.topics?.[0] || '';
      const matchingTopic = topics.find(t => t.id === draftTopic || t.name === draftTopic);
      if (matchingTopic && watch('topics') !== matchingTopic.id) {
        setValue('topics', matchingTopic.id);
      }
    }
  }, [isEditMode, draft, topics, setValue, watch]);

  useEffect(() => {
    if (isEditMode && draft && subTopics.length > 0) {
      const draftSubTopic = draft.subTopicName || draft.sub_topics?.[0] || '';
      const matchingSubTopic = subTopics.find(st => st.id === draftSubTopic || st.name === draftSubTopic);
      if (matchingSubTopic && watch('sub_topics') !== matchingSubTopic.id) {
        setValue('sub_topics', matchingSubTopic.id);
      }
    }
  }, [isEditMode, draft, subTopics, setValue, watch]);

  const onSubmit = async (data: CreateTestForm) => {
    // 1. requested constraint: right ans <= total questions
    if (data.correct_marks > data.total_questions) {
      toast.error(`Correct Answer marks (${data.correct_marks}) must be less than or equal to Total Questions (${data.total_questions})`);
      return;
    }

    try {
      const apiPayload = {
        name: data.name,
        type: 'chapterwise',
        subject: data.subject,
        topics: [data.topics],
        sub_topics: [data.sub_topics],
        correct_marks: data.correct_marks,
        wrong_marks: data.wrong_marks,
        unattempt_marks: data.unattempt_marks,
        difficulty: data.difficulty,
        total_time: data.total_time,
        total_marks: data.total_marks,
        total_questions: data.total_questions,
        status: 'draft' as const
      };

      let res: any;
      if (draft && draft.id) {
        res = await testService.update(draft.id, apiPayload);
      } else {
        res = await testService.create(apiPayload);
      }
      
      if (res.success || res.status === 'success') {
        const subjectName = subjects.find(s => s.id === data.subject)?.name || 'English';
        const topicName = topics.find(t => t.id === data.topics)?.name || 'Grammar';
        const subTopicName = subTopics.find(st => st.id === data.sub_topics)?.name || 'Application';

        // Keep existing questions if updating
        const existingQuestions = draft && draft.id ? draft.questions : [];

        setDraft({ 
          ...apiPayload, 
          id: draft && draft.id ? draft.id : res.data.id,
          subjectName,
          topicName,
          subTopicName,
          questions: existingQuestions
        });
        
        const testId = draft && draft.id ? draft.id : res.data.id;
        navigate(`/tests/${testId}/questions`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to ${draft ? 'update' : 'create'} test: ` + (err.message || 'Validation failed'));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        Test Creation / <span>Create Test</span> / Chapter Wise
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.active}`}>Chapterwise</button>
        <button className={styles.tab}>PYQ</button>
        <button className={styles.tab}>Mock Test</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
        <div className={styles.grid}>
          <Select 
            label="Subject" 
            options={subjects.map(s => ({ value: s.id, label: s.name }))} 
            placeholder="Choose from Drop-down"
            {...register('subject')} 
            value={watch('subject')}
            error={errors.subject?.message}
          />
          <Input 
            label="Name of Test" 
            placeholder="Enter name of Test" 
            {...register('name')} 
            error={errors.name?.message}
          />
          <Select 
            label="Topic" 
            options={topics.map(t => ({ value: t.id, label: t.name }))} 
            placeholder="Choose from Drop-down"
            {...register('topics')} 
            value={watch('topics')}
            error={errors.topics?.message}
          />
          <Select 
            label="Sub Topic" 
            options={subTopics.map(st => ({ value: st.id, label: st.name }))} 
            placeholder="Choose from Drop-down"
            {...register('sub_topics')} 
            value={watch('sub_topics')}
            error={errors.sub_topics?.message}
          />
        </div>

        <div className={styles.grid}>
          <Input 
            label="Duration (Minutes)" 
            placeholder="Enter the time" 
            {...register('total_time')} 
            error={errors.total_time?.message}
          />
          <div className={styles.difficultyGroup}>
            <label className={styles.label}>Test Difficulty Level</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" value="easy" {...register('difficulty')} />
                <div className={styles.radioCircle}>
                  <div className={styles.radioDot}></div>
                </div>
                Easy
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" value="medium" {...register('difficulty')} />
                <div className={styles.radioCircle}>
                  <div className={styles.radioDot}></div>
                </div>
                Medium
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" value="difficult" {...register('difficulty')} />
                <div className={styles.radioCircle}>
                  <div className={styles.radioDot}></div>
                </div>
                Difficult
              </label>
            </div>
          </div>
        </div>

        <div className={styles.markingScheme}>
          <label className={styles.label}>Marking Scheme:</label>
          <div className={styles.markingGrid}>
            <Input label="Wrong Answer" type="number" {...register('wrong_marks')} />
            <Input label="Unattempted" type="number" {...register('unattempt_marks')} />
            <Input label="Correct Answer" type="number" {...register('correct_marks')} />
            <Input label="No of Questions" type="number" placeholder="Ex:250 Marks" {...register('total_questions')} />
            <Input label="Total Marks" type="number" placeholder="Ex:250 Marks" {...register('total_marks')} />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate('/dashboard')}>Cancel</button>
          <button type="submit" className={styles.nextBtn}>Next</button>
        </div>
      </form>
    </div>
  );
};
