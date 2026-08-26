import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
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
  const setDraft = useTestStore((state) => state.setDraft);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateTestForm>({
    resolver: zodResolver(createTestSchema),
    defaultValues: {
      difficulty: 'easy',
      wrong_marks: -1,
      unattempt_marks: 0,
      correct_marks: 5,
    }
  });

  const selectedSubject = watch('subject');
  const selectedTopic = watch('topics');

  useEffect(() => {
    // Fetch subjects on load
    subjectService.getAllSubjects().then((res: any) => {
      if (res.success) setSubjects(res.data);
    });
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      subjectService.getTopicsBySubject(selectedSubject).then((res: any) => {
        if (res.success) setTopics(res.data);
      });
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedTopic) {
      subjectService.getSubTopicsByTopic(selectedTopic).then((res: any) => {
        if (res.success) setSubTopics(res.data);
      });
    }
  }, [selectedTopic]);

  const onSubmit = async (data: CreateTestForm) => {
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

      const res: any = await testService.create(apiPayload);
      if (res.success) {
        setDraft({ ...apiPayload, id: res.data.id });
        navigate(`/tests/${res.data.id}/questions`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create test');
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
            {...register('subject')} 
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
            {...register('topics')} 
            error={errors.topics?.message}
          />
          <Select 
            label="Sub Topic" 
            options={subTopics.map(st => ({ value: st.id, label: st.name }))} 
            {...register('sub_topics')} 
            error={errors.sub_topics?.message}
          />
        </div>

        <div className={styles.grid}>
          <Input 
            label="Duration (Minutes)" 
            type="number" 
            placeholder="Enter the time" 
            {...register('total_time')} 
            error={errors.total_time?.message}
          />
          
          <div className={styles.difficultyGroup}>
            <label className={styles.label}>Test Difficulty Level</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" value="easy" {...register('difficulty')} />
                Easy
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" value="medium" {...register('difficulty')} />
                Medium
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" value="difficult" {...register('difficulty')} />
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
            <Input label="No of Questions" type="number" placeholder="Ex: 50" {...register('total_questions')} />
            <Input label="Total Marks" type="number" placeholder="Ex: 250" {...register('total_marks')} />
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </div>
  );
};
