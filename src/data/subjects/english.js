import { defineSubject, lesson, video, pdf } from '../helpers.js';

/**
 * English curriculum steps:
 * 1. Video Lesson: Explanation, vocabulary, grammar, and exam skills
 * 2. Unit Book & Practice: Comprehensive study book, questions, and practice
 */
const ENGLISH_STEPS = [
  { k: 'learn',    n: 'Video Lesson',         sub: 'Watch the explanation and review',            ic: 'play', cta: 'Watch video lesson' },
  { k: 'practice', n: 'Unit Book & Practice', sub: 'Study unit book and solve practice exercises', ic: 'file', cta: 'Open unit book' },
];

/** Standard helper for English lessons */
const enLesson = (id, label, title, { videoTitle = 'Video explanation', videoUrl = '', pdfTitle = 'Unit book PDF', pdfUrl = '' } = {}) =>
  lesson(id, label, title, {
    learn:    [video(videoTitle, videoUrl)],
    practice: [pdf(pdfTitle, pdfUrl)],
  });

export default defineSubject({
  id: 'english',
  title: 'English',
  desc: 'Language, vocabulary, grammar, and literature (The Count of Monte Cristo)',
  icon: 'book',
  color: 'rose',
  structureDesc: '12 units and 12 story chapters',
  steps: ENGLISH_STEPS,

  // First thing on the Roadmap tab, before lesson 1.
  basics: {
    title: 'Start with the basics',
    desc: 'Watch these core foundation videos before starting Unit 1.',
    resources: [
      video('Basics, part 1', 'https://youtu.be/XqU5n3n0gvQ'),
      video('Basics, part 2', 'https://youtu.be/vYEKaB0C4jQ'),
      video('Basics, part 3', 'https://youtu.be/JWlcqyFEVpg'),
    ],
  },

  groups: [
    {
      id: 'term-1',
      title: 'First Term (Units 1 – 6)',
      color: 'rose',
      units: [
        {
          id: 'en-u1',
          title: 'Unit 1',
          book: { title: 'Unit 1 Book', url: './pdfs/english/en-u1.pdf' },
          lessons: [
            enLesson('en-u1-l1', 'Unit 1', 'Unit 1: Vocabulary & Grammar', {
              videoTitle: 'Unit 1 Comprehensive Review & Explanation',
              videoUrl: 'https://youtu.be/Rf2J38GSLaI',
              pdfTitle: 'Unit 1 Book',
              pdfUrl: './pdfs/english/en-u1.pdf',
            }),
          ],
        },
        {
          id: 'en-u2',
          title: 'Unit 2',
          book: { title: 'Unit 2 Book', url: './pdfs/english/en-u2.pdf' },
          lessons: [
            enLesson('en-u2-l1', 'Unit 2', 'Unit 2: Vocabulary & Grammar', {
              videoTitle: 'Unit 2 Video Explanation',
              videoUrl: 'https://youtu.be/0AZnGV5nJ6k',
              pdfTitle: 'Unit 2 Book',
              pdfUrl: './pdfs/english/en-u2.pdf',
            }),
          ],
        },
        {
          id: 'en-u3',
          title: 'Unit 3',
          book: { title: 'Unit 3 Book', url: './pdfs/english/en-u3.pdf' },
          lessons: [
            enLesson('en-u3-l1', 'Unit 3', 'Unit 3: Vocabulary & Grammar', {
              videoTitle: 'Unit 3 Video Explanation',
              videoUrl: '',
              pdfTitle: 'Unit 3 Book',
              pdfUrl: './pdfs/english/en-u3.pdf',
            }),
          ],
        },
        {
          id: 'en-u4',
          title: 'Unit 4',
          book: { title: 'Unit 4 Book', url: './pdfs/english/en-u4.pdf' },
          lessons: [
            enLesson('en-u4-l1', 'Unit 4', 'Unit 4: Vocabulary & Grammar', {
              videoTitle: 'Unit 4 Video Explanation',
              videoUrl: '',
              pdfTitle: 'Unit 4 Book',
              pdfUrl: './pdfs/english/en-u4.pdf',
            }),
          ],
        },
        {
          id: 'en-u5',
          title: 'Unit 5',
          book: { title: 'Unit 5 Book', url: './pdfs/english/en-u5.pdf' },
          lessons: [
            enLesson('en-u5-l1', 'Unit 5', 'Unit 5: Vocabulary & Grammar', {
              videoTitle: 'Unit 5 Video Explanation',
              videoUrl: '',
              pdfTitle: 'Unit 5 Book',
              pdfUrl: './pdfs/english/en-u5.pdf',
            }),
          ],
        },
        {
          id: 'en-u6',
          title: 'Unit 6',
          book: { title: 'Unit 6 Book', url: './pdfs/english/en-u6.pdf' },
          lessons: [
            enLesson('en-u6-l1', 'Unit 6', 'Unit 6: Vocabulary & Grammar', {
              videoTitle: 'Unit 6 Video Explanation',
              videoUrl: '',
              pdfTitle: 'Unit 6 Book',
              pdfUrl: './pdfs/english/en-u6.pdf',
            }),
          ],
        },
      ],
    },
    {
      id: 'term-2',
      title: 'Second Term (Units 7 – 12)',
      color: 'purple',
      units: [
        {
          id: 'en-u7',
          title: 'Unit 7',
          book: { title: 'Unit 7 Book', url: '' },
          lessons: [
            enLesson('en-u7-l1', 'Unit 7', 'Unit 7: Vocabulary & Grammar', {
              videoTitle: 'Unit 7 Video Explanation',
              videoUrl: '',
              pdfTitle: 'Unit 7 Book',
              pdfUrl: '',
            }),
          ],
        },
        {
          id: 'en-u8',
          title: 'Unit 8',
          book: { title: 'Unit 8 Book', url: '' },
          lessons: [
            enLesson('en-u8-l1', 'Unit 8', 'Unit 8: Vocabulary & Grammar', {
              videoTitle: 'Unit 8 Video Explanation',
              videoUrl: '',
              pdfTitle: 'Unit 8 Book',
              pdfUrl: '',
            }),
          ],
        },
        {
          id: 'en-u9',
          title: 'Unit 9',
          book: { title: 'Unit 9 Book', url: '' },
          lessons: [
            enLesson('en-u9-l1', 'Unit 9', 'Unit 9: Vocabulary & Grammar', {
              videoTitle: 'Unit 9 Video Explanation',
              videoUrl: '',
              pdfTitle: 'Unit 9 Book',
              pdfUrl: '',
            }),
          ],
        },
        {
          id: 'en-u10',
          title: 'Unit 10',
          book: { title: 'Unit 10 Book', url: '' },
          lessons: [
            enLesson('en-u10-l1', 'Unit 10', 'Unit 10: Vocabulary & Grammar', {
              videoTitle: 'Unit 10 Video Explanation',
              videoUrl: '',
              pdfTitle: 'Unit 10 Book',
              pdfUrl: '',
            }),
          ],
        },
        {
          id: 'en-u11',
          title: 'Unit 11',
          book: { title: 'Unit 11 Book', url: '' },
          lessons: [
            enLesson('en-u11-l1', 'Unit 11', 'Unit 11: Vocabulary & Grammar', {
              videoTitle: 'Unit 11 Video Explanation',
              videoUrl: '',
              pdfTitle: 'Unit 11 Book',
              pdfUrl: '',
            }),
          ],
        },
        {
          id: 'en-u12',
          title: 'Unit 12',
          book: { title: 'Unit 12 Book', url: '' },
          lessons: [
            enLesson('en-u12-l1', 'Unit 12', 'Unit 12: Vocabulary & Grammar', {
              videoTitle: 'Unit 12 Video Explanation',
              videoUrl: '',
              pdfTitle: 'Unit 12 Book',
              pdfUrl: '',
            }),
          ],
        },
      ],
    },
    {
      id: 'story',
      title: 'Literature: The Story (12 Chapters)',
      color: 'cyan',
      units: [
        {
          id: 'en-story',
          title: 'The Novel: The Count of Monte Cristo (Chapters 1 – 12)',
          book: { title: 'Story Novel Book', url: '' },
          lessons: [
            enLesson('en-s-ch1-3', 'Chapters 1 – 3', 'Story: Chapters 1, 2 & 3', {
              videoTitle: 'Chapters 1, 2 & 3 Video Explanation',
              videoUrl: 'https://youtu.be/yGtGtiKjRkQ',
              pdfTitle: 'Chapters 1, 2 & 3 Book & Practice',
              pdfUrl: './pdfs/english/en-story-ch1-3.pdf',
            }),
            enLesson('en-s-ch4-6', 'Chapters 4 – 6', 'Story: Chapters 4, 5 & 6', {
              videoTitle: 'Chapters 4, 5 & 6 Video Explanation',
              videoUrl: 'https://youtu.be/jd8_hkUrN3E',
              pdfTitle: 'Chapters 4, 5 & 6 Book & Practice',
              pdfUrl: './pdfs/english/en-story-ch4-6.pdf',
            }),
            enLesson('en-s-ch7-9', 'Chapters 7 – 9', 'Story: Chapters 7, 8 & 9', {
              videoTitle: 'Chapters 7, 8 & 9 Video Explanation',
              videoUrl: 'https://youtu.be/vKqbqiKOQ3E',
              pdfTitle: 'Chapters 7, 8 & 9 Book & Practice',
              pdfUrl: '',
            }),
            enLesson('en-s-ch10-12', 'Chapters 10 – 12', 'Story: Chapters 10, 11 & 12', {
              videoTitle: 'Chapters 10, 11 & 12 Video Explanation',
              videoUrl: 'https://youtu.be/xFZEjHm7v8I',
              pdfTitle: 'Chapters 10, 11 & 12 Book & Practice',
              pdfUrl: '',
            }),
          ],
        },
      ],
    },
  ],

  revision: [
    {
      title: 'First Term & Second Term Revision',
      items: [
        { id: 'en-r01', title: 'First Term (Units 1 – 6) Comprehensive Revision', unit: 'Units 1 – 6', type: 'Term Revision', url: '' },
        { id: 'en-r02', title: 'Second Term (Units 7 – 12) Comprehensive Revision', unit: 'Units 7 – 12', type: 'Term Revision', url: '' },
        { id: 'en-r03', title: 'Grammar Rules Master Summary & Drills', unit: 'Grammar', type: 'Grammar Revision', url: '' },
        { id: 'en-r04', title: 'Writing, Essay & Punctuation Skills', unit: 'Writing', type: 'Skills Revision', url: '' },
      ],
    },
    {
      title: 'Literature & Final Exams',
      items: [
        { id: 'en-r05', title: 'The Count of Monte Cristo Full Story Summary', unit: 'Story', type: 'Story Revision', url: '' },
        { id: 'en-r06', title: 'Comprehensive Exam Models & Past Papers', unit: 'All Units', type: 'Full Exams', url: '' },
      ],
    },
  ],
});
