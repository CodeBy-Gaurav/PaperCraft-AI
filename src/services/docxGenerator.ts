import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from 'docx';
import type { GeneratedPaper, InstituteProfile, QuestionItem } from '@/src/types/paper';

const symbols: Record<string, string> = {
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\theta': 'θ',
  '\\pi': 'π',
  '\\Omega': 'Ω',
  '\\rightarrow': '→',
  '\\times': '×',
  '\\leq': '≤',
  '\\geq': '≥',
  '\\Delta': 'Δ',
  '\\approx': '≈',
  '\\pm': '±'
};

export const parseLatexToWordRuns = (value: string): TextRun[] => {
  const source = value
    .replace(/\$/g, '')
    .replace(/\\(alpha|beta|theta|pi|Omega|rightarrow|times|leq|geq|Delta|approx|pm)/g, (token) => symbols[`\\${token}`] ?? token);

  const runs: TextRun[] = [];
  let cursor = 0;
  const pattern = /([A-Za-z0-9]+)\^\{?([^\s}\^]+)\}?|([A-Za-z]+)_\{?([^\s}_]+)\}?/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > cursor) {
      runs.push(new TextRun(source.slice(cursor, match.index)));
    }
    if (match[1] && match[2]) {
      runs.push(new TextRun(match[1]));
      runs.push(new TextRun({ text: match[2], superScript: true }));
    }
    if (match[3] && match[4]) {
      runs.push(new TextRun(match[3]));
      runs.push(new TextRun({ text: match[4], subScript: true }));
    }
    cursor = match.index + match[0].length;
  }

  if (cursor < source.length) {
    runs.push(new TextRun(source.slice(cursor)));
  }

  return runs.length > 0 ? runs : [new TextRun(source)];
};

const paragraphFromQuestion = (question: QuestionItem, includeAnswers: boolean): Paragraph[] => {
  const paragraphs = [new Paragraph({ children: parseLatexToWordRuns(question.questionLatex) })];

  if (question.options) {
    paragraphs.push(
      new Paragraph({
        children: Object.entries(question.options).flatMap(([key, value]) => [
          new TextRun({ text: `(${key}) `, bold: true }),
          ...parseLatexToWordRuns(`${value}   `)
        ])
      })
    );
  }

  if (question.orChoiceQuestion) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: '— OR —', bold: true })]
      }),
      ...paragraphFromQuestion(question.orChoiceQuestion, includeAnswers)
    );
  }

  if (includeAnswers) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Marking Scheme [${question.marks}M]: `, bold: true, color: '0D9488' }),
          new TextRun({ text: question.answerKeyLatex, italics: true, color: '0D9488' })
        ]
      })
    );
  }

  return paragraphs;
};

const questionTableRow = (number: number, question: QuestionItem, includeAnswers: boolean): TableRow => {
  const body = paragraphFromQuestion(question, includeAnswers);
  return new TableRow({
    cantSplit: true,
    children: [
      new TableCell({
        width: { size: 650, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: `${number}.`, bold: true })] })]
      }),
      new TableCell({
        width: { size: 8200, type: WidthType.DXA },
        children: body
      }),
      new TableCell({
        width: { size: 900, type: WidthType.DXA },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: `[${question.marks}]`, bold: true })]
          })
        ]
      })
    ]
  });
};

export const generateAndShareDocx = async (
  paper: GeneratedPaper,
  instituteProfile: InstituteProfile,
  includeAnswers: boolean
): Promise<string> => {
  const header = new Table({
    columnWidths: [2000, 7000, 2000],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: instituteProfile.schoolName, bold: true, size: 26 })]
              })
            ]
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: instituteProfile.affiliationNumber || instituteProfile.subtitle, size: 18 }),
                  new TextRun({ break: 1 }),
                  new TextRun({ text: instituteProfile.sessionYear || 'Academic Session 2026–2027', italics: true, size: 16 }),
                  new TextRun({ break: 1 }),
                  new TextRun({ text: paper.examTitle, bold: true, size: 22 })
                ]
              })
            ]
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: `Max Marks: ${paper.totalMarks}`, bold: true }),
                  new TextRun({ break: 1 }),
                  new TextRun({ text: `Time: ${paper.durationMinutes}m`, bold: true })
                ]
              })
            ]
          })
        ]
      })
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' }
    }
  });

  const children: (Paragraph | Table)[] = [
    header,
    new Paragraph({
      children: [
        new TextRun({ text: `${paper.subject} • ${paper.className}`, bold: true }),
        new TextRun({ text: `\tCandidate Roll No: [________________]`, bold: true })
      ]
    }),
    new Paragraph({ text: 'General Instructions', heading: HeadingLevel.HEADING_2 }),
    ...paper.generalInstructions.map((instruction) => new Paragraph({ text: instruction, bullet: { level: 0 } }))
  ];

  // Continuous numbering across all sections
  let runningNumber = 0;
  for (const section of paper.sections) {
    const sectionMarks = section.questions.length * section.section.marksPerQuestion;
    children.push(
      new Paragraph({
        text: `${section.section.sectionTitle} [${sectionMarks} Marks]`,
        heading: HeadingLevel.HEADING_2
      })
    );
    children.push(
      new Table({
        columnWidths: [650, 8200, 900],
        rows: section.questions.map((question) => {
          runningNumber += 1;
          return questionTableRow(runningNumber, question, includeAnswers);
        }),
        borders: {
          top: TableBorder.NONE,
          bottom: TableBorder.NONE,
          left: TableBorder.NONE,
          right: TableBorder.NONE,
          insideHorizontal: TableBorder.NONE,
          insideVertical: TableBorder.NONE
        }
      })
    );
  }

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 720, right: 720, bottom: 720, left: 720 }
          },
          column: instituteProfile.defaultColumns === 2 ? { count: 2, space: 720 } : undefined
        },
        children
      }
    ]
  });

  const base64 = await Packer.toBase64String(document);
  const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
  const cleanDir = cacheDir.endsWith('/') ? cacheDir : `${cacheDir}/`;
  const safeTitle = paper.examTitle.replace(/[^a-zA-Z0-9]/g, '_');
  const uri = `${cleanDir}PaperCraft-${safeTitle}-${paper.id}.docx`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      dialogTitle: `Share ${paper.examTitle} (.docx)`
    });
  }

  return uri;
};

const TableBorder = {
  NONE: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
};

void Buffer;
