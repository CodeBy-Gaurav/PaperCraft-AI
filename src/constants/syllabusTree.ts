import type { Board, SyllabusSubject, SyllabusTree } from '@/src/types/paper';

export const boards: { value: Board; label: string }[] = [
  { value: 'CBSE', label: 'CBSE' },
  { value: 'ICSE', label: 'ICSE' },
  { value: 'STATE_BOARD', label: 'State Board' },
  { value: 'OTHER', label: 'Other (Custom)' }
];

export const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Custom'];

// Grade-categorized syllabus maps
const primarySubjects = (prefix: string): SyllabusSubject[] => [
  {
    name: 'Mathematics',
    icon: '∑',
    chapters: [
      { code: `${prefix}_MATH_NUM`, title: 'Numbers & Number Names' },
      { code: `${prefix}_MATH_OPS`, title: 'Addition & Subtraction' },
      { code: `${prefix}_MATH_MULT`, title: 'Multiplication & Division' },
      { code: `${prefix}_MATH_SHAPES`, title: 'Shapes, Space & Patterns' },
      { code: `${prefix}_MATH_MEASURE`, title: 'Measurement (Length, Weight & Capacity)' },
      { code: `${prefix}_MATH_TIME`, title: 'Time & Calendar' },
      { code: `${prefix}_MATH_MONEY`, title: 'Money & Word Problems' },
      { code: `${prefix}_MATH_DATA`, title: 'Pictographs & Data Handling' }
    ]
  },
  {
    name: 'EVS / Environmental Studies',
    icon: '☘',
    chapters: [
      { code: `${prefix}_EVS_FAM`, title: 'My Family & Neighborhood' },
      { code: `${prefix}_EVS_PLANTS`, title: 'Plant Life & Uses of Plants' },
      { code: `${prefix}_EVS_ANIMALS`, title: 'Animals: Food & Habitats' },
      { code: `${prefix}_EVS_BODY`, title: 'Our Wonderful Body & Healthy Habits' },
      { code: `${prefix}_EVS_FOOD`, title: 'Food We Eat & Sources of Food' },
      { code: `${prefix}_EVS_WATER`, title: 'Water: Cleanliness & Conservation' },
      { code: `${prefix}_EVS_TRAVEL`, title: 'Travel, Transport & Communication' },
      { code: `${prefix}_EVS_NAT`, title: 'The Earth, Sun, Moon & Weather' }
    ]
  },
  {
    name: 'English',
    icon: 'A',
    chapters: [
      { code: `${prefix}_ENG_READ`, title: 'Reading Comprehension (Passages & Poems)' },
      { code: `${prefix}_ENG_NOUNS`, title: 'Nouns (Common, Proper & Collective)' },
      { code: `${prefix}_ENG_PRONOUNS`, title: 'Pronouns & Articles (A, An, The)' },
      { code: `${prefix}_ENG_VERBS`, title: 'Action Verbs & Simple Tenses' },
      { code: `${prefix}_ENG_ADJ`, title: 'Describing Words (Adjectives)' },
      { code: `${prefix}_ENG_PREP`, title: 'Prepositions (In, On, Under, Behind)' },
      { code: `${prefix}_ENG_PUNCT`, title: 'Punctuation & Capitalization' },
      { code: `${prefix}_ENG_WRITE`, title: 'Picture Composition & Short Paragraph' }
    ]
  },
  {
    name: 'Hindi',
    icon: 'क',
    chapters: [
      { code: `${prefix}_HIN_VARNA`, title: 'वर्णमाला, मात्रा ज्ञान और शब्द निर्माण' },
      { code: `${prefix}_HIN_SANGYA`, title: 'संज्ञा, सर्वनाम और विशेषण' },
      { code: `${prefix}_HIN_KRIYA`, title: 'क्रिया और काल' },
      { code: `${prefix}_HIN_VILOM`, title: 'विलोम शब्द, पर्यायवाची और लिंग-वचन' },
      { code: `${prefix}_HIN_READ`, title: 'अपठित गद्यांश' },
      { code: `${prefix}_HIN_COMP`, title: 'चित्र वर्णन और वाक्य रचना' }
    ]
  },
  {
    name: 'General Knowledge',
    icon: '★',
    chapters: [
      { code: `${prefix}_GK_INDIA`, title: 'India: National Symbols & States' },
      { code: `${prefix}_GK_SCIENCE`, title: 'Inventions, Space & Solar System' },
      { code: `${prefix}_GK_NATURE`, title: 'Wonders of Animal & Plant Kingdom' },
      { code: `${prefix}_GK_SPORTS`, title: 'Sports, Games & Champions' },
      { code: `${prefix}_GK_CIVICS`, title: 'Current Affairs & Road Safety' }
    ]
  }
];

const middleSubjects = (prefix: string): SyllabusSubject[] => [
  {
    name: 'Mathematics',
    icon: '∑',
    chapters: [
      { code: `${prefix}_MATH_INT`, title: 'Integers & Number Line' },
      { code: `${prefix}_MATH_FRAC`, title: 'Fractions & Decimals' },
      { code: `${prefix}_MATH_DATA`, title: 'Data Handling, Mean & Bar Graphs' },
      { code: `${prefix}_MATH_EQN`, title: 'Simple Linear Equations' },
      { code: `${prefix}_MATH_GEOM`, title: 'Lines, Angles & Transversals' },
      { code: `${prefix}_MATH_TRI`, title: 'Triangles & Congruence Properties' },
      { code: `${prefix}_MATH_COMP`, title: 'Comparing Quantities (Percentage, Ratio, Profit & Loss)' },
      { code: `${prefix}_MATH_RAT`, title: 'Rational Numbers & Operations' },
      { code: `${prefix}_MATH_ALG`, title: 'Algebraic Expressions & Identities' },
      { code: `${prefix}_MATH_EXP`, title: 'Exponents, Powers & Scientific Notation' },
      { code: `${prefix}_MATH_MENS`, title: 'Mensuration: Perimeter & Area' }
    ]
  },
  {
    name: 'Science',
    icon: '⚗',
    chapters: [
      { code: `${prefix}_SCI_FOOD`, title: 'Nutrition in Plants & Animals' },
      { code: `${prefix}_SCI_HEAT`, title: 'Heat, Temperature & Modes of Transfer' },
      { code: `${prefix}_SCI_ACID`, title: 'Acids, Bases & Neutralization' },
      { code: `${prefix}_SCI_PHYS`, title: 'Physical & Chemical Changes' },
      { code: `${prefix}_SCI_RESP`, title: 'Respiration in Organisms' },
      { code: `${prefix}_SCI_TRANS`, title: 'Transportation in Animals & Plants' },
      { code: `${prefix}_SCI_REPRO`, title: 'Reproduction in Plants' },
      { code: `${prefix}_SCI_MOTION`, title: 'Motion, Speed & Time Measurement' },
      { code: `${prefix}_SCI_ELEC`, title: 'Electric Current & Its Chemical/Magnetic Effects' },
      { code: `${prefix}_SCI_LIGHT`, title: 'Light: Reflection, Mirrors & Lenses' },
      { code: `${prefix}_SCI_ENV`, title: 'Forests: Our Lifeline & Wastewater Story' }
    ]
  },
  {
    name: 'Social Science',
    icon: '◎',
    chapters: [
      { code: `${prefix}_SST_HIST1`, title: 'History: Tracing Changes Through A Thousand Years' },
      { code: `${prefix}_SST_HIST2`, title: 'History: The Delhi Sultans & Mughal Empire' },
      { code: `${prefix}_SST_HIST3`, title: 'History: Tribes, Nomads & Settled Communities' },
      { code: `${prefix}_SST_GEO1`, title: 'Geography: Environment & Atmosphere' },
      { code: `${prefix}_SST_GEO2`, title: 'Geography: Our Changing Earth & Inside Our Earth' },
      { code: `${prefix}_SST_GEO3`, title: 'Geography: Water, Vegetation & Wildlife' },
      { code: `${prefix}_SST_CIV1`, title: 'Civics: On Equality & Role of Government in Health' },
      { code: `${prefix}_SST_CIV2`, title: 'Civics: Understanding Media & Markets Around Us' },
      { code: `${prefix}_SST_CIV3`, title: 'Civics: The Indian Constitution & Secularism' }
    ]
  },
  {
    name: 'English',
    icon: 'A',
    chapters: [
      { code: `${prefix}_ENG_PROSE`, title: 'Reading Comprehension (Factual & Discursive)' },
      { code: `${prefix}_ENG_POETRY`, title: 'Poetry Appreciation & Figures of Speech' },
      { code: `${prefix}_ENG_TENSES`, title: 'Grammar: Tenses & Modals' },
      { code: `${prefix}_ENG_VOICE`, title: 'Grammar: Active & Passive Voice' },
      { code: `${prefix}_ENG_SPEECH`, title: 'Grammar: Direct & Indirect Speech' },
      { code: `${prefix}_ENG_LETTER`, title: 'Formal & Informal Letter Writing' },
      { code: `${prefix}_ENG_STORY`, title: 'Story Writing & Notice Writing' }
    ]
  },
  {
    name: 'Hindi',
    icon: 'क',
    chapters: [
      { code: `${prefix}_HIN_TEXT`, title: 'गद्य एवं पद्य पाठ' },
      { code: `${prefix}_HIN_SANDHI`, title: 'संधि, समास और उपसर्ग-प्रत्यय' },
      { code: `${prefix}_HIN_MUHAVRE`, title: 'मुहावरे और लोकोक्तियाँ' },
      { code: `${prefix}_HIN_VAKYA`, title: 'वाक्य शुद्धि और विराम चिह्न' },
      { code: `${prefix}_HIN_PATRA`, title: 'पत्र लेखन और अनुच्छेद लेखन' },
      { code: `${prefix}_HIN_APATHIT`, title: 'अपठित बोध (गद्यांश व काव्यांश)' }
    ]
  },
  {
    name: 'Computer Studies',
    icon: '💻',
    chapters: [
      { code: `${prefix}_CS_HARDWARE`, title: 'Computer System, Memory & Storage' },
      { code: `${prefix}_CS_CYBER`, title: 'Cyber Safety, Digital Ethics & Netiquette' },
      { code: `${prefix}_CS_OFFICE`, title: 'Advanced Word Processing & Spreadsheets' },
      { code: `${prefix}_CS_CODING`, title: 'Programming Logic, Algorithms & Python/Scratch' }
    ]
  }
];

const secondarySubjects = (prefix: string): SyllabusSubject[] => [
  {
    name: 'Mathematics',
    icon: '∑',
    chapters: [
      { code: `${prefix}_MATH_REAL`, title: 'Real Numbers & Fundamental Theorem of Arithmetic' },
      { code: `${prefix}_MATH_POLY`, title: 'Polynomials (Zeroes & Graph Relationships)' },
      { code: `${prefix}_MATH_PAIR`, title: 'Pair of Linear Equations in Two Variables' },
      { code: `${prefix}_MATH_QUAD`, title: 'Quadratic Equations (Factorisation & Formula)' },
      { code: `${prefix}_MATH_AP`, title: 'Arithmetic Progressions (nth Term & Sum)' },
      { code: `${prefix}_MATH_TRI`, title: 'Triangles (Similarity & Pythagoras Applications)' },
      { code: `${prefix}_MATH_COORD`, title: 'Coordinate Geometry (Distance & Section Formula)' },
      { code: `${prefix}_MATH_TRIG`, title: 'Introduction to Trigonometry & Identities' },
      { code: `${prefix}_MATH_APP_TRIG`, title: 'Heights and Distances (Applications of Trig)' },
      { code: `${prefix}_MATH_CIRC`, title: 'Circles (Tangents from an External Point)' },
      { code: `${prefix}_MATH_AREAS`, title: 'Areas Related to Circles (Sectors & Segments)' },
      { code: `${prefix}_MATH_SURFACE`, title: 'Surface Areas and Volumes (Combinations of Solids)' },
      { code: `${prefix}_MATH_STAT`, title: 'Statistics (Mean, Median, Mode of Grouped Data)' },
      { code: `${prefix}_MATH_PROB`, title: 'Probability (Classical Approach)' }
    ]
  },
  {
    name: 'Science',
    icon: '⚗',
    chapters: [
      { code: `${prefix}_SCI_CHEM1`, title: 'Chemical Reactions and Equations' },
      { code: `${prefix}_SCI_CHEM2`, title: 'Acids, Bases and Salts' },
      { code: `${prefix}_SCI_CHEM3`, title: 'Metals and Non-metals' },
      { code: `${prefix}_SCI_CHEM4`, title: 'Carbon and its Compounds' },
      { code: `${prefix}_SCI_BIO1`, title: 'Life Processes (Nutrition, Respiration, Transport, Excretion)' },
      { code: `${prefix}_SCI_BIO2`, title: 'Control and Coordination in Animals & Plants' },
      { code: `${prefix}_SCI_BIO3`, title: 'How do Organisms Reproduce? (Asexual & Sexual)' },
      { code: `${prefix}_SCI_BIO4`, title: 'Heredity and Evolution' },
      { code: `${prefix}_SCI_PHY1`, title: 'Light – Reflection and Refraction' },
      { code: `${prefix}_SCI_PHY2`, title: 'The Human Eye and the Colourful World' },
      { code: `${prefix}_SCI_PHY3`, title: 'Electricity (Ohm’s Law, Resistance, Power)' },
      { code: `${prefix}_SCI_PHY4`, title: 'Magnetic Effects of Electric Current' },
      { code: `${prefix}_SCI_ENV`, title: 'Our Environment & Ecosystem Dynamics' }
    ]
  },
  {
    name: 'Social Science',
    icon: '◎',
    chapters: [
      { code: `${prefix}_SST_HIST1`, title: 'The Rise of Nationalism in Europe' },
      { code: `${prefix}_SST_HIST2`, title: 'Nationalism in India' },
      { code: `${prefix}_SST_HIST3`, title: 'The Making of a Global World' },
      { code: `${prefix}_SST_HIST4`, title: 'Print Culture and the Modern World' },
      { code: `${prefix}_SST_GEO1`, title: 'Resources and Development' },
      { code: `${prefix}_SST_GEO2`, title: 'Forest and Wildlife Resources' },
      { code: `${prefix}_SST_GEO3`, title: 'Water Resources' },
      { code: `${prefix}_SST_GEO4`, title: 'Agriculture' },
      { code: `${prefix}_SST_GEO5`, title: 'Minerals and Energy Resources' },
      { code: `${prefix}_SST_GEO6`, title: 'Manufacturing Industries' },
      { code: `${prefix}_SST_CIV1`, title: 'Power Sharing' },
      { code: `${prefix}_SST_CIV2`, title: 'Federalism' },
      { code: `${prefix}_SST_CIV3`, title: 'Gender, Religion and Caste' },
      { code: `${prefix}_SST_CIV4`, title: 'Political Parties' },
      { code: `${prefix}_SST_CIV5`, title: 'Outcomes of Democracy' },
      { code: `${prefix}_SST_ECO1`, title: 'Development' },
      { code: `${prefix}_SST_ECO2`, title: 'Sectors of the Indian Economy' },
      { code: `${prefix}_SST_ECO3`, title: 'Money and Credit' },
      { code: `${prefix}_SST_ECO4`, title: 'Globalisation and the Indian Economy' }
    ]
  },
  {
    name: 'English Language & Literature',
    icon: 'A',
    chapters: [
      { code: `${prefix}_ENG_READ`, title: 'Reading: Discursive & Case-based Factual Passages' },
      { code: `${prefix}_ENG_WRITE1`, title: 'Formal Letter Writing (Order, Complaint, Enquiry)' },
      { code: `${prefix}_ENG_WRITE2`, title: 'Analytical Paragraph (Data/Map/Chart Interpretation)' },
      { code: `${prefix}_ENG_GRAM`, title: 'Grammar: Tenses, Modals, Determiners & Reported Speech' },
      { code: `${prefix}_ENG_LIT1`, title: 'First Flight: Prose & Poetry' },
      { code: `${prefix}_ENG_LIT2`, title: 'Footprints Without Feet: Supplementary Reader' }
    ]
  },
  {
    name: 'Hindi Course A / B',
    icon: 'क',
    chapters: [
      { code: `${prefix}_HIN_APATHIT`, title: 'अपठित गद्यांश एवं पद्यांश' },
      { code: `${prefix}_HIN_PAD`, title: 'पदबंध, वाक्य रचना व समास' },
      { code: `${prefix}_HIN_MUHAVRE`, title: 'मुहावरे एवं व्यावहारिक व्याकरण' },
      { code: `${prefix}_HIN_SPARSH`, title: 'पाठ्यपुस्तक: गद्य एवं पद्य खंड' },
      { code: `${prefix}_HIN_LEKHAN`, title: 'रचनात्मक लेखन: अनुच्छेद, पत्र, सूचना, विज्ञापन, संदेश' }
    ]
  },
  {
    name: 'Information Technology (IT 402)',
    icon: '💻',
    chapters: [
      { code: `${prefix}_IT_COMM`, title: 'Communication & Self-Management Skills' },
      { code: `${prefix}_IT_DOC`, title: 'Digital Documentation (Advanced)' },
      { code: `${prefix}_IT_SHEET`, title: 'Electronic Spreadsheet (Advanced)' },
      { code: `${prefix}_IT_DBMS`, title: 'Database Management System (RDBMS)' },
      { code: `${prefix}_IT_WEB`, title: 'Web Applications and Security' }
    ]
  }
];

const seniorSubjects = (prefix: string): SyllabusSubject[] => [
  {
    name: 'Physics',
    icon: 'ϟ',
    chapters: [
      { code: `${prefix}_PHY_ELECTRO`, title: 'Electric Charges, Fields & Gauss Theorem' },
      { code: `${prefix}_PHY_POT`, title: 'Electrostatic Potential & Capacitance' },
      { code: `${prefix}_PHY_CURR`, title: 'Current Electricity & Kirchhoff Laws' },
      { code: `${prefix}_PHY_MAG`, title: 'Moving Charges & Magnetism' },
      { code: `${prefix}_PHY_EMI`, title: 'Electromagnetic Induction & Alternating Currents' },
      { code: `${prefix}_PHY_OPTICS`, title: 'Ray Optics, Wave Optics & Huygens Principle' },
      { code: `${prefix}_PHY_DUAL`, title: 'Dual Nature of Radiation and Matter' },
      { code: `${prefix}_PHY_ATOMS`, title: 'Atoms & Nuclei (Bohr Model & Nuclear Binding)' },
      { code: `${prefix}_PHY_SEMI`, title: 'Semiconductor Electronics: Materials, Devices & Simple Circuits' }
    ]
  },
  {
    name: 'Chemistry',
    icon: '⚛',
    chapters: [
      { code: `${prefix}_CHEM_SOLN`, title: 'Solutions (Colligative Properties & Raoult’s Law)' },
      { code: `${prefix}_CHEM_ELECTRO`, title: 'Electrochemistry (Nernst Equation & Kohlrausch Law)' },
      { code: `${prefix}_CHEM_KINETICS`, title: 'Chemical Kinetics (Rate Law & Arrhenius Equation)' },
      { code: `${prefix}_CHEM_DFBLOCK`, title: 'The d- and f-Block Elements' },
      { code: `${prefix}_CHEM_COORD`, title: 'Coordination Compounds (CFT & Isomerism)' },
      { code: `${prefix}_CHEM_HALO`, title: 'Haloalkanes and Haloarenes (SN1/SN2 Mechanisms)' },
      { code: `${prefix}_CHEM_ALC`, title: 'Alcohols, Phenols and Ethers' },
      { code: `${prefix}_CHEM_ALD`, title: 'Aldehydes, Ketones and Carboxylic Acids' },
      { code: `${prefix}_CHEM_AMINES`, title: 'Amines & Diazonium Salts' },
      { code: `${prefix}_CHEM_BIO`, title: 'Biomolecules (Carbohydrates, Proteins, DNA/RNA)' }
    ]
  },
  {
    name: 'Mathematics',
    icon: '∑',
    chapters: [
      { code: `${prefix}_MATH_REL`, title: 'Relations and Functions & Inverse Trig' },
      { code: `${prefix}_MATH_MAT`, title: 'Matrices and Determinants (Inverses & Systems)' },
      { code: `${prefix}_MATH_CONT`, title: 'Continuity, Differentiability & Mean Value' },
      { code: `${prefix}_MATH_AOD`, title: 'Applications of Derivatives (Maxima & Minima)' },
      { code: `${prefix}_MATH_INT`, title: 'Integrals (Definite & Indefinite Techniques)' },
      { code: `${prefix}_MATH_AOI`, title: 'Applications of the Integrals (Area Under Curve)' },
      { code: `${prefix}_MATH_DIFFEQ`, title: 'Differential Equations (Separable & Linear)' },
      { code: `${prefix}_MATH_VEC`, title: 'Vector Algebra (Dot & Cross Products)' },
      { code: `${prefix}_MATH_3D`, title: 'Three Dimensional Geometry (Lines & Planes)' },
      { code: `${prefix}_MATH_LPP`, title: 'Linear Programming (Corner Point Method)' },
      { code: `${prefix}_MATH_PROB`, title: 'Probability (Conditional & Bayes Theorem)' }
    ]
  },
  {
    name: 'Biology',
    icon: '♧',
    chapters: [
      { code: `${prefix}_BIO_REPRO`, title: 'Sexual Reproduction in Flowering Plants' },
      { code: `${prefix}_BIO_HUMAN_REPRO`, title: 'Human Reproduction & Reproductive Health' },
      { code: `${prefix}_BIO_GEN1`, title: 'Principles of Inheritance and Variation' },
      { code: `${prefix}_BIO_GEN2`, title: 'Molecular Basis of Inheritance (Replication, Translation)' },
      { code: `${prefix}_BIO_EVO`, title: 'Evolution & Natural Selection' },
      { code: `${prefix}_BIO_HEALTH`, title: 'Human Health and Disease (Immunity, Cancer, AIDS)' },
      { code: `${prefix}_BIO_BIOTECH1`, title: 'Biotechnology: Principles and Processes' },
      { code: `${prefix}_BIO_BIOTECH2`, title: 'Biotechnology and its Applications' },
      { code: `${prefix}_BIO_ECOL1`, title: 'Organisms and Populations' },
      { code: `${prefix}_BIO_ECOL2`, title: 'Ecosystem & Biodiversity Conservation' }
    ]
  },
  {
    name: 'Accountancy',
    icon: '📒',
    chapters: [
      { code: `${prefix}_ACC_PART1`, title: 'Accounting for Partnership: Fundamentals & Goodwill' },
      { code: `${prefix}_ACC_PART2`, title: 'Admission, Retirement & Death of a Partner' },
      { code: `${prefix}_ACC_PART3`, title: 'Dissolution of a Partnership Firm' },
      { code: `${prefix}_ACC_SHARE`, title: 'Accounting for Share Capital (Issue & Forfeiture)' },
      { code: `${prefix}_ACC_DEB`, title: 'Issue of Debentures & Redemption' },
      { code: `${prefix}_ACC_FS`, title: 'Financial Statements of a Company' },
      { code: `${prefix}_ACC_RATIO`, title: 'Accounting Ratios (Liquidity, Solvency, Turnover)' },
      { code: `${prefix}_ACC_CASH`, title: 'Cash Flow Statement (AS-3 Revised)' }
    ]
  },
  {
    name: 'Business Studies',
    icon: '💼',
    chapters: [
      { code: `${prefix}_BST_NAT`, title: 'Nature and Significance of Management' },
      { code: `${prefix}_BST_PRIN`, title: 'Principles of Management (Fayol & Taylor)' },
      { code: `${prefix}_BST_ENV`, title: 'Business Environment (Demonetisation & Globalization)' },
      { code: `${prefix}_BST_PLAN`, title: 'Planning (Process & Types of Plans)' },
      { code: `${prefix}_BST_ORG`, title: 'Organising (Structure, Delegation & Decentralisation)' },
      { code: `${prefix}_BST_STAFF`, title: 'Staffing (Recruitment, Selection & Training)' },
      { code: `${prefix}_BST_DIR`, title: 'Directing (Supervision, Motivation, Leadership)' },
      { code: `${prefix}_BST_CTRL`, title: 'Controlling (Process & Importance)' },
      { code: `${prefix}_BST_FIN`, title: 'Financial Management & Capital Structure' },
      { code: `${prefix}_BST_MKTG`, title: 'Marketing Management (4Ps & Philosophy)' },
      { code: `${prefix}_BST_CONS`, title: 'Consumer Protection (Rights & Redressal)' }
    ]
  },
  {
    name: 'Economics',
    icon: '📈',
    chapters: [
      { code: `${prefix}_ECO_MACRO_NI`, title: 'Macroeconomics: National Income & Aggregates' },
      { code: `${prefix}_ECO_MACRO_MONEY`, title: 'Macroeconomics: Money and Banking (RBI Functions)' },
      { code: `${prefix}_ECO_MACRO_AD`, title: 'Macroeconomics: Determination of Income and Employment' },
      { code: `${prefix}_ECO_MACRO_GOVT`, title: 'Macroeconomics: Government Budget and the Economy' },
      { code: `${prefix}_ECO_MACRO_BOP`, title: 'Macroeconomics: Balance of Payments & Foreign Exchange' },
      { code: `${prefix}_ECO_IED_EVE`, title: 'Indian Economy on the Eve of Independence' },
      { code: `${prefix}_ECO_IED_DEV`, title: 'Indian Economy (1950-1990) & LPG Reforms 1991' },
      { code: `${prefix}_ECO_IED_CHALLENGES`, title: 'Human Capital, Rural Development & Employment' },
      { code: `${prefix}_ECO_IED_COMP`, title: 'Comparative Development: India, China & Pakistan' }
    ]
  },
  {
    name: 'Computer Science (Python)',
    icon: '🐍',
    chapters: [
      { code: `${prefix}_CS_PYTHON`, title: 'Python Revision Tour (Data Types, Functions, Strings)' },
      { code: `${prefix}_CS_FILES`, title: 'File Handling (Text, Binary & CSV Files)' },
      { code: `${prefix}_CS_STACK`, title: 'Data Structures: Stack Operations (Push/Pop)' },
      { code: `${prefix}_CS_NET`, title: 'Computer Networks (Topologies, Protocols & Security)' },
      { code: `${prefix}_CS_SQL`, title: 'Database Management: SQL Queries & Group By' },
      { code: `${prefix}_CS_PYTHON_SQL`, title: 'Interface Python with SQL Database' }
    ]
  },
  {
    name: 'English Core',
    icon: 'A',
    chapters: [
      { code: `${prefix}_ENG_READ`, title: 'Reading Comprehension (Unseen Passages)' },
      { code: `${prefix}_ENG_NOTICE`, title: 'Creative Writing: Notice, Invitation & Replies' },
      { code: `${prefix}_ENG_LETTER`, title: 'Letter to Editor & Application for Job' },
      { code: `${prefix}_ENG_ARTICLE`, title: 'Article Writing & Report Writing' },
      { code: `${prefix}_ENG_FLAMINGO`, title: 'Flamingo: Prose & Poetry' },
      { code: `${prefix}_ENG_VISTAS`, title: 'Vistas: Supplementary Reader' }
    ]
  }
];

export const getSubjectsForClass = (board: Board | string, className: string): SyllabusSubject[] => {
  const cleanClass = className.trim();
  const classNum = parseInt(cleanClass, 10);
  const prefix = `${board}_${cleanClass}`.toUpperCase().replace(/\s+/g, '_');

  if (!Number.isNaN(classNum)) {
    if (classNum >= 1 && classNum <= 5) return primarySubjects(prefix);
    if (classNum >= 6 && classNum <= 8) return middleSubjects(prefix);
    if (classNum >= 9 && classNum <= 10) return secondarySubjects(prefix);
    if (classNum >= 11 && classNum <= 12) return seniorSubjects(prefix);
  }
  // Default fallback for custom or unspecified grades
  return secondarySubjects(prefix);
};

// Legacy compatibility tree
export const syllabusTree: SyllabusTree = {
  CBSE: {
    '1': primarySubjects('CBSE_1'),
    '2': primarySubjects('CBSE_2'),
    '3': primarySubjects('CBSE_3'),
    '4': primarySubjects('CBSE_4'),
    '5': primarySubjects('CBSE_5'),
    '6': middleSubjects('CBSE_6'),
    '7': middleSubjects('CBSE_7'),
    '8': middleSubjects('CBSE_8'),
    '9': secondarySubjects('CBSE_9'),
    '10': secondarySubjects('CBSE_10'),
    '11': seniorSubjects('CBSE_11'),
    '12': seniorSubjects('CBSE_12')
  },
  ICSE: {
    '1': primarySubjects('ICSE_1'),
    '2': primarySubjects('ICSE_2'),
    '3': primarySubjects('ICSE_3'),
    '4': primarySubjects('ICSE_4'),
    '5': primarySubjects('ICSE_5'),
    '6': middleSubjects('ICSE_6'),
    '7': middleSubjects('ICSE_7'),
    '8': middleSubjects('ICSE_8'),
    '9': secondarySubjects('ICSE_9'),
    '10': secondarySubjects('ICSE_10'),
    '11': seniorSubjects('ICSE_11'),
    '12': seniorSubjects('ICSE_12')
  },
  STATE_BOARD: {
    '1': primarySubjects('STATE_1'),
    '2': primarySubjects('STATE_2'),
    '3': primarySubjects('STATE_3'),
    '4': primarySubjects('STATE_4'),
    '5': primarySubjects('STATE_5'),
    '6': middleSubjects('STATE_6'),
    '7': middleSubjects('STATE_7'),
    '8': middleSubjects('STATE_8'),
    '9': secondarySubjects('STATE_9'),
    '10': secondarySubjects('STATE_10'),
    '11': seniorSubjects('STATE_11'),
    '12': seniorSubjects('STATE_12')
  },
  OTHER: {
    '1': primarySubjects('OTHER_1'),
    '2': primarySubjects('OTHER_2'),
    '3': primarySubjects('OTHER_3'),
    '4': primarySubjects('OTHER_4'),
    '5': primarySubjects('OTHER_5'),
    '6': middleSubjects('OTHER_6'),
    '7': middleSubjects('OTHER_7'),
    '8': middleSubjects('OTHER_8'),
    '9': secondarySubjects('OTHER_9'),
    '10': secondarySubjects('OTHER_10'),
    '11': seniorSubjects('OTHER_11'),
    '12': seniorSubjects('OTHER_12')
  }
};
