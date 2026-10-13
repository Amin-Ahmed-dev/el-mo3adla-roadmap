// ---------------------------------------------------------------------------
// Daily motivation — Arabic student phrases
// ---------------------------------------------------------------------------
// One phrase per calendar day, picked deterministically:
//   dayIndex (days since epoch, LOCAL calendar) → pool[dayIndex % pool.length]
// Same day → same phrase for every student, on every device. No action needed:
// the card advances on its own at local midnight (component arms a timer +
// listens for cross-tab storage ticks). LocalStorage is only a same-day cache
// so a reopened app never flashes yesterday's phrase mid-rollover.

export const MOTIVATION_POOL = [
  { t: 'فاضل تكة! 💪🏻', b: 'أنت تعبت كتير علشان توصل لهنا، متوقفش قبل ما تحقق اللي بدأت عشانه.' },
  { t: 'تعبك مش هيروح هدر 🤍', b: 'كمّل سعيك، وخلي ثقتك في ربنا وفي نفسك أكبر من خوفك.' },
  { t: 'قربت توصل 🎯', b: 'خطوة كمان، ومحاولة كمان، ومجهود كمان.. أنت أقرب مما تتخيل.' },
  { t: 'متستسلمش دلوقتي 🔥', b: 'متخليش صعوبة الطريق تنسيك جمال الهدف اللي مستنيك في نهايته.' },
  { t: 'النهاية تليق بتعبك ✨', b: 'ادي آخر مرحلة حقها، واجتهد لحد ما تفرح نفسك وتفتخر بمشوارك.' },
  { t: 'قربت توصل، اوعى تقف دلوقتي!', b: 'أنت قطعت مشوار كبير، وآخر شوية صبر هيفرقوا معاك.' },
  { t: 'خطوة أخيرة ممكن تغيّر كل حاجة.', b: 'كمّل للآخر، لأن النهاية تستاهل كل التعب ده.' },
  { t: 'أنت أقرب للنجاح مما تتخيل.', b: 'كل يوم بتجتهد فيه بيقرّبك من هدفك خطوة.' },
  { t: 'فاضل القليل، فشد حيلك!', b: 'ما تبطلش دلوقتي، تعبك مش هيروح هدر.' },
  { t: 'أنت مش بعيد عن حلمك.', b: 'أنت في آخر الطريق، وبعدها هتفتخر بنفسك! ❤️' },
  { t: 'النجاح مش حظ.', b: 'النجاح تعب واستمرار، وكل يوم اجتهاد بيقرّبك من هدفك.' },
  { t: 'مش لازم تكون الأسرع.', b: 'المهم ما تستسلمش، وتعب النهارده هو فخر بكرة.' },
  { t: 'اللي بيكمل رغم الصعوبة هو اللي بيوصل.', b: 'خليك أقوى من لحظة إحباط.' },
  { t: 'مفيش مجهود صادق بيضيع.', b: 'الطريق الصعب بيعلّمك إزاي تبقى أقوى.' },
  { t: 'استمر حتى لو خطواتك بطيئة.', b: 'المهم إنك بتتقدم كل يوم.' },
  { t: 'كافح علشان توصل للحلم اللي بدأت عشانه.', b: 'أنت قدّها، حتى لو الطريق صعب.' },
  { t: 'آمن بنفسك، وادي كل يوم حقه.', b: 'متقللش من نفسك، أنت قادر تعمل أكتر مما تتخيل.' },
  { t: 'يومًا ما هتبص وراك وتفتخر.', b: 'هتفتخر إنك اخترت تكمل بدل ما تستسلم.' },
  { t: 'كل محاولة بتقرّبك من هدفك.', b: 'متقارنش رحلتك بحد، ركّز في طريقك.' },
  { t: 'النجاح محتاج صبر أكتر ما محتاج سرعة.', b: 'خليك فاكر أنت بدأت ليه.' },
  { t: 'حلمك يستاهل إنك تحاول عشانه.', b: 'لسه فيك طاقة تحقق بيها كتير!' },
  { t: 'افتكر حلمك.', b: 'وافتكر كل مرة تعبت فيها علشانه.' },
  { t: 'يمكن تكون تعبت.', b: 'بس متنساش إنك وصلت لحد هنا إزاي.' },
  { t: 'متخليش لحظة ضعف تنسيك.', b: 'كل اللي قدرت تتخطاه يستاهل إنك تكمل.' },
  { t: 'أنت تستحق تفرح بنتيجة تعبك.', b: 'فكمّل، ومهما كان الطريق طويل كل خطوة ليها قيمة.' },
  { t: 'يمكن محدش شايف تعبك.', b: 'بس يوم نجاحك هيكون كفاية.' },
  { t: 'مش مطلوب منك تكون مثالي.', b: 'المطلوب منك تحاول وتستمر.' },
  { t: 'لو وقعت في يوم.', b: 'ارجع تاني في اليوم اللي بعده.' },
  { t: 'خليك فخور بكل مرة اخترت تكمل.', b: 'لسه الحلم ممكن، ولسه تقدر، ولسه فاضل تكة! ✨' },
  { t: 'ذاكر بذكاء مش بكترة.', b: 'ركّز على الفهم والحل، مش على عدد الساعات.' },
  { t: 'المراجعة اليومية تصنع الفرق.', b: 'نص ساعة مراجعة كل يوم أحسن من ليلة كاملة قبل الامتحان.' },
  { t: 'الغلط في التدريب نجاح مؤجل.', b: 'كل سؤال غلطت فيه النهارده مش هتغلط فيه في الامتحان.' },
  { t: 'نظّم وقتك تنجح.', b: 'جدول بسيط تلتزم بيه أحسن من خطة مثالية على الورق.' },
  { t: 'ابدأ بالصعب.', b: 'خلّص أصعب مادة وأنت في كامل تركيزك، والباقي هييجي لوحده.' },
  { t: 'ركّز على نقاط ضعفك.', b: 'الدرس اللي بتتهرب منه هو اللي محتاج منك ساعة زيادة.' },
  { t: 'حل كتير، تفهم أكتر.', b: 'المعادلة بتتحفظ بالحل مش بالقراءة.' },
  { t: 'نام كويس قبل الامتحان.', b: 'عقل مرتاح يفتكر أكتر من عقل مرهق.' },
  { t: 'ثق في تحضيرك.', b: 'أنت ذاكرت وتعبت، ادخل الامتحان وانت واثق إنك قدّها.' },
  { t: 'كل يوم صفحة جديدة.', b: 'امبارح خلص، ركّز في اللي تقدر تعمله النهارده.' },
  { t: 'حلمك يستاهل التعب.', b: 'فاضل تكة وتوصل لحلمك! 💪🏻' },
];

// Back-compat: some older code/tests import plain strings.
export const MOTIVATIONAL_PHRASES = MOTIVATION_POOL.map((p) => `${p.t} — ${p.b}`);

export const MOTIVATION_LEN = MOTIVATION_POOL.length;

/** Local calendar day key, e.g. "2026-10-13". Timezone-safe: uses wall-clock. */
export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Days since epoch on the LOCAL calendar (civil-date serial, DST-proof). */
export function dayIndexFor(d = new Date()) {
  // Howard Hinnant's days_from_civil: consecutive local calendar days always
  // differ by exactly 1, unlike midnight-timestamp division which jumps 0 or 2
  // across daylight-saving transitions.
  let y = d.getFullYear();
  let m = d.getMonth() + 1;
  const day = d.getDate();
  y -= m <= 2 ? 1 : 0;
  const era = Math.floor((y >= 0 ? y : y - 399) / 400);
  const yoe = y - era * 400;
  const mp = m > 2 ? m - 3 : m + 9;
  const doy = Math.floor((153 * mp + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** Deterministic pool index for a given date. */
export function motivationIndexFor(d = new Date()) {
  return ((dayIndexFor(d) % MOTIVATION_LEN) + MOTIVATION_LEN) % MOTIVATION_LEN;
}

/** The {t,b} phrase object for a given date. */
export function motivationForDate(d = new Date()) {
  return MOTIVATION_POOL[motivationIndexFor(d)];
}

/** Milliseconds from now until next local midnight (for the auto-rollover timer). */
export function msUntilMidnight(now = new Date()) {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(1000, next.getTime() - now.getTime());
}
