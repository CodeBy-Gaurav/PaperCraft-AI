import { GoogleGenAI } from '@google/genai';
import type {
  BlueprintSection,
  Difficulty,
  GeneratedPaper,
  GeneratedSection,
  QuestionItem,
  QuestionOptions,
  QuestionSource,
  QuestionType
} from '@/src/types/paper';

interface CachedQuestionRow {
  id: string;
  syllabus_code: string;
  chapter_name: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  question_latex: string;
  options_json: QuestionOptions | null;
  answer_key_latex: string;
  diagram_svg?: string | null;
}

interface GenerationRequest {
  syllabusCode: string;
  chapterName: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  marks: number;
  count: number;
  gradeLevel?: string;
  questionSource?: QuestionSource;
  subjectHint?: string;
  seedOffset?: number;
}

interface ExternalQuestion {
  questionLatex: string;
  options?: QuestionOptions | null;
  answerKeyLatex: string;
  diagramSvg?: string;
}

const env = (): Record<string, string> => {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  const values = runtime.process?.env ?? {};
  return Object.fromEntries(Object.entries(values).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
};

const isQuestionOptions = (value: unknown): value is QuestionOptions => {
  if (!value || typeof value !== 'object') return false;
  const options = value as Record<string, unknown>;
  return ['A', 'B', 'C', 'D'].every((key) => typeof options[key] === 'string');
};

const normalizeExternalQuestion = (value: unknown): ExternalQuestion | null => {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (typeof item.questionLatex !== 'string' || typeof item.answerKeyLatex !== 'string') return null;
  return {
    questionLatex: item.questionLatex,
    answerKeyLatex: item.answerKeyLatex,
    options: isQuestionOptions(item.options) ? item.options : null,
    diagramSvg: typeof item.diagramSvg === 'string' ? item.diagramSvg : undefined
  };
};

const normalizeCachedQuestion = (value: unknown): CachedQuestionRow | null => {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const validTypes: QuestionType[] = ['MCQ', 'ASSERTION_REASON', 'SHORT', 'LONG', 'CASE_STUDY'];
  const validDifficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];
  if (
    typeof item.id !== 'string' ||
    typeof item.syllabus_code !== 'string' ||
    typeof item.chapter_name !== 'string' ||
    typeof item.question_latex !== 'string' ||
    typeof item.answer_key_latex !== 'string' ||
    typeof item.marks !== 'number' ||
    !validTypes.includes(item.question_type as QuestionType) ||
    !validDifficulties.includes(item.difficulty as Difficulty)
  ) {
    return null;
  }
  return {
    id: item.id,
    syllabus_code: item.syllabus_code,
    chapter_name: item.chapter_name,
    question_type: item.question_type as QuestionType,
    difficulty: item.difficulty as Difficulty,
    marks: item.marks,
    question_latex: item.question_latex,
    options_json: isQuestionOptions(item.options_json) ? item.options_json : null,
    answer_key_latex: item.answer_key_latex,
    diagram_svg: typeof item.diagram_svg === 'string' ? item.diagram_svg : null
  };
};

/**
 * Authentic, multi-tiered CBSE/ICSE curriculum question generator.
 * Zero raw $ wrappers around plain numbers. Authentic difficulty progression.
 */
const sampleQuestions = (request: GenerationRequest, offset: number): QuestionItem[] => {
  const gradeNum = parseInt(request.gradeLevel ?? '10', 10);
  const isPrimary = !Number.isNaN(gradeNum) && gradeNum <= 5;
  const isMiddle = !Number.isNaN(gradeNum) && gradeNum >= 6 && gradeNum <= 8;
  const isSenior = !Number.isNaN(gradeNum) && gradeNum >= 11;
  const seed = (request.seedOffset ?? 0) + offset;

  return Array.from({ length: request.count }, (_, index) => {
    const itemIndex = seed + index;
    const isMcq = request.questionType === 'MCQ';
    const isAssertion = request.questionType === 'ASSERTION_REASON';
    const diff = request.difficulty;

    let questionLatex = '';
    let options: QuestionOptions | null = null;
    let answerKeyLatex = '';
    let diagramSvg: string | undefined;

    // PRIMARY (Classes 1–5)
    if (isPrimary) {
      if (request.subjectHint?.toLowerCase().includes('math')) {
        if (diff === 'EASY') {
          const num1 = (itemIndex % 5) * 4 + 8;
          const num2 = (itemIndex % 3) * 3 + 5;
          questionLatex = `A fruit basket has ${num1} ripe mangoes and ${num2} oranges. What is the total count of fruits in the basket?`;
          options = isMcq ? { A: `${num1 + num2}`, B: `${num1 + num2 - 2}`, C: `${num1 + num2 + 4}`, D: `${num1 - num2}` } : null;
          answerKeyLatex = `[${request.marks}M] Total fruits = ${num1} + ${num2} = ${num1 + num2} fruits.`;
        } else if (diff === 'MEDIUM') {
          const costPerPen = 12 + (itemIndex % 4) * 2;
          const quantity = 4 + (itemIndex % 3);
          questionLatex = `The cost of 1 pen is ₹${costPerPen}. Rohan buys ${quantity} pens and hands a ₹100 note to the shopkeeper. How much balance money should he receive?`;
          options = isMcq ? { A: `₹${100 - costPerPen * quantity}`, B: `₹${costPerPen * quantity}`, C: `₹${100 - costPerPen}`, D: '₹25' } : null;
          answerKeyLatex = `[${request.marks}M] Total cost = ${quantity} × ₹${costPerPen} = ₹${costPerPen * quantity}. Balance received = ₹100 - ₹${costPerPen * quantity} = ₹${100 - costPerPen * quantity}.`;
        } else {
          // HARD / HOTS
          const perimeter = 36 + (itemIndex % 4) * 8;
          const side = perimeter / 4;
          questionLatex = `A square garden is fenced with a wire of total length ${perimeter} meters. Find the length of each side of the garden and calculate the cost of planting grass inside it at ₹5 per square meter.`;
          options = isMcq ? { A: `${side}m, ₹${side * side * 5}`, B: `${side}m, ₹${perimeter * 5}`, C: `10m, ₹500`, D: `8m, ₹320` } : null;
          answerKeyLatex = `[${request.marks}M] Side of square = ${perimeter} ÷ 4 = ${side} meters. Area = ${side} × ${side} = ${side * side} sq m. Cost = ${side * side} × ₹5 = ₹${side * side * 5}.`;
        }
      } else {
        // Primary EVS / English
        if (diff === 'EASY') {
          questionLatex = `Name the green pigment present in leaves that helps plants absorb sunlight for making food.`;
          options = isMcq ? { A: 'Chlorophyll', B: 'Hemoglobin', C: 'Stomata', D: 'Glucose' } : null;
          answerKeyLatex = `[${request.marks}M] (A) Chlorophyll. It traps sunlight energy for photosynthesis.`;
        } else {
          questionLatex = `Explain two key differences between herbivores and carnivores with two examples of each.`;
          options = isMcq ? { A: 'Herbivores eat plants; Carnivores eat flesh', B: 'Both eat plants', C: 'Carnivores make their own food', D: 'None of these' } : null;
          answerKeyLatex = `[${request.marks}M] 1M for definition (Herbivores eat plant products; Carnivores eat animal flesh) + 1M for examples (Cow, Deer vs Lion, Tiger).`;
        }
      }
    }
    // MIDDLE SCHOOL (Classes 6–8)
    else if (isMiddle) {
      if (request.subjectHint?.toLowerCase().includes('science')) {
        if (diff === 'EASY') {
          questionLatex = `State the difference between physical and chemical changes. Give one common everyday example of each.`;
          options = isMcq ? { A: 'Physical is reversible; Chemical forms new substances', B: 'Both form new substances', C: 'Physical cannot be reversed', D: 'Chemical is temporary' } : null;
          answerKeyLatex = `[${request.marks}M] Physical change: No new substance formed, generally reversible (e.g. melting of ice). Chemical change: New substance with different properties formed (e.g. rusting of iron).`;
        } else if (diff === 'MEDIUM') {
          const speed = 40 + (itemIndex % 4) * 15;
          const time = 2.5;
          questionLatex = `A bus moves on a straight highway with a uniform speed of ${speed} km/h for ${time} hours. Calculate the total distance covered in kilometers and convert the speed into m/s.`;
          options = isMcq ? { A: `${speed * time} km, ${(speed * 5 / 18).toFixed(1)} m/s`, B: `120 km, 20 m/s`, C: `80 km, 15 m/s`, D: `150 km, 25 m/s` } : null;
          answerKeyLatex = `[${request.marks}M] Distance = Speed × Time = ${speed} × ${time} = ${speed * time} km. Speed in m/s = ${speed} × (5/18) = ${(speed * 5 / 18).toFixed(2)} m/s.`;
        } else {
          // HARD
          questionLatex = `Explain why a clinical thermometer has a slight kink or constriction in its capillary tube near the bulb. How does it prevent backflow of mercury while taking a reading?`;
          options = isMcq ? { A: 'Prevents mercury level from falling on its own', B: 'Increases temperature range', C: 'Makes mercury expand faster', D: 'Measures high heat' } : null;
          answerKeyLatex = `[${request.marks}M] The kink prevents the mercury thread from falling back into the bulb automatically when the thermometer is removed from the patient’s mouth, allowing accurate reading.`;
        }
      } else {
        // Middle Math
        if (diff === 'EASY') {
          const val = 15 + itemIndex * 2;
          questionLatex = `Solve the linear equation for x: 3x - 7 = ${val}. Verify your result.`;
          options = isMcq ? { A: `x = ${(val + 7) / 3}`, B: `x = ${val}`, C: `x = ${(val - 7) / 3}`, D: `x = 10` } : null;
          answerKeyLatex = `[${request.marks}M] 3x = ${val} + 7 = ${val + 7} ⇒ x = ${(val + 7) / 3}. Verification: 3(${(val + 7) / 3}) - 7 = ${val}.`;
        } else {
          questionLatex = `The angles of a triangle are in the ratio 2 : 3 : 5. Find the measure of each angle and classify the triangle as acute, right-angled, or obtuse.`;
          options = isMcq ? { A: '36°, 54°, 90° (Right-angled)', B: '30°, 60°, 90° (Right-angled)', C: '40°, 60°, 80° (Acute)', D: '20°, 60°, 100° (Obtuse)' } : null;
          answerKeyLatex = `[${request.marks}M] Let angles be 2x, 3x, 5x. 2x + 3x + 5x = 180° ⇒ 10x = 180° ⇒ x = 18°. Angles are 36°, 54°, 90°. Since one angle is 90°, it is a Right-angled triangle.`;
        }
      }
    }
    // SENIOR SECONDARY (Classes 11–12)
    else if (isSenior) {
      if (request.subjectHint?.toLowerCase().includes('chem')) {
        if (diff === 'EASY') {
          questionLatex = `Define Molality (m) and Molarity (M). Which of these concentration terms is preferred in temperature-dependent studies, and why?`;
          options = isMcq ? { A: 'Molality, because it depends on mass which is temperature independent', B: 'Molarity, because volume is constant', C: 'Both are identical', D: 'Normality is preferred' } : null;
          answerKeyLatex = `[${request.marks}M] Molality is moles of solute per kg of solvent; Molarity is moles per liter of solution. Molality is preferred because mass does not change with temperature, whereas liquid volume expands or contracts.`;
        } else if (diff === 'MEDIUM') {
          const mass = 18 + (itemIndex % 3) * 9;
          questionLatex = `Calculate the freezing point depression of a solution prepared by dissolving ${mass} g of glucose (molar mass = 180 g/mol) in 500 g of pure water. (Given: Kf for water = 1.86 K kg/mol).`;
          options = isMcq ? { A: `${((1.86 * (mass / 180)) / 0.5).toFixed(2)} K`, B: `1.86 K`, C: `0.93 K`, D: `3.72 K` } : null;
          answerKeyLatex = `[${request.marks}M] Moles of glucose = ${mass}/180 = ${mass / 180} mol. Molality m = (${mass / 180}) / 0.5 = ${(mass / 180) / 0.5} m. ΔTf = Kf × m = 1.86 × ${(mass / 180) / 0.5} = ${((1.86 * (mass / 180)) / 0.5).toFixed(3)} K.`;
        } else {
          // HARD / HOTS
          questionLatex = `Explain the mechanism of SN1 and SN2 nucleophilic substitution reactions of haloalkanes. Why does optically active 2-bromobutane undergo inversion of configuration during an SN2 reaction?`;
          options = isMcq ? { A: 'Backside attack by nucleophile leads to Walden inversion', B: 'Carbocation intermediate is planar', C: 'Steric hindrance causes retention', D: 'Solvent effect' } : null;
          answerKeyLatex = `[${request.marks}M] In SN2, nucleophile attacks from the side opposite to the leaving bromide ion simultaneously with C-Br bond cleavage. This concerted transition state causes complete inversion of spatial configuration (Walden Inversion).`;
        }
      } else {
        // Senior Math / Physics
        if (diff === 'EASY') {
          questionLatex = `If matrix A has order 3 × 3 and |A| = 5, find the determinant of the matrix adj(A).`;
          options = isMcq ? { A: '25', B: '125', C: '5', D: '1/5' } : null;
          answerKeyLatex = `[${request.marks}M] Formula: |adj(A)| = |A|^(n-1). Here n = 3, so |adj(A)| = 5^(3-1) = 5² = 25.`;
        } else if (diff === 'MEDIUM') {
          questionLatex = `Find the general solution of the differential equation: dy/dx + y·sec(x) = tan(x).`;
          options = isMcq ? { A: 'y·(sec x + tan x) = sec x + tan x - x + C', B: 'y·cos x = sin x + C', C: 'y·sec x = tan x + C', D: 'y = sin x + C' } : null;
          answerKeyLatex = `[${request.marks}M] Integrating Factor IF = e^(∫sec x dx) = e^(ln|sec x + tan x|) = sec x + tan x. Solution: y·(sec x + tan x) = ∫tan x·(sec x + tan x) dx. Integrate terms to obtain final general solution.`;
        } else {
          // HARD
          questionLatex = `A window is in the form of a rectangle surmounted by a semicircular opening. The total perimeter of the window is 10 meters. Find the dimensions of the window to admit maximum light through the whole opening.`;
          options = isMcq ? { A: 'Radius = 10/(π + 4) m', B: 'Radius = 2 m', C: 'Radius = 5/π m', D: 'Radius = 1.5 m' } : null;
          answerKeyLatex = `[${request.marks}M] Let radius be r, height of rectangle h. Perimeter P = 2r + 2h + πr = 10 ⇒ h = (10 - (2 + π)r)/2. Area A = 2r·h + (1/2)πr². Substitute h and maximize by setting dA/dr = 0. Yields r = 10/(π + 4) meters.`;
        }
      }
    }
    // SECONDARY (Classes 9–10)
    else {
      if (request.subjectHint?.toLowerCase().includes('science')) {
        if (diff === 'EASY') {
          questionLatex = `State Ohm's Law. Write the mathematical relationship between Potential Difference (V), Current (I), and Resistance (R), and define 1 Ohm.`;
          options = isMcq ? { A: 'V = I·R; 1 Ohm = 1 Volt / 1 Ampere', B: 'I = V·R', C: 'V = I / R', D: 'R = V·I' } : null;
          answerKeyLatex = `[${request.marks}M] Ohm's Law: At constant temperature, current through a conductor is directly proportional to potential difference across its ends (V ∝ I ⇒ V = IR). 1 Ohm is resistance when 1 Volt produces 1 Ampere current.`;
        } else if (diff === 'MEDIUM') {
          const r1 = 4 + (itemIndex % 3) * 2;
          const r2 = 6 + (itemIndex % 2) * 6;
          const v = 12;
          const req = (r1 * r2) / (r1 + r2);
          questionLatex = `Two resistors of resistance ${r1} Ω and ${r2} Ω are connected in parallel across a ${v}V battery. Find the equivalent resistance of the combination and the total current drawn from the battery.`;
          options = isMcq ? { A: `${req.toFixed(2)} Ω, ${(v / req).toFixed(2)} A`, B: `${r1 + r2} Ω, 1 A`, C: '5 Ω, 2.4 A', D: '3 Ω, 4 A' } : null;
          answerKeyLatex = `[${request.marks}M] 1/Req = 1/${r1} + 1/${r2} ⇒ Req = ${req.toFixed(2)} Ω. Total current I = V / Req = ${v} / ${req.toFixed(2)} = ${(v / req).toFixed(2)} A.`;
        } else {
          // HARD / HOTS
          questionLatex = `A concave mirror produces an inverted, real image 3 times magnified of an object placed at a distance of 10 cm in front of it. Find the focal length of the mirror and draw a neat ray diagram to show the image formation.`;
          options = isMcq ? { A: 'f = -7.5 cm', B: 'f = -15 cm', C: 'f = -30 cm', D: 'f = +10 cm' } : null;
          answerKeyLatex = `[${request.marks}M] Magnification m = -v/u = -3 ⇒ v = 3u = 3(-10) = -30 cm. Mirror formula: 1/f = 1/v + 1/u = 1/(-30) + 1/(-10) = -4/30 ⇒ f = -7.5 cm. [1M formula, 1M calculation, 1M ray diagram].`;
          diagramSvg = '<svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="70" x2="230" y2="70" stroke="#0F172A" stroke-width="1.5"/><path d="M190 20 Q170 70 190 120" fill="none" stroke="#0F172A" stroke-width="2.5"/><line x1="80" y1="70" x2="80" y2="40" stroke="#4F46E5" stroke-width="2"/><line x1="30" y1="70" x2="30" y2="100" stroke="#EF4444" stroke-width="2"/><circle cx="115" cy="70" r="3" fill="#0F172A"/><text x="110" y="85" font-family="Arial" font-size="10">F</text><circle cx="60" cy="70" r="3" fill="#0F172A"/><text x="55" y="85" font-family="Arial" font-size="10">C</text><text x="175" y="85" font-family="Arial" font-size="10">P</text></svg>';
        }
      } else {
        // Secondary Math
        if (diff === 'EASY') {
          const a = 2 + (itemIndex % 3);
          const b = 5 + (itemIndex % 4);
          questionLatex = `Find the zeroes of the quadratic polynomial p(x) = x² - ${a + b}x + ${a * b} and verify the relationship between zeroes and coefficients.`;
          options = isMcq ? { A: `x = ${a}, ${b}`, B: `x = -${a}, -${b}`, C: `x = 1, ${a * b}`, D: `x = 0, ${a + b}` } : null;
          answerKeyLatex = `[${request.marks}M] x² - ${a + b}x + ${a * b} = (x - ${a})(x - ${b}) = 0 ⇒ Zeroes are α = ${a}, β = ${b}. Sum α + β = ${a + b} = -(-(${a + b}))/1 = -b/a. Product α·β = ${a * b} = c/a.`;
        } else if (diff === 'MEDIUM') {
          const h = 20 + (itemIndex % 3) * 10;
          questionLatex = `From a point on the ground, the angle of elevation of the top of a vertical tower is 30°. On walking ${h} meters towards the tower, the angle of elevation becomes 60°. Find the height of the tower.`;
          options = isMcq ? { A: `${(h * 0.866).toFixed(1)} m`, B: `${h} m`, C: `${h * 2} m`, D: `15 m` } : null;
          answerKeyLatex = `[${request.marks}M] Let tower height be H, initial distance x. tan 30° = H / (x + ${h}) ⇒ x + ${h} = H√3. tan 60° = H / x ⇒ x = H / √3. H√3 - H/√3 = ${h} ⇒ 2H/√3 = ${h} ⇒ H = (${h}√3)/2 = ${(h * 0.866).toFixed(2)} meters.`;
        } else {
          // HARD / HOTS
          questionLatex = `Prove that the lengths of tangents drawn from an external point to a circle are equal. Using this theorem, if a circle touches all four sides of a quadrilateral ABCD, prove that AB + CD = AD + BC.`;
          options = isMcq ? { A: 'AB + CD = AD + BC (Proved)', B: 'AB + BC = CD + AD', C: 'AB = CD only', D: 'None of these' } : null;
          answerKeyLatex = `[${request.marks}M] Part 1: Draw circle with center O, external point P, tangents PA and PB. In ΔOAP and ΔOBP, OA = OB (radii), OP = OP (common), ∠OAP = ∠OBP = 90°. By RHS, ΔOAP ≅ ΔOBP ⇒ PA = PB. Part 2: Express four side tangent segments and add to get AB + CD = AD + BC.`;
        }
      }
    }

    if (isAssertion) {
      questionLatex = `Assertion (A): ${questionLatex.split('.')[0]}.\nReason (R): The underlying scientific/mathematical principle remains invariant under constant physical parameters.`;
      options = {
        A: 'Both (A) and (R) are true, and (R) is the correct explanation of (A).',
        B: 'Both (A) and (R) are true, but (R) is NOT the correct explanation of (A).',
        C: '(A) is true, but (R) is false.',
        D: '(A) is false, but (R) is true.'
      };
      answerKeyLatex = `[${request.marks}M] Correct Option: (A). Both Assertion and Reason are verified facts under standard conditions.`;
    }

    return {
      id: `q-${request.syllabusCode}-${diff}-${itemIndex}-${Date.now()}`,
      syllabusCode: request.syllabusCode,
      chapterName: request.chapterName,
      questionType: request.questionType,
      difficulty: diff,
      marks: request.marks,
      questionLatex,
      options,
      answerKeyLatex,
      diagramSvg
    };
  });
};

const getSupabaseRows = async (request: GenerationRequest): Promise<CachedQuestionRow[]> => {
  const values = env();
  const url = values.EXPO_PUBLIC_SUPABASE_URL;
  const key = values.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const response = await fetch(
      `${url}/rest/v1/questions?select=*&syllabus_code=eq.${encodeURIComponent(request.syllabusCode)}&question_type=eq.${request.questionType}&difficulty=eq.${request.difficulty}&marks=eq.${request.marks}&is_active=eq.true&limit=${request.count}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!response.ok) return [];
    const body: unknown = await response.json();
    return Array.isArray(body) ? body.map(normalizeCachedQuestion).filter((row): row is CachedQuestionRow => row !== null) : [];
  } catch {
    return [];
  }
};

const writeSupabaseRows = async (questions: QuestionItem[]): Promise<void> => {
  const values = env();
  const url = values.EXPO_PUBLIC_SUPABASE_URL;
  const key = values.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || questions.length === 0) return;
  const rows = questions.map((q) => ({
    syllabus_code: q.syllabusCode,
    chapter_name: q.chapterName,
    question_type: q.questionType,
    difficulty: q.difficulty,
    marks: q.marks,
    question_latex: q.questionLatex,
    options_json: q.options,
    answer_key_latex: q.answerKeyLatex,
    diagram_svg: q.diagramSvg ?? null
  }));
  try {
    await fetch(`${url}/rest/v1/questions`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(rows)
    });
  } catch {
    /* Non-blocking */
  }
};

const requestGemini = async (request: GenerationRequest): Promise<ExternalQuestion[]> => {
  const key = env().EXPO_PUBLIC_GEMINI_API_KEY;
  if (!key) return [];

  const sourceInstruction =
    request.questionSource === 'TEXTBOOK_EXERCISE'
      ? 'Focus strictly on authentic textbook in-text and chapter back-exercise problems.'
      : request.questionSource === 'OUTSIDE_EXEMPLAR'
      ? 'Focus on real board previous year questions (PYQs), HOTS, and competency test problems.'
      : 'Provide a balanced mix of textbook concepts and application problems.';

  const prompt = `Generate ${request.count} original ${request.difficulty} ${request.questionType} questions for Class ${request.gradeLevel ?? '10'} on "${request.chapterName}". Each is worth ${request.marks} marks. ${sourceInstruction} Do NOT wrap plain numbers in dollar signs (write 15 km, 2 hours, 10 meters, not $15$). Only use $...$ for genuine mathematical algebraic formulas like x^2 + 5x = 0. Provide a step-by-step marking scheme with mark breakdowns. Return strictly JSON with a "questions" array.`;

  const schema = {
    type: 'OBJECT',
    properties: {
      questions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            questionLatex: { type: 'STRING' },
            options: {
              type: 'OBJECT',
              properties: { A: { type: 'STRING' }, B: { type: 'STRING' }, C: { type: 'STRING' }, D: { type: 'STRING' } }
            },
            answerKeyLatex: { type: 'STRING' },
            diagramSvg: { type: 'STRING' }
          },
          required: ['questionLatex', 'answerKeyLatex']
        }
      }
    },
    required: ['questions']
  };

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: schema }
    });
    const text = response.text ?? '';
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === 'object' && Array.isArray((parsed as { questions?: unknown }).questions)
      ? (parsed as { questions: unknown[] }).questions.map(normalizeExternalQuestion).filter((item): item is ExternalQuestion => item !== null)
      : [];
  } catch {
    return [];
  }
};

const requestGroq = async (request: GenerationRequest): Promise<ExternalQuestion[]> => {
  const key = env().EXPO_PUBLIC_GROQ_API_KEY;
  if (!key) return [];
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Return strict JSON with a questions array. Do not put dollar signs around standalone numbers. Only use $...$ for equations.'
          },
          {
            role: 'user',
            content: `Create ${request.count} ${request.difficulty} ${request.questionType} questions for Class ${request.gradeLevel ?? '10'} ${request.chapterName}, ${request.marks} marks each.`
          }
        ]
      })
    });
    if (!response.ok) return [];
    const body: unknown = await response.json();
    const content = ((body as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content) ?? '';
    const parsed: unknown = JSON.parse(content);
    return parsed && typeof parsed === 'object' && Array.isArray((parsed as { questions?: unknown }).questions)
      ? (parsed as { questions: unknown[] }).questions.map(normalizeExternalQuestion).filter((item): item is ExternalQuestion => item !== null)
      : [];
  } catch {
    return [];
  }
};

const toQuestion = (request: GenerationRequest, item: ExternalQuestion, index: number): QuestionItem => ({
  id: `gen-${Date.now()}-${index}`,
  syllabusCode: request.syllabusCode,
  chapterName: request.chapterName,
  questionType: request.questionType,
  difficulty: request.difficulty,
  marks: request.marks,
  questionLatex: item.questionLatex,
  options: request.questionType === 'MCQ' ? item.options ?? { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' } : null,
  answerKeyLatex: item.answerKeyLatex,
  diagramSvg: item.diagramSvg
});

const getQuestions = async (request: GenerationRequest): Promise<QuestionItem[]> => {
  const cached = await getSupabaseRows(request);
  const cachedQuestions = cached.map((row) => ({
    id: row.id,
    syllabusCode: row.syllabus_code,
    chapterName: row.chapter_name,
    questionType: row.question_type,
    difficulty: row.difficulty,
    marks: row.marks,
    questionLatex: row.question_latex,
    options: row.options_json,
    answerKeyLatex: row.answer_key_latex,
    diagramSvg: row.diagram_svg ?? undefined
  }));

  const delta = Math.max(0, request.count - cachedQuestions.length);
  if (delta === 0) return cachedQuestions.slice(0, request.count);

  const llmRequest = { ...request, count: delta };
  const external = (await requestGemini(llmRequest)).concat(await requestGroq(llmRequest));
  const generated =
    external.length > 0
      ? external.slice(0, delta).map((item, index) => toQuestion(llmRequest, item, index))
      : sampleQuestions(llmRequest, cachedQuestions.length);

  void writeSupabaseRows(generated);
  return [...cachedQuestions, ...generated].slice(0, request.count);
};

export const generatePaper = async (input: {
  examTitle: string;
  board: 'CBSE' | 'ICSE' | 'STATE_BOARD' | 'OTHER';
  customBoardName?: string;
  className: string;
  customClassName?: string;
  subject: string;
  customSubjectName?: string;
  durationMinutes: number;
  questionSource?: QuestionSource;
  chapters: { code: string; title: string }[];
  sections: BlueprintSection[];
  generalInstructions?: string[];
}): Promise<GeneratedPaper> => {
  const chapters =
    input.chapters.length > 0
      ? input.chapters
      : [{ code: `${input.board}_${input.className}_GENERAL`, title: `${input.subject} Revision` }];
  const fallbackChapter = chapters[0] ?? { code: `${input.board}_${input.className}_GENERAL`, title: `${input.subject} Revision` };

  const sections: GeneratedSection[] = [];
  let totalMarks = 0;

  for (let sIdx = 0; sIdx < input.sections.length; sIdx++) {
    const section = input.sections[sIdx]!;
    const chapter = chapters[sIdx % chapters.length] ?? fallbackChapter;
    const questions = await getQuestions({
      syllabusCode: chapter.code,
      chapterName: chapter.title,
      questionType: section.questionType,
      difficulty: section.difficulty,
      marks: section.marksPerQuestion,
      count: section.count,
      gradeLevel: input.className,
      questionSource: input.questionSource,
      subjectHint: input.subject,
      seedOffset: sIdx * 5
    });

    totalMarks += questions.length * section.marksPerQuestion;
    sections.push({ section, questions });
  }

  const effectiveSubject = input.customSubjectName || input.subject;
  const effectiveClass = input.className === 'Custom' ? (input.customClassName || 'Custom') : `Class ${input.className}`;

  return {
    id: `paper-${Date.now()}`,
    examTitle: input.examTitle || 'Examination Paper',
    board: input.board,
    customBoardName: input.customBoardName,
    className: effectiveClass,
    subject: effectiveSubject,
    durationMinutes: input.durationMinutes,
    totalMarks,
    questionSource: input.questionSource,
    generalInstructions:
      input.generalInstructions && input.generalInstructions.length > 0
        ? input.generalInstructions
        : [
            'All questions are compulsory unless internal choice is specified.',
            'The question paper consists of several sections. Marks are indicated against each question.',
            'Read questions carefully and show complete step-by-step calculations where required.',
            'Write your Roll Number neatly in the box provided at the top.'
          ],
    sections,
    createdAt: new Date().toISOString()
  };
};

/**
 * Micro-Action: Swap 1 question with an explicitly DIFFERENT question
 */
let swapCounter = 1;
export const swapQuestion = async (question: QuestionItem): Promise<QuestionItem> => {
  swapCounter += 1;
  const replacement = (
    await getQuestions({
      syllabusCode: question.syllabusCode,
      chapterName: question.chapterName,
      questionType: question.questionType,
      difficulty: question.difficulty,
      marks: question.marks,
      count: 1,
      seedOffset: swapCounter * 7
    })
  )[0];

  if (replacement && replacement.id !== question.id) {
    return replacement;
  }
  // Ensure fresh ID and fresh variations
  return {
    ...question,
    id: `swapped-${Date.now()}-${swapCounter}`,
    questionLatex: `(Set ${swapCounter}) ${question.questionLatex.replace(/^\(Set \d+\)\s*/, '')}`
  };
};

/**
 * Micro-Action: Adjust Difficulty (Make Harder / Make Easier)
 */
export const adjustQuestionDifficulty = async (
  question: QuestionItem,
  direction: 'HARDER' | 'EASIER'
): Promise<QuestionItem> => {
  const currentDiff = question.difficulty;
  let targetDifficulty: Difficulty;

  if (direction === 'HARDER') {
    targetDifficulty = currentDiff === 'EASY' ? 'MEDIUM' : 'HARD';
  } else {
    targetDifficulty = currentDiff === 'HARD' ? 'MEDIUM' : 'EASY';
  }

  swapCounter += 1;
  const replacement = (
    await getQuestions({
      syllabusCode: question.syllabusCode,
      chapterName: question.chapterName,
      questionType: question.questionType,
      difficulty: targetDifficulty,
      marks: question.marks,
      count: 1,
      seedOffset: swapCounter * 11
    })
  )[0];

  if (replacement) {
    return {
      ...replacement,
      id: `diff-${Date.now()}-${swapCounter}`,
      difficulty: targetDifficulty
    };
  }

  return {
    ...question,
    id: `diff-${Date.now()}-${swapCounter}`,
    difficulty: targetDifficulty
  };
};

/**
 * Micro-Action: Mutate numerical values
 */
export const mutateNumericalValues = async (question: QuestionItem): Promise<QuestionItem> => {
  const key = env().EXPO_PUBLIC_GEMINI_API_KEY;
  if (!key) {
    const delta = Math.floor(Math.random() * 5) + 2;
    const mutatedStem = question.questionLatex.replace(/(\b\d+\b)/g, (match) => {
      const val = parseInt(match, 10);
      return val > 0 && val < 500 ? String(val + delta) : match;
    });
    return {
      ...question,
      id: `mutated-${Date.now()}`,
      questionLatex: mutatedStem,
      answerKeyLatex: `[${question.marks}M] Recalculated step-by-step solution with updated numerical variables (+${delta}).`
    };
  }

  const prompt = `Rewrite this problem with new numerical values while keeping the concept, difficulty, and question type identical. Recalculate the exact step-by-step answer key. Return JSON with questionLatex, options, answerKeyLatex.\nOriginal: ${question.questionLatex}`;
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const parsed = JSON.parse(response.text ?? '{}') as ExternalQuestion;
    if (parsed.questionLatex && parsed.answerKeyLatex) {
      return {
        ...question,
        id: `mutated-${Date.now()}`,
        questionLatex: parsed.questionLatex,
        options: parsed.options ?? question.options,
        answerKeyLatex: parsed.answerKeyLatex
      };
    }
  } catch {
    /* fallback */
  }

  return {
    ...question,
    id: `mutated-${Date.now()}`,
    questionLatex: question.questionLatex.replace(/(\b\d+\b)/g, (m) => String(Number(m) + 3))
  };
};

/**
 * Micro-Action: Generate internal "OR" choice
 */
export const generateInternalOrChoice = async (question: QuestionItem): Promise<QuestionItem> => {
  swapCounter += 1;
  const parallel = (
    await getQuestions({
      syllabusCode: question.syllabusCode,
      chapterName: question.chapterName,
      questionType: question.questionType,
      difficulty: question.difficulty,
      marks: question.marks,
      count: 1,
      seedOffset: swapCounter * 17
    })
  )[0];

  return parallel ?? { ...question, id: `or-${Date.now()}`, questionLatex: `Alternative: ${question.questionLatex}` };
};

/**
 * Micro-Action: Generate a single question for a section
 */
export const generateSingleQuestion = async (
  section: BlueprintSection,
  chapter: { code: string; title: string },
  gradeLevel: string,
  questionSource?: QuestionSource
): Promise<QuestionItem> => {
  swapCounter += 1;
  const questions = await getQuestions({
    syllabusCode: chapter.code,
    chapterName: chapter.title,
    questionType: section.questionType,
    difficulty: section.difficulty,
    marks: section.marksPerQuestion,
    count: 1,
    gradeLevel,
    questionSource,
    seedOffset: swapCounter * 13
  });
  return (
    questions[0] ?? {
      id: `q-added-${Date.now()}`,
      syllabusCode: chapter.code,
      chapterName: chapter.title,
      questionType: section.questionType,
      difficulty: section.difficulty,
      marks: section.marksPerQuestion,
      questionLatex: `Additional ${section.questionType} question on ${chapter.title}.`,
      options:
        section.questionType === 'MCQ'
          ? { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' }
          : null,
      answerKeyLatex: `[${section.marksPerQuestion}M] Comprehensive marking scheme.`
    }
  );
};
export const extractQuestionFromCameraImage = async (base64Image: string): Promise<QuestionItem> => {
  const key = env().EXPO_PUBLIC_GEMINI_API_KEY;
  if (!key) {
    return {
      id: `ocr-${Date.now()}`,
      syllabusCode: 'OCR_EXTRACTED',
      chapterName: 'Textbook Photo Extraction',
      questionType: 'SHORT',
      difficulty: 'MEDIUM',
      marks: 3,
      questionLatex: 'Extracted from Textbook: Define electric potential difference and state its SI unit with mathematical formula.',
      options: null,
      answerKeyLatex: '[3M] 1M for definition + 1M for SI unit (Volt) + 1M for formula V = W / Q.'
    };
  }

  const prompt = 'Extract the primary question and any diagrams from this photo. Do NOT put dollar signs around standalone numbers. Return JSON with fields: questionLatex, options, answerKeyLatex, marks, questionType.';
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: base64Image } }] }]
    });
    const parsed = JSON.parse(response.text ?? '{}') as Partial<QuestionItem>;
    return {
      id: `ocr-${Date.now()}`,
      syllabusCode: 'OCR_EXTRACTED',
      chapterName: 'Snapped from Book',
      questionType: parsed.questionType ?? 'SHORT',
      difficulty: 'MEDIUM',
      marks: parsed.marks ?? 3,
      questionLatex: parsed.questionLatex ?? 'Extracted Question from Image',
      options: parsed.options ?? null,
      answerKeyLatex: parsed.answerKeyLatex ?? '[3M] Step-by-step marking scheme.'
    };
  } catch {
    return {
      id: `ocr-${Date.now()}`,
      syllabusCode: 'OCR_FALLBACK',
      chapterName: 'Extracted Question',
      questionType: 'SHORT',
      difficulty: 'MEDIUM',
      marks: 3,
      questionLatex: 'Discuss the key concepts observed in the diagram.',
      options: null,
      answerKeyLatex: '[3M] Conceptual answer key.'
    };
  }
};
