/**
 * HOW TO ADD A SUBJECT
 *  1. Copy this file to src/data/subjects/<name>.js and fill it in.
 *  2. Import it in src/data/subjects/index.js and add it to the list (the order is the order in the menu).
 *  3. Run `npm run check` to catch mistakes, then push.
 *
 * Rules
 *  - Every lesson id and revision id must be unique across ALL subjects. Prefix with the subject, e.g. 'ph-u1-l1'.
 *    Never change an id after students have started: their progress is stored under it.
 *  - Leave a link as '' until you have it. The site shows "Link coming soon".
 *  - Groups (colour bands) hold units, units hold lessons. Use one group if you do not need the split.
 */
import { defineSubject, lesson, video, pdf } from '../helpers.js';

export default defineSubject({
  id: 'physics',            // used in the URL: #/physics
  title: 'Physics',
  desc: 'Mechanics and electricity',
  icon: 'atom',             // sigma | atom | flask | book
  color: 'orange',          // blue | cyan | orange | purple | rose

  // Optional. Shown FIRST on the Roadmap tab, before lesson 1. Keep one video or two. Delete the block to hide it.
  basics: {
    title: 'Start with the basics',
    desc: 'Watch this before lesson 1.',
    resources: [video('Basics, part 1', 'https://youtu.be/yyyy')],
  },

  // Optional. Shown LAST on the Roadmap tab as the "exam toolkit". Use null to hide it.
  // `for` adds small chips such as the parts of the subject the guide is useful for.
  guide: {
    title: 'How to use your calculator in the exam',
    desc: 'The shortcuts that save time. Watch it before you start solving exam papers.',
    url: '',
    for: ['Mechanics'],
  },

  groups: [
    {
      id: 'mechanics', title: 'Mechanics', color: 'orange',
      units: [
        {
          id: 'u1', title: 'Motion',
          lessons: [
            lesson('ph-u1-l1', 'Lesson 1', 'Velocity and acceleration', {
              learn:    [video('Part 1', 'https://youtu.be/xxxx')],
              notes:    [pdf('Notes', 'https://example.com/notes.pdf')],
              solve:    [video('Exam questions', '')],
              practice: [pdf('Practice book', '')],
            }),
            lesson('ph-u1-l2', 'Lesson 2', 'Free fall'),   // no resources yet: placeholders
          ],
        },
      ],
    },
  ],

  revision: [
    { title: 'Mechanics revision', items: [
      { id: 'ph-r01', title: 'Motion', unit: 'Unit 1', type: 'Topic revision', url: '' },
    ]},
  ],
});
