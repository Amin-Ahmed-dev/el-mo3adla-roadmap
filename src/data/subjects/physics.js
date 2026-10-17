import { defineSubject, lesson, video, pdf } from '../helpers.js';

// Physics lessons focus on: 1) Video explanation & solving, 2) Practice exercises.
// Comprehensive Chapter books are provided at each chapter's header for full reference.
const PHYSICS_STEPS = [
  { k: 'learn',    n: 'Learn & Solve', sub: 'Watch explanation and solving videos', ic: 'play',   cta: 'Start learning & solving' },
  { k: 'practice', n: 'Practice',     sub: 'Try the questions yourself',            ic: 'pencil', cta: 'Continue to practice' },
];

/** Standard helper for Physics lessons: connects practice PDF automatically by lesson ID */
const phLesson = (id, label, title, res = {}) =>
  lesson(id, label, title, {
    learn:    [video('Explanation & solving')],
    practice: [pdf('Practice book', `./pdfs/physics/${id}-practice.pdf`)],
    ...res,
  });

export default defineSubject({
  id: 'physics',
  title: 'Physics',
  desc: 'Electricity, electromagnetism, and modern physics',
  icon: 'atom',
  color: 'orange',
  steps: PHYSICS_STEPS,

  // First thing on the Roadmap tab, before lesson 1.
  basics: {
    title: 'Start with the basics',
    desc: 'Watch these core foundation videos and review the basics book before Chapter 1.',
    resources: [
      video('Basics, part 1', 'https://youtu.be/AahyD0-x9C4'),
      video('Basics, part 2', 'https://youtu.be/r7SrVl5aRGg'),
      pdf('Basics book', './pdfs/physics/ph-basics.pdf'),
    ],
  },


  groups: [
    {
      id: 'electricity', title: 'Dynamic Electricity & Electromagnetism', color: 'orange',
      units: [
        {
          id: 'c1', title: "Chapter 1: Electrical current and Ohm's law",
          book: { title: 'Chapter 1 Book', url: './pdfs/physics/ph-c1-book.pdf' },
          lessons: [
            phLesson('ph-c1-l1', 'Lesson 1', "Electrical current and Ohm's law", {
              learn: [
                video('Part 1', 'https://youtu.be/v8ECjFxXo3U'),
                video('Part 2', 'https://youtu.be/-lYRiiYjqgM'),
                video('Part 3', 'https://youtu.be/saEzsddKr-o'),
                video('Part 4', 'https://youtu.be/QEFDJKoQJ60'),
                video('Part 5', 'https://youtu.be/QIEjb0E5xH0'),
                video('Part 6', 'https://youtu.be/3qvW9sfruCs'),
              ],
            }),
            phLesson('ph-c1-l2', 'Lesson 2', 'Resistors connection', {
              learn: [
                video('Part 1', 'https://youtu.be/WiejkAjhatM'),
                video('Part 2', 'https://youtu.be/W5NKYsblry8'),
                video('Part 3', 'https://youtu.be/BwxqSVSrbW4'),
                video('Part 4', 'https://youtu.be/ayrW8WUJwyE'),
                video('Part 5', 'https://youtu.be/7_Wc92ZHnvs'),
                video('Part 6', 'https://youtu.be/Mey8dyvZBeU'),
                video('Part 7', 'https://youtu.be/jMPFSkqtNyo'),
                video('Part 8', 'https://youtu.be/kInVYthDoQU'),
                video('Part 9', 'https://youtu.be/TSd1TzG2QTc'),
                video('Part 10', 'https://youtu.be/0oHFyz0sXHQ'),
              ],
            }),
            phLesson('ph-c1-l3', 'Lesson 3', "Ohm's law for closed circuits", {
              learn: [
                video('Part 1', 'https://youtu.be/cLgPwVzIv58'),
                video('Part 2', 'https://youtu.be/Gelz42q7fSY'),
                video('Part 3', 'https://youtu.be/76tTqjbrn5U'),
              ],
            }),
            phLesson('ph-c1-l4', 'Lesson 4', "Kirchhoff's laws", {
              learn: [
                video('Part 1', 'https://youtu.be/B_osAohh9OE'),
                video('Part 2', 'https://youtu.be/Y6MPiGgdxZA'),
                video('Part 3', 'https://youtu.be/OM4KN8ADbsg'),
              ],
            }),
          ],
        },
        {
          id: 'c2', title: 'Chapter 2: Magnetic effects of electric current & measuring instruments',
          book: { title: 'Chapter 2 Book', url: './pdfs/physics/ph-c2-book.pdf' },
          lessons: [
            phLesson('ph-c2-l1', 'Lesson 1', 'Magnetic effect of electric current'),
            phLesson('ph-c2-l2', 'Lesson 2', 'Magnetic effect of electric current (continued)'),
            phLesson('ph-c2-l3', 'Lesson 3', 'The magnetic force and torque'),
            phLesson('ph-c2-l4', 'Lesson 4', 'The measuring instruments'),
          ],
        },
        {
          id: 'c3', title: 'Chapter 3: Electromagnetic induction',
          book: { title: 'Chapter 3 Book', url: './pdfs/physics/ph-c3-book.pdf' },
          lessons: [
            phLesson('ph-c3-l1', 'Lesson 1', "Faraday's law and induced EMF in a straight wire"),
            phLesson('ph-c3-l2', 'Lesson 2', 'Mutual induction and self induction'),
            phLesson('ph-c3-l3', 'Lesson 3', 'Electric generator (Dynamo)'),
            phLesson('ph-c3-l4', 'Lesson 4', 'The electric transformer and motor'),
          ],
        },
        {
          id: 'c4', title: 'Chapter 4: Alternating current circuits',
          book: { title: 'Chapter 4 Book', url: './pdfs/physics/ph-c4-book.pdf' },
          lessons: [
            phLesson('ph-c4-l1', 'Lesson 1', 'Alternating current circuits'),
            phLesson('ph-c4-l2', 'Lesson 2', 'AC circuits (continued)'),
            phLesson('ph-c4-l3', 'Lesson 3', 'The oscillating circuit and resonant circuit'),
          ],
        },
      ],
    },
    {
      id: 'modern', title: 'Introduction to Modern Physics', color: 'cyan',
      units: [
        {
          id: 'c5', title: 'Chapter 5: Wave-particle duality',
          book: { title: 'Chapter 5 Book', url: './pdfs/physics/ph-c5-book.pdf' },
          lessons: [
            phLesson('ph-c5-l1', 'Lesson 1', 'Blackbody radiation, thermionic and photoelectric effects'),
            phLesson('ph-c5-l2', 'Lesson 2', 'Compton effect, de Broglie relation & electron microscope'),
          ],
        },
        {
          id: 'c6', title: 'Chapter 6: Atomic spectra',
          book: { title: 'Chapter 6 Book', url: './pdfs/physics/ph-c6-book.pdf' },
          lessons: [
            phLesson('ph-c6-l1', 'Lesson 1', 'Atomic spectra and X-rays'),
          ],
        },
        {
          id: 'c7', title: 'Chapter 7: Laser',
          book: { title: 'Chapter 7 Book', url: './pdfs/physics/ph-c7-book.pdf' },
          lessons: [
            phLesson('ph-c7-l1', 'Lesson 1', 'Laser principles and applications'),
          ],
        },
        {
          id: 'c8', title: 'Chapter 8: Modern electronics',
          book: { title: 'Chapter 8 Book', url: './pdfs/physics/ph-c8-book.pdf' },
          lessons: [
            phLesson('ph-c8-l1', 'Lesson 1', 'Semiconductor crystals and the PN junction'),
            phLesson('ph-c8-l2', 'Lesson 2', 'The transistor, digital and analog electronics'),
          ],
        },
      ],
    },
  ],

  revision: [
    { title: 'Electricity & Electromagnetism revision', items: [
      { id: 'rev-ph-c1', title: 'Chapter 1 revision', unit: 'Chapter 1', type: 'Mixed questions',
        resources: [
          video('Mixed questions', 'https://youtu.be/YXfpdmEX6hg'),
          pdf('Questions PDF', '/Physics/Revision/q1-questions.pdf'),
          pdf('Answers PDF', '/Physics/Revision/a1-answers.pdf'),
          pdf('Chapter 1 Book', '/Physics/Revision/ph-c1-book.pdf'),
        ] },
      { id: 'ph-r01', title: 'Chapter 1: Current and Ohm’s law', unit: 'Chapter 1', type: 'Topic revision', url: '' },
      { id: 'ph-r02', title: 'Chapter 2: Magnetic effects', unit: 'Chapter 2', type: 'Topic revision', url: '' },
      { id: 'ph-r03', title: 'Chapter 3: Electromagnetic induction', unit: 'Chapter 3', type: 'Topic revision', url: '' },
      { id: 'ph-r04', title: 'Chapter 4: AC circuits', unit: 'Chapter 4', type: 'Topic revision', url: '' },
      { id: 'ph-r05', title: 'Mixed electricity questions', unit: 'Unit 1', type: 'Mixed questions', url: '' },
    ]},
    { title: 'Modern Physics revision', items: [
      { id: 'ph-r06', title: 'Chapter 5: Wave-particle duality', unit: 'Chapter 5', type: 'Topic revision', url: '' },
      { id: 'ph-r07', title: 'Chapter 6: Atomic spectra', unit: 'Chapter 6', type: 'Topic revision', url: '' },
      { id: 'ph-r08', title: 'Chapter 7: Laser', unit: 'Chapter 7', type: 'Topic revision', url: '' },
      { id: 'ph-r09', title: 'Chapter 8: Modern electronics', unit: 'Chapter 8', type: 'Topic revision', url: '' },
      { id: 'ph-r10', title: 'Mixed modern physics questions', unit: 'Unit 2', type: 'Mixed questions', url: '' },
    ]},
    { title: 'Final Physics revision', items: [
      { id: 'ph-r11', title: 'Full comprehensive exams', unit: 'All units', type: 'Full exams', url: '' },
      { id: 'ph-r12', title: 'Exam formulas & units review', unit: 'All units', type: 'Formulas', url: '' },
    ]},
  ],
});
