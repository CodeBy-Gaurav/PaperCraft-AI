import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { GeneratedPaper, InstituteProfile, QuestionItem } from '@/src/types/paper';

export type RenderMode = 'QUESTION_PAPER' | 'ANSWER_KEY' | 'OMR_SHEET';
export type PrintFontSize = 'compact' | 'standard' | 'large';

export interface PdfRenderOptions {
  showWatermark?: boolean;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

/**
 * Clean math strings by removing awkward $ symbols around plain numbers
 * while preserving actual KaTeX equations.
 */
const cleanMathDelimiters = (str: string): string => {
  if (!str) return '';
  return str
    // Remove $ around standalone numbers e.g. "$17$" -> "17"
    .replace(/\$([0-9]+)\$/g, '$1')
    // Remove $ around simple numbers with basic units e.g. "$6V$" -> "6V", "$2 hours$" -> "2 hours"
    .replace(/\$([0-9]+(?:\.[0-9]+)?\s*(?:[a-zA-Z%Ω°₹cmkgmL]+|\text\{[a-zA-Z]+\}))\$/g, '$1');
};

const renderTextWithLatex = (rawText: string): string => {
  const cleaned = cleanMathDelimiters(rawText);
  // Split by $$...$$ and $...$
  const parts = cleaned.split(/(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g);
  return parts
    .map((part) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return `<span class="math-display">${part}</span>`;
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        return `<span class="math-inline">${part}</span>`;
      }
      return escapeHtml(part);
    })
    .join('');
};

const optionLayout = (options: NonNullable<QuestionItem['options']>): 'row' | 'grid' | 'stack' => {
  const lengths = Object.values(options).map((opt) => opt.length);
  if (lengths.every((l) => l <= 16)) return 'row';
  if (lengths.every((l) => l <= 40)) return 'grid';
  return 'stack';
};

const renderQuestion = (question: QuestionItem, qNumber: number, mode: RenderMode): string => {
  const optionsHtml = question.options
    ? `<div class="options ${optionLayout(question.options)}">${Object.entries(question.options)
        .map(
          ([k, val]) =>
            `<div class="opt-item"><span class="opt-key">(${k})</span><span class="opt-val">${renderTextWithLatex(
              val
            )}</span></div>`
        )
        .join('')}</div>`
    : '';

  const diagramHtml = question.diagramSvg ? `<div class="diagram-box">${question.diagramSvg}</div>` : '';

  const answerHtml =
    mode === 'ANSWER_KEY'
      ? `<div class="answer-key-box">
           <div class="ak-header"><strong>Marking Scheme [${question.marks}M]:</strong></div>
           <div class="ak-body">${renderTextWithLatex(question.answerKeyLatex)}</div>
         </div>`
      : '';

  const orHtml = question.orChoiceQuestion
    ? `<div class="or-separator"><span>— OR —</span></div>
       <div class="or-question-wrapper">
         <div class="q-stem-row">
           <div class="q-stem">${renderTextWithLatex(question.orChoiceQuestion.questionLatex)}</div>
           <div class="q-marks-tag">[${question.orChoiceQuestion.marks}]</div>
         </div>
         ${
           question.orChoiceQuestion.diagramSvg
             ? `<div class="diagram-box">${question.orChoiceQuestion.diagramSvg}</div>`
             : ''
         }
         ${
           question.orChoiceQuestion.options
             ? `<div class="options ${optionLayout(question.orChoiceQuestion.options)}">${Object.entries(
                 question.orChoiceQuestion.options
               )
                 .map(
                   ([k, val]) =>
                     `<div class="opt-item"><span class="opt-key">(${k})</span><span class="opt-val">${renderTextWithLatex(
                       val
                     )}</span></div>`
                 )
                 .join('')}</div>`
             : ''
         }
         ${
           mode === 'ANSWER_KEY'
             ? `<div class="answer-key-box">
                  <div class="ak-header"><strong>OR Alternative Marking Scheme [${question.orChoiceQuestion.marks}M]:</strong></div>
                  <div class="ak-body">${renderTextWithLatex(question.orChoiceQuestion.answerKeyLatex)}</div>
                </div>`
             : ''
         }
       </div>`
    : '';

  return `
    <div class="question-wrapper">
      <div class="q-row">
        <div class="q-num">${qNumber}.</div>
        <div class="q-content">
          <div class="q-stem-row">
            <div class="q-stem">${renderTextWithLatex(question.questionLatex)}</div>
            <div class="q-marks-tag">[${question.marks}]</div>
          </div>
          ${diagramHtml}
          ${optionsHtml}
          ${orHtml}
          ${answerHtml}
        </div>
      </div>
    </div>
  `;
};

export const generateA4Html = (
  paper: GeneratedPaper,
  instituteProfile: InstituteProfile,
  renderMode: RenderMode = 'QUESTION_PAPER',
  options: PdfRenderOptions = { showWatermark: true }
): string => {
  const fontSize =
    instituteProfile.defaultFontSize === 'compact'
      ? '9.5pt'
      : instituteProfile.defaultFontSize === 'large'
      ? '11.5pt'
      : '10.5pt';

  const logoHtml = instituteProfile.logoUri
    ? `<div class="school-logo"><img src="${instituteProfile.logoUri}" alt="Crest" /></div>`
    : '';

  const sessionText = instituteProfile.sessionYear || 'Academic Session 2026–2027';
  const affiliationText = instituteProfile.affiliationNumber || instituteProfile.subtitle;
  const boardTitle =
    paper.board === 'OTHER'
      ? paper.customBoardName || 'Board Examination'
      : paper.board === 'STATE_BOARD'
      ? 'State Board Examination'
      : `${paper.board} Examination`;

  // Render Official Indian School Header depending on style
  let headerHtml = '';
  if (instituteProfile.headerStyle === 'classic_boxed') {
    headerHtml = `
      <header class="header classic-boxed">
        <div class="header-top-meta">
          <div class="meta-left">
            <span class="series-tag">Series: <strong>AGY/26</strong></span>
            <span class="sep">•</span>
            <span class="qp-code">Q.P. Code: <strong>041/1/1</strong></span>
          </div>
          <div class="roll-box-wrap">
            <span class="roll-label">Roll No.</span>
            <div class="roll-boxes">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <div class="header-main">
          ${logoHtml}
          <div class="school-info">
            <h1 class="school-name">${escapeHtml(instituteProfile.schoolName)}</h1>
            <div class="school-sub">${escapeHtml(affiliationText)}</div>
            <div class="session-badge">${escapeHtml(sessionText)}</div>
          </div>
        </div>

        <div class="double-rule"></div>

        <div class="exam-title-row">
          <div class="exam-title">${escapeHtml(paper.examTitle)}</div>
          <div class="paper-subject">${escapeHtml(paper.className)} • ${escapeHtml(paper.subject)} (${escapeHtml(boardTitle)})</div>
        </div>

        <div class="exam-meta-bar">
          <span class="meta-time"><strong>Time Allowed:</strong> ${paper.durationMinutes} Minutes</span>
          <span class="meta-marks"><strong>Maximum Marks:</strong> ${paper.totalMarks}</span>
        </div>

        <div class="candidate-bar">
          <div class="cand-field">
            <span class="lbl">Candidate's Name:</span>
            <span class="dots-line">....................................................................</span>
          </div>
          <div class="cand-field">
            <span class="lbl">Invigilator's Sign:</span>
            <span class="dots-line short">...............................</span>
          </div>
        </div>
      </header>
    `;
  } else if (instituteProfile.headerStyle === 'modern_minimal') {
    headerHtml = `
      <header class="header modern-minimal">
        <div class="modern-top-bar"></div>
        <div class="header-main text-left">
          ${logoHtml}
          <div class="school-info">
            <h1 class="school-name">${escapeHtml(instituteProfile.schoolName)}</h1>
            <div class="school-sub">${escapeHtml(affiliationText)} • ${escapeHtml(sessionText)}</div>
            <div class="exam-title">${escapeHtml(paper.examTitle)} — ${escapeHtml(paper.className)} ${escapeHtml(paper.subject)}</div>
          </div>
        </div>
        <div class="exam-meta-bar modern">
          <span>Time: <b>${paper.durationMinutes} Mins</b></span>
          <span>Max Marks: <b>${paper.totalMarks}</b></span>
          <span>Board: <b>${escapeHtml(boardTitle)}</b></span>
        </div>
        <div class="candidate-bar modern">
          <div class="cand-field"><span class="lbl">Roll No:</span><span class="dots-line short">....................</span></div>
          <div class="cand-field"><span class="lbl">Candidate Name:</span><span class="dots-line">........................................</span></div>
        </div>
      </header>
    `;
  } else {
    // Compact Coaching
    headerHtml = `
      <header class="header compact-coaching">
        <div class="compact-row">
          <div class="compact-left">
            <span class="school-name">${escapeHtml(instituteProfile.schoolName)}</span>
            <span class="school-sub">${escapeHtml(paper.examTitle)} • ${escapeHtml(paper.className)} ${escapeHtml(paper.subject)}</span>
          </div>
          <div class="compact-right">
            <span>Time: <b>${paper.durationMinutes}m</b> | MM: <b>${paper.totalMarks}</b></span>
            <span>Roll No: [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]</span>
          </div>
        </div>
      </header>
    `;
  }

  // Continuous Question Numbering (Q1 to QN)
  let continuousNumber = 0;
  const sectionsHtml = paper.sections
    .map((sec) => {
      const sectionMarks = sec.questions.length * sec.section.marksPerQuestion;
      const questionsMarkup = sec.questions
        .map((q) => {
          continuousNumber += 1;
          return renderQuestion(q, continuousNumber, renderMode);
        })
        .join('');

      return `
        <section class="exam-section">
          <div class="section-heading-box">
            <span class="sec-title">${escapeHtml(sec.section.sectionTitle)}</span>
            <span class="sec-marks">[${sectionMarks} Marks]</span>
          </div>
          ${questionsMarkup}
        </section>
      `;
    })
    .join('');

  // OMR Sheet
  let omrContinuous = 0;
  const omrSheetHtml = `
    <div class="omr-container">
      <div class="omr-header">
        <h2>CANDIDATE OMR ANSWER SHEET</h2>
        <p>Use Blue / Black Ball Point Pen Only • Darken one bubble completely per question.</p>
        <div class="omr-meta-row">
          <span>Candidate Name: ___________________________</span>
          <span>Roll No: [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]</span>
        </div>
      </div>
      <div class="omr-grid">
        ${paper.sections
          .flatMap((s) => s.questions)
          .map(() => {
            omrContinuous += 1;
            return `
              <div class="omr-item">
                <span class="omr-num">${omrContinuous}.</span>
                <span class="bubble">A</span>
                <span class="bubble">B</span>
                <span class="bubble">C</span>
                <span class="bubble">D</span>
              </div>
            `;
          })
          .join('')}
      </div>
      <div class="omr-footer">
        <div>Invigilator Signature: _______________________</div>
        <div>Candidate Signature: _______________________</div>
      </div>
      <div class="omr-credit">PaperCraft AI • Architected by Gaurav Tiwari</div>
    </div>
  `;

  const watermarkHtml =
    options.showWatermark !== false && instituteProfile.watermarkText
      ? `<div class="watermark-overlay">${escapeHtml(instituteProfile.watermarkText)}</div>`
      : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=794, initial-scale=0.48, minimum-scale=0.2, maximum-scale=3.0, user-scalable=yes">
  <title>${escapeHtml(paper.examTitle)}</title>
  
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
    onload="if(window.renderMathInElement){renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});}">
  </script>

  <script>
    function adjustA4Scale() {
      try {
        var winW = window.innerWidth || document.documentElement.clientWidth;
        if (winW && winW < 810) {
          var targetScale = (winW - 14) / 794;
          var meta = document.querySelector('meta[name="viewport"]');
          if (meta) {
            meta.setAttribute('content', 'width=794, initial-scale=' + targetScale.toFixed(3) + ', minimum-scale=0.2, maximum-scale=3.0, user-scalable=yes');
          }
        }
      } catch (e) {}
    }
    window.addEventListener('resize', adjustA4Scale);
    window.addEventListener('DOMContentLoaded', adjustA4Scale);
    setTimeout(adjustA4Scale, 60);
  </script>

  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 12mm 14mm;
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    html {
      width: 100%;
      background: #1E293B;
      margin: 0;
      padding: 0;
    }

    body {
      width: 100%;
      min-height: 100%;
      margin: 0;
      padding: 18px 0;
      background: #1E293B;
      color: #0F172A;
      font-family: "Cambria", "Georgia", "Times New Roman", Times, serif;
      font-size: ${fontSize};
      line-height: 1.45;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .a4-sheet {
      position: relative;
      width: 794px;
      min-height: 1123px;
      margin: 0 auto;
      background: #FFFFFF;
      padding: 44px 54px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }

    .watermark-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(-35deg);
      font-size: 44pt;
      font-weight: 800;
      color: rgba(15, 23, 42, 0.038);
      z-index: 0;
      pointer-events: none;
      text-transform: uppercase;
      letter-spacing: 3px;
    }

    /* HEADER */
    .header {
      position: relative;
      z-index: 1;
      margin-bottom: 4mm;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .header.classic-boxed {
      border: 1.5pt solid #0F172A;
      padding: 3mm 4.5mm 3mm;
      background: #FFFFFF;
    }

    .header-top-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: #475569;
      margin-bottom: 2mm;
      border-bottom: 0.5pt solid #CBD5E1;
      padding-bottom: 1.5mm;
    }

    .header-top-meta .meta-left {
      display: flex;
      gap: 2mm;
      align-items: center;
    }

    .header-top-meta .sep {
      color: #94A3B8;
    }

    .roll-box-wrap {
      display: flex;
      align-items: center;
      gap: 1.5mm;
    }

    .roll-label {
      font-weight: 700;
      color: #0F172A;
    }

    .roll-boxes {
      display: inline-flex;
    }

    .roll-boxes span {
      display: inline-block;
      width: 4.2mm;
      height: 4.2mm;
      border: 1pt solid #0F172A;
      margin-left: 0.6mm;
      background: #FFFFFF;
    }

    .header-main {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4mm;
      text-align: center;
      margin: 1.5mm 0;
    }

    .school-logo img {
      max-height: 20mm;
      max-width: 22mm;
      object-fit: contain;
    }

    .school-info {
      flex: 1;
    }

    .school-name {
      font-size: 15.5pt;
      font-weight: 800;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #0F172A;
      line-height: 1.2;
    }

    .school-sub {
      font-size: 8.5pt;
      font-style: italic;
      color: #334155;
      margin-top: 0.8mm;
    }

    .session-badge {
      font-size: 8pt;
      font-weight: 700;
      margin-top: 0.6mm;
      color: #475569;
    }

    .double-rule {
      border-top: 1.5pt solid #0F172A;
      border-bottom: 0.5pt solid #0F172A;
      height: 3px;
      margin: 2mm 0;
    }

    .exam-title-row {
      text-align: center;
      margin: 1mm 0 2mm;
    }

    .exam-title {
      font-size: 12pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0F172A;
    }

    .paper-subject {
      font-size: 10pt;
      font-weight: 700;
      color: #1E293B;
      margin-top: 0.6mm;
    }

    .exam-meta-bar {
      display: flex;
      justify-content: space-between;
      border-top: 1pt solid #0F172A;
      border-bottom: 1pt solid #0F172A;
      margin-top: 2mm;
      padding: 1.2mm 2.5mm;
      font-size: 9pt;
      font-weight: 700;
      background: #F8FAFC;
    }

    .candidate-bar {
      display: flex;
      justify-content: space-between;
      margin-top: 2mm;
      font-size: 8.5pt;
      gap: 3mm;
    }

    .cand-field {
      display: flex;
      align-items: center;
      gap: 1.5mm;
    }

    .cand-field .lbl {
      font-weight: 600;
      color: #334155;
    }

    .dots-line {
      color: #64748B;
      letter-spacing: 1px;
    }

    .dots-line.short {
      letter-spacing: 1.5px;
    }

    /* MODERN MINIMAL */
    .header.modern-minimal {
      border-bottom: 2pt solid #4F46E5;
      padding-bottom: 3mm;
    }
    .modern-top-bar {
      height: 3.5px;
      background: #4F46E5;
      margin-bottom: 2.5mm;
    }
    .header-main.text-left {
      text-align: left;
    }
    .exam-meta-bar.modern {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 4px;
      margin-top: 2.5mm;
      padding: 1.5mm 3.5mm;
    }
    .candidate-bar.modern {
      margin-top: 2.5mm;
    }

    /* COMPACT COACHING */
    .header.compact-coaching {
      background: #F8FAFC;
      border: 1pt solid #CBD5E1;
      padding: 2.5mm 4mm;
    }
    .compact-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .compact-left .school-name {
      font-size: 12pt;
      font-weight: 800;
      display: block;
    }
    .compact-left .school-sub {
      font-size: 8.5pt;
      color: #475569;
    }
    .compact-right {
      text-align: right;
      font-size: 8.5pt;
      display: flex;
      flex-direction: column;
      gap: 1mm;
    }

    /* GENERAL INSTRUCTIONS */
    .instructions-box {
      border: 1pt solid #0F172A;
      background: #F8FAFC;
      padding: 2.5mm 4.5mm;
      margin-bottom: 4mm;
      font-size: 8.5pt;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .instructions-heading {
      font-weight: 800;
      text-transform: uppercase;
      font-size: 8.5pt;
      letter-spacing: 0.5px;
      margin-bottom: 1.5mm;
      border-bottom: 0.5pt solid #CBD5E1;
      padding-bottom: 1mm;
      color: #0F172A;
    }

    .instructions-list {
      margin: 0;
      padding-left: 4.5mm;
    }

    .instructions-list li {
      margin-bottom: 0.8mm;
      line-height: 1.35;
      color: #1E293B;
    }

    /* QUESTIONS BODY */
    .questions-body {
      position: relative;
      z-index: 1;
    }

    .questions-body.two-column {
      column-count: 2;
      column-gap: 6.5mm;
      column-rule: 0.5pt solid #CBD5E1;
    }

    .exam-section {
      margin-bottom: 4mm;
    }

    .section-heading-box {
      border-top: 1pt solid #0F172A;
      border-bottom: 1pt solid #0F172A;
      background: #F1F5F9;
      padding: 1.5mm 3.5mm;
      margin: 4mm 0 2.5mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 800;
      font-size: 9.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      break-after: avoid;
      page-break-after: avoid;
    }

    .sec-marks {
      font-size: 8.5pt;
      font-weight: 700;
    }

    /* QUESTION ROW & MARKS ALIGNMENT */
    .question-wrapper {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 3.5mm;
    }

    .q-row {
      display: flex;
      gap: 2mm;
      align-items: flex-start;
    }

    .q-num {
      width: 7mm;
      font-weight: 800;
      flex-shrink: 0;
      font-size: 1em;
      color: #0F172A;
    }

    .q-content {
      flex: 1;
    }

    .q-stem-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 3mm;
    }

    .q-stem {
      flex: 1;
      font-size: 1em;
      color: #0F172A;
    }

    .q-marks-tag {
      font-weight: 800;
      font-size: 8.5pt;
      color: #0F172A;
      white-space: nowrap;
      margin-left: 2mm;
    }

    .diagram-box {
      text-align: center;
      margin: 2.5mm 0;
    }

    .diagram-box svg {
      max-width: 60mm;
      max-height: 30mm;
    }

    /* SMART MCQ GRID */
    .options {
      display: grid;
      gap: 1.5mm 3mm;
      margin-top: 2mm;
      font-size: 0.95em;
    }

    .options.row {
      grid-template-columns: repeat(4, 1fr);
    }

    .options.grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .options.stack {
      grid-template-columns: 1fr;
    }

    .opt-item {
      display: flex;
      align-items: baseline;
      gap: 1.5mm;
      break-inside: avoid;
    }

    .opt-key {
      font-weight: 700;
      color: #0F172A;
      min-width: 5mm;
    }

    .opt-val {
      color: #1E293B;
      flex: 1;
    }

    /* OR SEPARATOR */
    .or-separator {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 8pt;
      letter-spacing: 2px;
      color: #475569;
      margin: 2.5mm 0 1.5mm;
    }

    .or-separator::before,
    .or-separator::after {
      content: "";
      flex: 1;
      border-bottom: 0.5pt solid #CBD5E1;
      margin: 0 4mm;
    }

    .or-question-wrapper {
      margin-top: 1.5mm;
    }

    /* MARKING SCHEME */
    .answer-key-box {
      background: #F0FDF4;
      border-left: 2.5pt solid #10B981;
      padding: 1.8mm 3mm;
      margin-top: 2mm;
      font-size: 8.5pt;
      color: #064E3B;
      border-radius: 2px;
    }

    .ak-header {
      font-weight: 700;
      margin-bottom: 0.5mm;
    }

    /* EXAM FOOTER */
    .exam-footer {
      margin-top: 8mm;
      padding-top: 3mm;
      text-align: center;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .footer-divider {
      border-top: 1pt dashed #CBD5E1;
      margin-bottom: 3mm;
    }

    .footer-main {
      font-size: 9pt;
      font-weight: 800;
      letter-spacing: 2px;
      color: #0F172A;
      text-transform: uppercase;
    }

    .footer-blessing {
      font-size: 8pt;
      font-style: italic;
      color: #64748B;
      margin-top: 1mm;
    }

    .footer-credit {
      font-size: 6.8pt;
      font-weight: 600;
      letter-spacing: 0.8px;
      color: #94A3B8;
      margin-top: 2mm;
      text-transform: uppercase;
    }

    /* OMR SHEET */
    .omr-container {
      break-before: page;
      page-break-before: always;
      padding: 6mm;
      border: 1pt solid #0F172A;
      background: #FFFFFF;
    }

    .omr-header {
      text-align: center;
      border-bottom: 1.5pt solid #0F172A;
      padding-bottom: 2.5mm;
      margin-bottom: 3.5mm;
    }

    .omr-header h2 {
      margin: 0;
      font-size: 13pt;
      letter-spacing: 0.8px;
    }

    .omr-header p {
      margin: 1mm 0 2mm;
      font-size: 8.5pt;
      color: #475569;
    }

    .omr-meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      font-weight: 700;
      margin-top: 1.5mm;
      padding-top: 1.5mm;
      border-top: 0.5pt dashed #CBD5E1;
    }

    .omr-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3mm 4mm;
      margin-top: 2.5mm;
    }

    .omr-item {
      display: flex;
      align-items: center;
      gap: 2mm;
      font-size: 9pt;
    }

    .omr-num {
      width: 6.5mm;
      font-weight: bold;
      text-align: right;
    }

    .bubble {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 4.8mm;
      height: 4.8mm;
      border: 1.2pt solid #0F172A;
      border-radius: 50%;
      font-size: 7pt;
      font-weight: 800;
    }

    .omr-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 8mm;
      padding-top: 3mm;
      border-top: 1pt solid #0F172A;
      font-size: 8.5pt;
      font-weight: 600;
    }

    .omr-credit {
      margin-top: 3mm;
      text-align: center;
      font-size: 6.8pt;
      font-weight: 600;
      letter-spacing: 0.8px;
      color: #94A3B8;
      text-transform: uppercase;
    }

    @media print {
      html, body {
        background: #FFFFFF !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .a4-sheet {
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="a4-sheet">
    ${watermarkHtml}
    ${headerHtml}

    <div class="instructions-box">
      <div class="instructions-heading">General Instructions:</div>
      <ol class="instructions-list">
        ${paper.generalInstructions.map((inst) => `<li>${renderTextWithLatex(inst)}</li>`).join('')}
      </ol>
    </div>

    ${
      renderMode === 'OMR_SHEET'
        ? omrSheetHtml
        : `<main class="questions-body ${instituteProfile.defaultColumns === 2 ? 'two-column' : ''}">
             ${sectionsHtml}
             <div class="exam-footer">
               <div class="footer-divider"></div>
               <div class="footer-main">✦ ✦ ✦ &nbsp; END OF QUESTION PAPER &nbsp; ✦ ✦ ✦</div>
               <div class="footer-blessing">Wishing you the very best in your examination!</div>
               <div class="footer-credit">Digitally composed via PaperCraft AI • Architected by Gaurav Tiwari</div>
             </div>
           </main>`
    }
  </div>
</body>
</html>`;
};

export const printA4Pdf = async (
  paper: GeneratedPaper,
  instituteProfile: InstituteProfile,
  renderMode: RenderMode,
  options?: PdfRenderOptions
): Promise<void> => {
  const html = generateA4Html(paper, instituteProfile, renderMode, options);
  // Direct Native Android & iOS Print / "Save as PDF" Dialog (Zero Permission Issues)
  await Print.printAsync({ html });
};

export const shareA4PdfFile = async (
  paper: GeneratedPaper,
  instituteProfile: InstituteProfile,
  renderMode: RenderMode,
  options?: PdfRenderOptions
): Promise<string> => {
  const html = generateA4Html(paper, instituteProfile, renderMode, options);
  const result = await Print.printToFileAsync({
    html,
    width: 595,
    height: 842
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Share ${paper.examTitle} PDF`
    });
  }
  return result.uri;
};
