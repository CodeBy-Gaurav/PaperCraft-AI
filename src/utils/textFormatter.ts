/**
 * Helper to cleanly format LaTeX and scientific notation for React Native Text components,
 * eliminating raw $ symbols around standalone numbers and rendering clean Unicode math.
 */

const symbolMap: Record<string, string> = {
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\Delta': 'Δ',
  '\\theta': 'θ',
  '\\pi': 'π',
  '\\sigma': 'σ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\Omega': 'Ω',
  '\\omega': 'ω',
  '\\rightarrow': '→',
  '\\Rightarrow': '⇒',
  '\\times': '×',
  '\\div': '÷',
  '\\leq': '≤',
  '\\geq': '≥',
  '\\neq': '≠',
  '\\approx': '≈',
  '\\pm': '±',
  '\\infty': '∞',
  '\\degree': '°',
  '\\circ': '°',
  '\\sqrt': '√'
};

const superscriptMap: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  'n': 'ⁿ',
  'x': 'ˣ'
};

const subscriptMap: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  '+': '₊',
  '-': '₋'
};

export const formatDisplayLatex = (text: string): string => {
  if (!text) return '';

  let formatted = text;

  // 1. Remove \text{...} wrappers -> ...
  formatted = formatted.replace(/\\text\{([^}]+)\}/g, '$1');

  // 2. Remove \mathrm{...} wrappers -> ...
  formatted = formatted.replace(/\\mathrm\{([^}]+)\}/g, '$1');

  // 3. Remove \mathbf{...} wrappers -> ...
  formatted = formatted.replace(/\\mathbf\{([^}]+)\}/g, '$1');

  // 4. Convert \frac{a}{b} -> a/b
  formatted = formatted.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)');

  // 5. Convert Greek and math symbols
  Object.entries(symbolMap).forEach(([latex, unicode]) => {
    formatted = formatted.split(latex).join(unicode);
  });

  // 6. Convert superscripts like x^2, x^{3}, 10^5
  formatted = formatted.replace(/\^\{?([0-9+\-nx]+)\}?/g, (_, exp: string) => {
    return exp.split('').map((char) => superscriptMap[char] ?? char).join('');
  });

  // 7. Convert subscripts like H_2O, CO_2
  formatted = formatted.replace(/_\{?([0-9+\-]+)\}?/g, (_, sub: string) => {
    return sub.split('').map((char) => subscriptMap[char] ?? char).join('');
  });

  // 8. CRITICAL USER FIX: Strip raw $ around standalone numbers and simple expressions
  // e.g. "$17$" -> "17", "$2 hours$" -> "2 hours", "$6V$" -> "6V", "$20 Ω$" -> "20 Ω"
  formatted = formatted.replace(/\$([^\$]+)\$/g, '$1');

  // 9. Remove double $$ block delimiters if any
  formatted = formatted.replace(/\$\$([\s\S]+?)\$\$/g, '$1');

  // 10. Clean up extra backslashes before spaces
  formatted = formatted.replace(/\\\s/g, ' ');

  return formatted.trim();
};
