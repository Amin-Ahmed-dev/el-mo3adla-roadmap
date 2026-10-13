import { defineSubject, lesson, video, pdf } from '../helpers.js';

export default defineSubject({
  id: 'math-2',
  title: 'Math 2',
  desc: 'Differentiation and integration (Calculus)',
  icon: 'sigma',
  color: 'purple',

  // First thing on the Roadmap tab, before lesson 1.
  basics: {
    title: 'Start with the basics',
    desc: 'Watch these core foundation videos before starting Unit 1. They cover essential mathematical skills and the history of calculus.',
    resources: [
      video('Basics of mathematics skills', 'https://youtu.be/4BUq8tldjyo'),
      video('Calculus | History of calculus', 'https://youtu.be/l4UtwoHtTK4'),
    ],
  },

  // Last thing on the Roadmap tab, the exam toolkit.
  guide: {
    title: 'How to solve calculus with your calculator',
    desc: 'Learn how to solve differentiation and integration exam questions with your calculator to save time in the exam.',
    url: 'https://youtu.be/TwZARt-mFN8',
    for: ['Differentiation', 'Integration'],
  },

  groups: [
    {
      id: 'differentiation', title: 'Differentiation', color: 'purple',
      units: [
        {
          id: 'u1', title: 'Differentiation and its applications',
          lessons: [
            lesson('m2-u1-l0', 'Prerequisite', 'Differentiation of trigonometric functions', {
              learn: [
                video('Differentiation of trig functions', 'https://youtu.be/0Pi4NhieH7E'),
                video('Derivative of trigonometric function (alternative)', 'https://youtu.be/M1Q6xOwo5Rk', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u1-pre.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/NDu3f-lWPdU'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u1-pre-practice.pdf')],
            }),
            lesson('m2-u1-l1', 'Lesson 1', 'Implicit and parametric differentiation', {
              learn: [
                video('Implicit differentiation', 'https://youtu.be/H_mjgyhd3FE'),
                video('Parametric differentiation (chain rule)', 'https://youtu.be/kIWxAts0NpQ'),
                video('Alternative explanation: implicit differentiation', 'https://youtu.be/YmoiCUnY5dM', 'rec'),
                video('Alternative explanation: parametric differentiation', 'https://youtu.be/3NfaTjhOExs', 'rec'),
                video('Alternative explanation: implicit and parametric', 'https://youtu.be/3NsVIEb4JCQ', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u1-l1.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/a9nZo1tnwRw'),
                video('Implicit differentiation, school book', 'https://youtu.be/wOKqswR49I0'),
                video('Parametric differentiation, school book', 'https://youtu.be/ERfmAXrMnDg'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u1-l1-practice.pdf')],
            }),
            lesson('m2-u1-l2', 'Lesson 2', 'Higher derivatives of the function', {
              learn: [
                video('Explanation', 'https://youtu.be/WenimchS1qo'),
                video('Alternative explanation', 'https://youtu.be/IRRKNI4no3s', 'rec'),
                video('Alternative explanation: higher derivatives', 'https://youtu.be/SWgDZOyEj1Q', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u1-l2.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/g20HUhNaB_w'),
                video('School book', 'https://youtu.be/1S07DYQJpyQ'),
                video('Higher derivatives + parametric differentiation', 'https://youtu.be/Cczy0gflLE0', 'rec'),
                video('Nth derivative (part 1: trig functions)', 'https://youtu.be/J9DYjLIB5Jk', 'rec'),
                video('Nth derivative (part 2: polynomial functions)', 'https://youtu.be/7KsAKXaSjP0', 'rec'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u1-l2-practice.pdf')],
            }),
            lesson('m2-u1-l3', 'Lesson 3', 'Derivatives of exponential and logarithmic functions', {
              learn: [
                video('Derivatives of exponential functions', 'https://youtu.be/AhxTdzywL0s'),
                video('Derivatives of logarithmic functions', 'https://youtu.be/gu1aTD6hJYs'),
                video('Logarithmic differentiation', 'https://youtu.be/6aBlzL9s11s', 'rec'),
                video('Alternative explanation: exp and log differentiation', 'https://youtu.be/na8NSCgOfNI', 'rec'),
                video('Alternative explanation: derivatives of log and exp', 'https://youtu.be/wzzE-IjygOU', 'rec'),
                video('Equations of tangent and normal (explanation & solving)', 'https://youtu.be/0pNn_nEs7FQ'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u1-l3.pdf')],
              solve: [
                video('Egypt exams, part 1', 'https://youtu.be/Vh5B2xWzPLE'),
                video('Egypt exams, part 2', 'https://youtu.be/4NXrdJJDmAs'),
                video('Egypt exams, part 3', 'https://youtu.be/iO9J1lCaICc'),
                video('School book, part 1', 'https://youtu.be/jcTZndfL-z4'),
                video('School book, part 2', 'https://youtu.be/0U6N6ciXi64'),
                video('School book, part 3', 'https://youtu.be/FFW4V474V60'),
                video('School book, part 4', 'https://youtu.be/9jW0mDxByKk'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u1-l3-practice.pdf')],
            }),
            lesson('m2-u1-l4', 'Lesson 4', 'Related time rates', {
              learn: [
                video('Summary and questions', 'https://youtu.be/LCW9s-dE5is'),
                video('Alternative explanation', 'https://youtu.be/FpkjOu3d2jQ', 'rec'),
                video('Alternative explanation and solving', 'https://youtu.be/hYRaKOxHd0Y', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u1-l4.pdf')],
              solve: [
                video('Egypt exams, part 1', 'https://youtu.be/DPVFGUsL-lA'),
                video('Egypt exams, part 2', 'https://youtu.be/xAmZqLcdToU'),
                video('Important and hard questions, part 3', 'https://youtu.be/9iNwb2TCpZI', 'rec'),
                video('Ladders and shadows questions, part 4', 'https://youtu.be/7ObIR92ABsE', 'rec'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u1-l4-practice.pdf')],
            }),
          ],
        },
        {
          id: 'u2', title: 'Behavior of the function and curve sketching',
          lessons: [
            lesson('m2-u2-l1', 'Lesson 1', 'Increasing and decreasing functions & critical points', {
              learn: [
                video('Summary', 'https://youtu.be/egXuy0DkWgs'),
                video('Alternative explanation', 'https://youtu.be/uB8UaoWhca4', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u2-l1.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/J3SP0anWTC8'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u2-l1-practice.pdf')],
            }),
            lesson('m2-u2-l2', 'Lesson 2', 'Local maxima and minima', {
              learn: [
                video('Summary rules', 'https://youtu.be/Bv009BeLagk'),
                video('Alternative explanation', 'https://youtu.be/jToTyCByF98', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u2-l2.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/DhP0h5P-Sr0'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u2-l2-practice.pdf')],
            }),
            lesson('m2-u2-l3', 'Lesson 3', 'Absolute maxima and minima', {
              learn: [
                video('Summary rules', 'https://youtu.be/XN-C0AtlBsY'),
                video('Alternative explanation', 'https://youtu.be/PpP_A8YGKxY', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u2-l3.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/OQivrxvqcIY'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u2-l3-practice.pdf')],
            }),
            lesson('m2-u2-l4', 'Lesson 4', 'Convexity of curves and inflection points', {
              learn: [
                video('Explanation', 'https://youtu.be/H5-wTw1MFVA'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u2-l4.pdf')],
              solve: [
                video('Solving unit 2 on convexity & inflection points', 'https://youtu.be/L-rKjWbB9Y4'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u2-l4-practice.pdf')],
            }),
            lesson('m2-u2-l5', 'Lesson 5', 'Curve sketching', {
              learn: [
                video('Explanation', 'https://youtu.be/SFTEydKnkDQ'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u2-l5.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/ewk2oSa06PA'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u2-l5-practice.pdf')],
            }),
            lesson('m2-u2-l6', 'Lesson 6', 'Applications of maxima and minima', {
              learn: [
                video('Summary', 'https://youtu.be/5ctZK_juGF4'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u2-l6.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/lHss8Xrm84g'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u2-l6-practice.pdf')],
            }),
          ],
        },
      ],
    },
    {
      id: 'integration', title: 'Integration', color: 'rose',
      units: [
        {
          id: 'u3', title: 'The definite integral and its applications',
          lessons: [
            lesson('m2-u3-l1', 'Lesson 1', 'Integration of exponential and logarithmic functions', {
              learn: [
                video('Prerequisite: basics of integration', 'https://youtu.be/-w8WbUzANEA', 'rec'),
                video('Integration of exponential & log functions', 'https://youtu.be/O1XIw3NFZuU'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u3-l1.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/fOA5sWTn67k'),
                video('School book', 'https://youtu.be/6D8XpGOu4Kg'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u3-l1-practice.pdf')],
            }),
            lesson('m2-u3-l2', 'Lesson 2', 'Methods of integration (by substitution & by parts)', {
              learn: [
                video('Integration by substitution & by parts', 'https://youtu.be/TEGHPPvtZog'),
                video('Integration of trigonometric functions', 'https://youtu.be/LKSGRZeFgK0'),
                video('Alternative explanation: methods of integration', 'https://youtu.be/WZpgvyc4sWY', 'rec'),
                video('Alternative explanation: follow methods of integration', 'https://youtu.be/iLgO-Rt9xY8', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u3-l2.pdf')],
              solve: [
                video('Substitution & by parts, Egypt exams', 'https://youtu.be/bEMV7AriECY'),
                video('Substitution & by parts, school book', 'https://youtu.be/zhfFFjZD4FI'),
                video('Trigonometric functions, Egypt exams', 'https://youtu.be/XdBU9nH11NI'),
                video('Trigonometric functions, school book', 'https://youtu.be/Rn6GTBE8uEI'),
                video('Revision on integration (important questions & notes)', 'https://youtu.be/tlODAAQ09hw', 'rec'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u3-l2-practice.pdf')],
            }),
            lesson('m2-u3-l3', 'Lesson 3', 'The definite integral', {
              learn: [
                video('Explanation', 'https://youtu.be/7puCr2SVFl8'),
                video('Alternative explanation', 'https://youtu.be/f9O3QomhdUs', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u3-l3.pdf')],
              solve: [
                video('Egypt exams', 'https://youtu.be/elpkuvyByD0'),
                video('School book', 'https://youtu.be/EpjkUB5lkig'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u3-l3-practice.pdf')],
            }),
            lesson('m2-u3-l4', 'Lesson 4', 'Applications of definite integral (areas & volumes)', {
              learn: [
                video('Areas using integration', 'https://youtu.be/VJt34y9M9hA'),
                video('How to draw curves for area problems', 'https://youtu.be/LJxzmbFqKuE', 'rec'),
                video('Volumes of revolution solids', 'https://youtu.be/TKucJ8UUWjs'),
                video('Alternative explanation: areas in the plane', 'https://youtu.be/m15Cwh-rYUc', 'rec'),
                video('Alternative explanation: volumes of revolution solids', 'https://youtu.be/ho8E36pxe3Y', 'rec'),
              ],
              notes: [pdf('Explanation book', './pdfs/math-2/m2-u3-l4.pdf')],
              solve: [
                video('Areas, Egypt exams', 'https://youtu.be/5TJarGg6KtI'),
                video('Areas, school book', 'https://youtu.be/CjVXAfhtTik'),
                video('Volumes, Egypt exams', 'https://youtu.be/_zUQbSth454'),
                video('Volumes, school book', 'https://youtu.be/cyI89F2Xq2s'),
              ],
              practice: [pdf('Practice book', './pdfs/math-2/m2-u3-l4-practice.pdf')],
            }),
          ],
        },
      ],
    },
  ],

  revision: [
    { title: 'Differentiation revision', items: [
      { id: 'm2-r01', title: 'Trigonometric differentiation', unit: 'Unit 1', type: 'Topic revision', url: '' },
      { id: 'm2-r02', title: 'Implicit & parametric differentiation', unit: 'Unit 1', type: 'Topic revision', url: '' },
      { id: 'm2-r03', title: 'Higher derivatives', unit: 'Unit 1', type: 'Topic revision', url: '' },
      { id: 'm2-r04', title: 'Exponential & logarithmic derivatives', unit: 'Unit 1', type: 'Topic revision', url: '' },
      { id: 'm2-r05', title: 'Related time rates', unit: 'Unit 1', type: 'Topic revision', url: '' },
      { id: 'm2-r06', title: 'Increasing, decreasing & critical points', unit: 'Unit 2', type: 'Topic revision', url: '' },
      { id: 'm2-r07', title: 'Local & absolute extrema', unit: 'Unit 2', type: 'Topic revision', url: '' },
      { id: 'm2-r08', title: 'Convexity, inflection & curve sketching', unit: 'Unit 2', type: 'Topic revision', url: '' },
      { id: 'm2-r09', title: 'Optimization applications', unit: 'Unit 2', type: 'Topic revision', url: '' },
    ]},
    { title: 'Integration revision', items: [
      { id: 'm2-r10', title: 'Exponential & log integration', unit: 'Unit 3', type: 'Topic revision', url: '' },
      { id: 'm2-r11', title: 'Integration by substitution & by parts', unit: 'Unit 3', type: 'Topic revision', url: '' },
      { id: 'm2-r12', title: 'Trigonometric integration', unit: 'Unit 3', type: 'Topic revision', url: '' },
      { id: 'm2-r13', title: 'The definite integral', unit: 'Unit 3', type: 'Topic revision', url: '' },
      { id: 'm2-r14', title: 'Areas & volumes of revolution', unit: 'Unit 3', type: 'Topic revision', url: '' },
    ]},
    { title: 'Final Math 2 revision', items: [
      { id: 'm2-r15', title: 'Calculus full exams & calculator shortcuts', unit: 'All units', type: 'Full exams', url: '' },
    ]},
  ],
});
