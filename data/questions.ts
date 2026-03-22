// 英语知识点及试题数据
export interface Question {
  id: string;
  type: 'vocab' | 'grammar' | 'reading' | 'listening';
  difficulty: number;  // 0.1-1.0
  knowledgeId: string;
  content: string;
  options: string[];
  answer: number;
  explanation: string;
}

// ==================== 词汇题 ====================
export const VOCAB_QUESTIONS: Question[] = [
  // 基础词汇 (difficulty 0.1-0.3)
  {
    id: 'v001', type: 'vocab', difficulty: 0.1, knowledgeId: 'vocab_basic',
    content: 'Choose the correct meaning: "happy"',
    options: ['sad', 'glad', 'angry', 'tired'],
    answer: 1, explanation: 'happy 意为"快乐的"，与 glad 同义'
  },
  {
    id: 'v002', type: 'vocab', difficulty: 0.1, knowledgeId: 'vocab_basic',
    content: 'Choose the correct meaning: "big"',
    options: ['small', 'large', 'thin', 'short'],
    answer: 1, explanation: 'big 意为"大的"，与 large 同义'
  },
  {
    id: 'v003', type: 'vocab', difficulty: 0.2, knowledgeId: 'vocab_basic',
    content: 'Choose the correct meaning: "begin"',
    options: ['end', 'start', 'stop', 'close'],
    answer: 1, explanation: 'begin 意为"开始"，与 start 同义'
  },
  {
    id: 'v004', type: 'vocab', difficulty: 0.2, knowledgeId: 'vocab_basic',
    content: 'Choose the correct meaning: "quickly"',
    options: ['slowly', 'fast', 'quietly', 'loudly'],
    answer: 1, explanation: 'quickly 意为"快速地"，与 fast 同义'
  },
  {
    id: 'v005', type: 'vocab', difficulty: 0.2, knowledgeId: 'vocab_basic',
    content: 'Choose the correct meaning: "beautiful"',
    options: ['ugly', 'pretty', 'old', 'new'],
    answer: 1, explanation: 'beautiful 意为"美丽的"，与 pretty 同义'
  },
  {
    id: 'v006', type: 'vocab', difficulty: 0.3, knowledgeId: 'vocab_1500',
    content: 'Choose the correct meaning: "abandon"',
    options: ['keep', 'give up', 'find', 'throw'],
    answer: 1, explanation: 'abandon 意为"放弃"，指完全丢弃或离开'
  },
  {
    id: 'v007', type: 'vocab', difficulty: 0.3, knowledgeId: 'vocab_1500',
    content: 'Choose the correct meaning: "achieve"',
    options: ['fail', 'reach', 'stop', 'avoid'],
    answer: 1, explanation: 'achieve 意为"达到，实现"，通过努力获得'
  },
  {
    id: 'v008', type: 'vocab', difficulty: 0.3, knowledgeId: 'vocab_1500',
    content: 'Choose the correct meaning: "ability"',
    options: ['inability', 'power', 'weakness', 'problem'],
    answer: 1, explanation: 'ability 意为"能力"，指做某事的能力'
  },
  {
    id: 'v009', type: 'vocab', difficulty: 0.4, knowledgeId: 'vocab_2000',
    content: 'Choose the correct meaning: "abundant"',
    options: ['scarce', 'plentiful', 'empty', 'rare'],
    answer: 1, explanation: 'abundant 意为"丰富的，大量的"'
  },
  {
    id: 'v010', type: 'vocab', difficulty: 0.4, knowledgeId: 'vocab_2000',
    content: 'Choose the correct meaning: "absorb"',
    options: ['release', 'take in', 'reject', 'create'],
    answer: 1, explanation: 'absorb 意为"吸收"，也可指理解掌握'
  },
  {
    id: 'v011', type: 'vocab', difficulty: 0.5, knowledgeId: 'vocab_3500',
    content: 'Choose the correct meaning: "academic"',
    options: ['practical', 'scholarly', 'simple', 'basic'],
    answer: 1, explanation: 'academic 意为"学术的"，与学习和研究相关'
  },
  {
    id: 'v012', type: 'vocab', difficulty: 0.5, knowledgeId: 'vocab_3500',
    content: 'Choose the correct meaning: "acquire"',
    options: ['lose', 'obtain', 'sell', 'destroy'],
    answer: 1, explanation: 'acquire 意为"获得，取得"'
  },
  {
    id: 'v013', type: 'vocab', difficulty: 0.6, knowledgeId: 'vocab_cet4',
    content: 'Choose the correct meaning: "acknowledge"',
    options: ['deny', 'admit', 'ignore', 'forget'],
    answer: 1, explanation: 'acknowledge 意为"承认，认可"'
  },
  {
    id: 'v014', type: 'vocab', difficulty: 0.6, knowledgeId: 'vocab_cet4',
    content: 'Choose the correct meaning: "accomplish"',
    options: ['fail', 'complete', 'start', 'plan'],
    answer: 1, explanation: 'accomplish 意为"完成，达到"'
  },
  {
    id: 'v015', type: 'vocab', difficulty: 0.7, knowledgeId: 'vocab_cet4',
    content: 'Choose the correct meaning: "aggregate"',
    options: ['separate', 'total', 'individual', 'single'],
    answer: 1, explanation: 'aggregate 意为"总计，合计"'
  },
  {
    id: 'v016', type: 'vocab', difficulty: 0.7, knowledgeId: 'vocab_cet4',
    content: 'Choose the correct meaning: "alleviate"',
    options: ['worsen', 'ease', 'cause', 'increase'],
    answer: 1, explanation: 'alleviate 意为"减轻，缓和"'
  },
  {
    id: 'v017', type: 'vocab', difficulty: 0.8, knowledgeId: 'vocab_cet4',
    content: 'Choose the correct meaning: "ambiguous"',
    options: ['clear', 'unclear', 'certain', 'definite'],
    answer: 1, explanation: 'ambiguous 意为"模棱两可的，含糊不清的"'
  },
  {
    id: 'v018', type: 'vocab', difficulty: 0.8, knowledgeId: 'vocab_cet4',
    content: 'Choose the correct meaning: "ameliorate"',
    options: ['worsen', 'improve', 'destroy', 'reduce'],
    answer: 1, explanation: 'ameliorate 意为"改善，改进"'
  },
  {
    id: 'v019', type: 'vocab', difficulty: 0.9, knowledgeId: 'vocab_cet4',
    content: 'Choose the correct meaning: "anachronism"',
    options: ['modern', 'out of time', 'current', 'new'],
    answer: 1, explanation: 'anachronism 意为"时代错误，不合时宜的事物"'
  },
  {
    id: 'v020', type: 'vocab', difficulty: 0.9, knowledgeId: 'vocab_cet4',
    content: 'Choose the correct meaning: "antediluvian"',
    options: ['new', 'ancient', 'modern', 'recent'],
    answer: 1, explanation: 'antediluvian 意为"古老的，过时的"'
  },
];

// ==================== 语法题 ====================
export const GRAMMAR_QUESTIONS: Question[] = [
  // 时态题
  {
    id: 'g001', type: 'grammar', difficulty: 0.2, knowledgeId: 'tense_present',
    content: 'She ___ English every day.',
    options: ['study', 'studies', 'studied', 'is studying'],
    answer: 1, explanation: '一般现在时，主语是第三人称单数，动词加-s'
  },
  {
    id: 'g002', type: 'grammar', difficulty: 0.3, knowledgeId: 'tense_past',
    content: 'Yesterday, I ___ to school.',
    options: ['walk', 'walks', 'walked', 'walking'],
    answer: 2, explanation: '一般过去时，表示过去发生的动作，用动词过去式'
  },
  {
    id: 'g003', type: 'grammar', difficulty: 0.4, knowledgeId: 'tense_future',
    content: 'I ___ my homework tomorrow.',
    options: ['do', 'does', 'did', 'will do'],
    answer: 3, explanation: '一般将来时，表示将要发生的动作，用 will + 动词原形'
  },
  {
    id: 'g004', type: 'grammar', difficulty: 0.4, knowledgeId: 'tense_present',
    content: 'Look! The baby ___.',
    options: ['sleeps', 'is sleeping', 'slept', 'sleep'],
    answer: 1, explanation: '现在进行时，表示正在进行的动作，用 is/am/are + 动词-ing'
  },
  {
    id: 'g005', type: 'grammar', difficulty: 0.5, knowledgeId: 'tense_perfect',
    content: 'I have ___ here since 2020.',
    options: ['come', 'came', 'coming', 'been'],
    answer: 3, explanation: '现在完成时，since+时间点，用 have/has + 过去分词，come的过去分词是come或been'
  },
  {
    id: 'g006', type: 'grammar', difficulty: 0.5, knowledgeId: 'tense_perfect',
    content: 'She ___ her homework already.',
    options: ['finish', 'finishes', 'finished', 'has finished'],
    answer: 3, explanation: '现在完成时，表示已经完成的动作，用 have/has + 过去分词'
  },
  {
    id: 'g007', type: 'grammar', difficulty: 0.6, knowledgeId: 'tense_past',
    content: 'By the time I arrived, she ___.',
    options: ['leaves', 'left', 'had left', 'has left'],
    answer: 2, explanation: '过去完成时，by the time 表示过去的过去，用 had + 过去分词'
  },
  {
    id: 'g008', type: 'grammar', difficulty: 0.6, knowledgeId: 'tense_future',
    content: 'If it rains tomorrow, we ___ at home.',
    options: ['stay', 'stays', 'stayed', 'will stay'],
    answer: 0, explanation: '条件状语从句用一般现在时表示将来，主句用 will + 动词原形'
  },
  // 被动语态
  {
    id: 'g009', type: 'grammar', difficulty: 0.4, knowledgeId: 'grammar_voice',
    content: 'The book ___ by millions of people.',
    options: ['is read', 'reads', 'read', 'has read'],
    answer: 0, explanation: '被动语态 be + 过去分词，一般现在时 is/am/are + 过去分词'
  },
  {
    id: 'g010', type: 'grammar', difficulty: 0.5, knowledgeId: 'grammar_voice',
    content: 'The house ___ last year.',
    options: ['builds', 'is built', 'was built', 'has built'],
    answer: 2, explanation: '一般过去时的被动语态 was/were + 过去分词'
  },
  {
    id: 'g011', type: 'grammar', difficulty: 0.6, knowledgeId: 'grammar_voice',
    content: 'The work ___ now.',
    options: ['does', 'is done', 'was done', 'has done'],
    answer: 1, explanation: '现在进行时的被动语态 is/am/are + being + 过去分词'
  },
  // 定语从句
  {
    id: 'g012', type: 'grammar', difficulty: 0.5, knowledgeId: 'clause_relative',
    content: 'The book ___ cover is red is mine.',
    options: ['who', 'whose', 'whom', 'that'],
    answer: 1, explanation: 'whose 表示所有格，修饰 cover'
  },
  {
    id: 'g013', type: 'grammar', difficulty: 0.6, knowledgeId: 'clause_relative',
    content: 'The man ___ helped me is a teacher.',
    options: ['who', 'whom', 'whose', 'which'],
    answer: 0, explanation: 'who 指代人，在从句中作主语'
  },
  {
    id: 'g014', type: 'grammar', difficulty: 0.6, knowledgeId: 'clause_relative',
    content: 'I still remember the day ___ we first met.',
    options: ['which', 'that', 'when', 'where'],
    answer: 2, explanation: 'when 指代时间，在从句中作时间状语'
  },
  {
    id: 'g015', type: 'grammar', difficulty: 0.7, knowledgeId: 'clause_relative',
    content: 'This is the factory ___ we visited last week.',
    options: ['which', 'that', 'where', 'who'],
    answer: 0, explanation: 'which/that 指代物，在从句中作宾语可省略'
  },
  // 名词性从句
  {
    id: 'g016', type: 'grammar', difficulty: 0.6, knowledgeId: 'clause_noun',
    content: '___ he is coming is true.',
    options: ['What', 'That', 'Which', 'When'],
    answer: 1, explanation: 'That 引导主语从句，无意义，只起连接作用'
  },
  {
    id: 'g017', type: 'grammar', difficulty: 0.7, knowledgeId: 'clause_noun',
    content: 'I don\'t know ___ he will come.',
    options: ['that', 'what', 'if', 'which'],
    answer: 2, explanation: 'if/whether 引导宾语从句，表示"是否"'
  },
  {
    id: 'g018', type: 'grammar', difficulty: 0.7, knowledgeId: 'clause_noun',
    content: 'The question is ___ we can finish the work on time.',
    options: ['that', 'what', 'if', 'whether'],
    answer: 3, explanation: 'whether 引导表语从句，if 不能用于表语从句'
  },
  // 非谓语
  {
    id: 'g019', type: 'grammar', difficulty: 0.6, knowledgeId: 'nonfinite_infinitive',
    content: 'I want ___ the movie.',
    options: ['see', 'to see', 'seeing', 'seen'],
    answer: 1, explanation: 'want to do sth，不定式作宾语'
  },
  {
    id: 'g020', type: 'grammar', difficulty: 0.7, knowledgeId: 'nonfinite_participle',
    content: '___ from the hill, the town looks beautiful.',
    options: ['See', 'Seeing', 'Seen', 'To see'],
    answer: 1, explanation: '现在分词作状语，表示主动和进行'
  },
  {
    id: 'g021', type: 'grammar', difficulty: 0.7, knowledgeId: 'nonfinite_gerund',
    content: 'I enjoy ___ music.',
    options: ['listen', 'to listen', 'listening', 'listened'],
    answer: 2, explanation: 'enjoy doing sth，动名词作宾语'
  },
  // 状语从句
  {
    id: 'g022', type: 'grammar', difficulty: 0.4, knowledgeId: 'clause_adverbial',
    content: 'I\'ll call you ___ I arrive.',
    options: ['when', 'before', 'after', 'A and B'],
    answer: 3, explanation: 'when/after/before 都可引导时间状语从句，表示时间顺序'
  },
  {
    id: 'g023', type: 'grammar', difficulty: 0.5, knowledgeId: 'clause_adverbial',
    content: '___ it is late, we must go now.',
    options: ['Because', 'Although', 'So', 'Therefore'],
    answer: 1, explanation: 'although 引导让步状语从句，表示"虽然...但是..."'
  },
  {
    id: 'g024', type: 'grammar', difficulty: 0.6, knowledgeId: 'clause_adverbial',
    content: 'He studied hard ___ he could pass the exam.',
    options: ['so that', 'because', 'although', 'if'],
    answer: 0, explanation: 'so that 引导目的状语从句，表示"为了，以便"'
  },
  {
    id: 'g025', type: 'grammar', difficulty: 0.6, knowledgeId: 'clause_adverbial',
    content: '___ it is raining, we will go out.',
    options: ['Because', 'Although', 'Since', 'Unless'],
    answer: 1, explanation: 'although 表示让步，"虽然...但是..."，前后转折关系'
  },
];

// ==================== 阅读理解题 ====================
export const READING_QUESTIONS: Question[] = [
  {
    id: 'r001', type: 'reading', difficulty: 0.3, knowledgeId: 'reading_detail',
    content: 'Tom wakes up at 6 every morning. He brushes his teeth and takes a shower. Then he has breakfast at 6:30. He goes to school at 7. Question: What does Tom do at 6?',
    options: ['Goes to school', 'Has breakfast', 'Takes a shower', 'Wakes up and brushes teeth'],
    answer: 3, explanation: '文章说 Tom 6点醒来刷牙洗澡，所以他醒来和刷牙是在6点'
  },
  {
    id: 'r002', type: 'reading', difficulty: 0.4, knowledgeId: 'reading_main',
    content: 'The Internet has changed our lives. We can shop online, study online, and even work online. Many people say they cannot imagine life without the Internet. Question: What is the main idea of this passage?',
    options: ['Shopping online is popular', 'The Internet is important in our lives', 'Working online is convenient', 'Students study online'],
    answer: 1, explanation: '文章主要讨论互联网如何改变了我们的生活，说明互联网在生活中很重要'
  },
  {
    id: 'r003', type: 'reading', difficulty: 0.5, knowledgeId: 'reading_infer',
    content: 'Sarah never goes out without her umbrella. Today is no exception. The sky is cloudy. Question: What can we infer?',
    options: ['Sarah hates rain', 'It will rain today', 'Sarah always carries an umbrella', 'Sarah lives in a rainy place'],
    answer: 1, explanation: 'Sarah 总是带伞，天空多云，可以推断今天会下雨'
  },
  {
    id: 'r004', type: 'reading', difficulty: 0.4, knowledgeId: 'reading_detail',
    content: 'The library opens at 8 AM and closes at 9 PM. It is open seven days a week. Students can borrow books for two weeks. Question: How many hours is the library open every day?',
    options: ['9 hours', '12 hours', '13 hours', '14 hours'],
    answer: 2, explanation: '从早上8点到晚上9点，共13个小时'
  },
  {
    id: 'r005', type: 'reading', difficulty: 0.5, knowledgeId: 'reading_vocab',
    content: 'The food in this restaurant is awful. The service is terrible too. Question: What does "awful" mean?',
    options: ['delicious', 'very bad', 'expensive', 'ordinary'],
    answer: 1, explanation: '根据上下文，食物 awful 且服务 terrible，可以推断 awful 意为"很差的"'
  },
  {
    id: 'r006', type: 'reading', difficulty: 0.6, knowledgeId: 'reading_infer',
    content: 'John studied until midnight every night last week. He was always tired in class. Yesterday he fell asleep during the exam. Question: Why did John fall asleep?',
    options: ['He doesn\'t like the subject', 'He studied too much', 'The exam was boring', 'He is always sleepy'],
    answer: 1, explanation: 'John 每晚学习到午夜，白天总是很累，可以推断他在考试时睡着了是因为学习过度'
  },
  {
    id: 'r007', type: 'reading', difficulty: 0.6, knowledgeId: 'reading_main',
    content: 'Exercise is good for your health. It can help you sleep better, feel happier, and stay fit. Many doctors recommend at least 30 minutes of exercise every day. Question: What is the passage mainly about?',
    options: ['Different types of exercise', 'Benefits of exercise', 'How to sleep better', 'Doctors\' recommendations'],
    answer: 1, explanation: '文章主要讨论运动的益处：改善睡眠、心情和健康'
  },
  {
    id: 'r008', type: 'reading', difficulty: 0.7, knowledgeId: 'reading_detail',
    content: 'According to a recent study, students who eat breakfast perform better in school. The study followed 1000 students for one year. Those who ate breakfast every day had higher test scores. Question: How long was the study?',
    options: ['One month', 'Six months', 'One year', 'Two years'],
    answer: 2, explanation: '文章明确说 "The study followed 1000 students for one year"'
  },
];

// 获取所有题目
export function getAllQuestions(): Question[] {
  return [...VOCAB_QUESTIONS, ...GRAMMAR_QUESTIONS, ...READING_QUESTIONS];
}

// 按知识点获取题目
export function getQuestionsByKnowledge(knowledgeId: string): Question[] {
  return getAllQuestions().filter(q => q.knowledgeId === knowledgeId);
}

// 按类型获取题目
export function getQuestionsByType(type: 'vocab' | 'grammar' | 'reading' | 'listening'): Question[] {
  return getAllQuestions().filter(q => q.type === type);
}

// 按难度筛选题目
export function getQuestionsByDifficulty(minDiff: number, maxDiff: number): Question[] {
  return getAllQuestions().filter(q => q.difficulty >= minDiff && q.difficulty <= maxDiff);
}

// 获取随机题目
export function getRandomQuestions(count: number, type?: string): Question[] {
  let pool = type ? getQuestionsByType(type as any) : getAllQuestions();
  pool = [...pool].sort(() => Math.random() - 0.5);
  return pool.slice(0, count);
}
