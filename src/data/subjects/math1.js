import { defineSubject, lesson, video, pdf } from '../helpers.js';

export default defineSubject({
  id: 'math-1',
  title: 'Math 1',
  desc: 'Algebra and solid geometry',
  icon: 'sigma',
  color: 'blue',

  // First thing on the Roadmap tab, before lesson 1.
  basics: {
    title: 'Start with the basics',
    desc: 'Watch this before lesson 1. It covers the core math skills the rest of the course builds on.',
    resources: [
      video('Basics of mathematics skills', 'https://youtu.be/4BUq8tldjyo'),
    ],
  },

  // Last thing on the Roadmap tab, the exam toolkit.
  guide: {
    title: 'How to solve algebra and solid geometry with your calculator',
    desc: 'Learn the calculator shortcuts that save time in the exam. Watch it before you start solving exam papers.',
    url: 'https://youtu.be/NjNmzIfFiJk',
    for: ['Algebra', 'Solid geometry'],
  },

  groups: [
    {
      id: 'algebra', title: 'Algebra', color: 'blue',
      units: [
        {
          id: 'u1', title: 'Binomial theorem',
          lessons: [
            lesson('m1-u1-l1', 'Lesson 1', 'Binomial theorem', {
              learn: [
                video('Prerequisite: permutation and combination', 'https://youtu.be/FE80r5TyIIU', 'rec'),
                video('Part 1', 'https://youtu.be/3wP7HBih_j4'),
                video('Part 2', 'https://youtu.be/P1Bsn3nJELw'),
                video('Important trick: reduction, part 3', 'https://youtu.be/HcqbZlATQmM', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-1/m1-u1-l1.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/Oj6fl10-TBI'),
                video('School book', 'https://youtu.be/8jGoTyD4EPc'),
              ],
              practice: [pdf('Practice book', './pdfs/math-1/m1-u1-l1-practice.pdf')],
            }),
            lesson('m1-u1-l2', 'Lesson 2', 'Term free of x', {
              learn: [video('Explanation', 'https://youtu.be/WnVWTP3kQfc')],
              notes: [pdf('Explanation book', './pdfs/math-1/m1-u1-l2.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/Kk9iNs0yQ3Y'),
                video('School book', 'https://youtu.be/QUS8RALVa7I'),
              ],
              practice: [pdf('Practice book', './pdfs/math-1/m1-u1-l2-practice.pdf')],
            }),
            lesson('m1-u1-l3', 'Lesson 3', 'Ratio between consecutive terms and greatest term', {
              learn: [
                video('Ratio between two consecutive terms', 'https://youtu.be/kiiKruXlIJY'),
                video('Greatest term, part 1 (explanation and solving)', 'https://youtu.be/NrXjQlD2vwk'),
                video('Greatest term, part 2', 'https://youtu.be/rK3K7uttolo'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-1/m1-u1-l3.pdf')],
              solve: [
                video('Ratio between two terms, Egypt exams', 'https://youtu.be/seh0IU9XjOk'),
                video('Greatest term, part 1 (explanation and solving)', 'https://youtu.be/NrXjQlD2vwk'),
                video('Greatest term, part 2', 'https://youtu.be/rK3K7uttolo'),
              ],
              practice: [pdf('Practice book', './pdfs/math-1/m1-u1-l3-practice.pdf')],
            }),
          ],
        },
        {
          id: 'u2', title: 'Complex numbers',
          lessons: [
            lesson('m1-u2-l1', 'Lessons 1 and 2', 'Trigonometric and exponential forms', {
              learn: [
                video('Prerequisite: introduction to complex numbers', 'https://youtu.be/rOU6C2_BNQs', 'rec'),
                video('Part 1', 'https://youtu.be/euHmKt7-GG8'),
                video('Part 2', 'https://youtu.be/WKvzA1LZeXM'),
                video('Important tricks, part 3', 'https://youtu.be/frEpw1lx4HQ', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-1/m1-u2-l1.pdf')],
              solve: [
                video('Trigonometric form, Egypt exams', 'https://youtu.be/fF1DX4__pUE'),
                video('Trigonometric form, school book, part 1', 'https://youtu.be/LB4NpFT_j5Q'),
                video('Trigonometric form, school book, part 2', 'https://youtu.be/_JrQ8sX1Bko'),
                video('Exponential form, Egypt exams', 'https://youtu.be/-fFfWFBA-A4'),
              ],
              practice: [pdf('Practice book', './pdfs/math-1/m1-u2-l1-practice.pdf')],
            }),
            lesson('m1-u2-l3', 'Lesson 3', 'De Moivre theorem', {
              learn: [video('Explanation', 'https://youtu.be/1WlbrQEAU00')],
              notes: [pdf('Explanation book', './pdfs/math-1/m1-u2-l3.pdf')],
              solve: [video('Egypt exams', 'https://youtu.be/rPfZfXv2jZ4')],
              practice: [pdf('Practice book', './pdfs/math-1/m1-u2-l3-practice.pdf')],
            }),
            lesson('m1-u2-l4', 'Lesson 4', 'Omega, the cubic roots of unity', {
              learn: [
                video('Part 1', 'https://youtu.be/YE-UUfAs9mI'),
                video('Part 2, with important notes', 'https://youtu.be/oU-x_zpmMus'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-1/m1-u2-l4.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/dbh7GnCecag'),
                video('School book', 'https://youtu.be/yKwXP19DZxc'),
              ],
              practice: [pdf('Practice book', './pdfs/math-1/m1-u2-l4-practice.pdf')],
            }),
          ],
        },
      ],
    },
    {
      id: 'geometry', title: 'Solid geometry', color: 'cyan',
      units: [
        {
          id: 'u3', title: 'Coordinates and vectors in space',
          lessons: [
            lesson('m1-u3-l1', 'Lesson 1', '3D coordinate system', {
              learn: [video('Explanation', 'https://youtu.be/JKvSkuFFlEY')],
              notes: [pdf('Explanation book', './pdfs/math-1/m1-u3-l1.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/DfUsDY6DiUU'),
                video('School book', 'https://youtu.be/jmMQ4kE41xs'),
              ],
              practice: [pdf('Practice book', './pdfs/math-1/m1-u3-l1-practice.pdf')],
            }),
            lesson('m1-u3-l2', 'Lesson 2', 'Vectors in space', {
              learn: [
                video('Explanation', 'https://youtu.be/uy0-sugJPPE'),
                video('Alternative explanation', 'https://youtu.be/oUZvZraPtIY', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-1/m1-u3-l2.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/jAef-pEaI7k'),
                video('School book', 'https://youtu.be/xdqYbb4RHFA'),
              ],
              practice: [pdf('Practice book', './pdfs/math-1/m1-u3-l2-practice.pdf')],
            }),
            lesson('m1-u3-l3', 'Lesson 3', 'Scalar product', {
              learn: [
                video('Explanation', 'https://youtu.be/zpWCyHXDuLQ'),
                video('Alternative explanation', 'https://youtu.be/FNkQTd3jRbI', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-1/m1-u3-l3.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/GSvSUeqqQDk'),
                video('School book', 'https://youtu.be/Q0tuJYMLaic'),
              ],
              practice: [pdf('Practice book', './pdfs/math-1/m1-u3-l3-practice.pdf')],
            }),
            lesson('m1-u3-l4', 'Lesson 4', 'Vector product and scalar triple product', {
              learn: [
                video('Prerequisite: Determinants (Algebra)', 'https://youtu.be/x97RLEAVt6g', 'rec'),
                video('Explanation', 'https://youtu.be/LaN6Gqmr4gA'),
                video('Alternative explanation', 'https://youtu.be/_Wuz8at3juo', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-1/m1-u3-l4.pdf')],
              solve: [video('Solving', 'https://youtu.be/qe5Y3rTfgqs')],
              practice: [pdf('Practice book', './pdfs/math-1/m1-u3-l4-practice.pdf')],
            }),
          ],
        },
        {
          id: 'u4', title: 'Lines and planes in space',
          lessons: [
            lesson('m1-u4-l1', 'Lesson 1', 'Equation of a straight line in space', {
              learn: [
                video('Part 1', 'https://youtu.be/-n8vrFfldzw'),
                video('Part 2', 'https://youtu.be/4UDHNwByD_A'),
                video('Alternative explanation, summary part 1', 'https://youtu.be/T3UP7SWY5K4', 'rec'),
                video('Alternative explanation, summary part 2', 'https://youtu.be/l3Lqe1dPPVo', 'rec'),
                video('Alternative explanation (Zatoona)', 'https://youtu.be/nyRJr9nchqA', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-1/m1-u4-l1.pdf')],
              solve: [
                video('Solving, part 1', 'https://youtu.be/0suAWIx5p3M'),
                video('Solving, part 2', 'https://youtu.be/PRhIpI-2scg'),
              ],
              practice: [pdf('Practice book', './pdfs/math-1/m1-u4-l1-practice.pdf')],
            }),
            lesson('m1-u4-l2', 'Lesson 2', 'Equation of a plane in space', {
              learn: [
                video('Part 1', 'https://youtu.be/slSsCEGqke4'),
                video('Alternative explanation, part 1', 'https://youtu.be/sJ7ptMGJqhs', 'rec'),
                video('Alternative explanation, summary continued', 'https://youtu.be/-rftK4guyjY', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-1/m1-u4-l2.pdf')],
              solve: [
                video('Solving, part 1', 'https://youtu.be/XqFEfTbvbX4'),
                video('Solving, part 2', 'https://youtu.be/mWMV4rcXAAo'),
                video('Solving, part 3', 'https://youtu.be/MO8EEkD1ZwA'),
              ],
              practice: [pdf('Practice book', './pdfs/math-1/m1-u4-l2-practice.pdf')],
            }),
            lesson('m1-u4-l3', 'Lesson 3', 'Relative positions of two planes', {
              learn: [video('Explanation', 'https://youtu.be/-BfdSm3gft8')],
              notes: [pdf('Explanation book', './pdfs/math-1/m1-u4-l3.pdf')],
              solve: [video('Solving', 'https://youtu.be/LlEmoeUyxz8')],
              practice: [pdf('Practice book', './pdfs/math-1/m1-u4-l3-practice.pdf')],
            }),
          ],
        },
      ],
    },
  ],

  revision: [
    { title: 'Algebra revision', items: [
      { id: 'r01', title: 'Binomial theorem', unit: 'Unit 1', type: 'Topic revision', url: '' },
      { id: 'r02', title: 'Complex numbers', unit: 'Unit 2', type: 'Topic revision', url: '' },
      { id: 'r03', title: 'Mixed questions', unit: 'Units 1 and 2', type: 'Mixed questions', url: '' },
      { id: 'r04', title: 'Previous exams', unit: 'Units 1 and 2', type: 'Previous exams', url: '' },
    ]},
    { title: 'Solid geometry revision', items: [
      { id: 'r05', title: 'Coordinate system', unit: 'Unit 3', type: 'Topic revision', url: '' },
      { id: 'r06', title: 'Vectors', unit: 'Unit 3', type: 'Topic revision', url: '' },
      { id: 'r07', title: 'Scalar product', unit: 'Unit 3', type: 'Topic revision', url: '' },
      { id: 'r08', title: 'Vector product', unit: 'Unit 3', type: 'Topic revision', url: '' },
      { id: 'r09', title: 'Straight line', unit: 'Unit 4', type: 'Topic revision', url: '' },
      { id: 'r10', title: 'Plane', unit: 'Unit 4', type: 'Topic revision', url: '' },
      { id: 'r11', title: 'Relative positions', unit: 'Unit 4', type: 'Topic revision', url: '' },
    ]},
    { title: 'Final Math 1 revision', items: [
      { id: 'r12', title: 'Algebra mixed questions', unit: 'Units 1 and 2', type: 'Mixed questions', url: '' },
      { id: 'r13', title: 'Solid geometry mixed questions', unit: 'Units 3 and 4', type: 'Mixed questions', url: '' },
      { id: 'r14', title: 'Full exams', unit: 'All units', type: 'Full exams', url: '' },
      { id: 'r15', title: 'Calculator practice', unit: 'All units', type: 'Calculator practice', url: '' },
    ]},
  ],
});
