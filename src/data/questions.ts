// 英语知识点及试题数据
export interface Question {
  id: string;
  type: 'vocab' | 'grammar' | 'reading' | 'listening' | 'writing';
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
  // 情态动词
  {
    id: 'g026', type: 'grammar', difficulty: 0.4, knowledgeId: 'grammar_modal',
    content: 'You ___ stop when the traffic light is red.',
    options: ['can', 'may', 'must', 'need'],
    answer: 2, explanation: 'must 表示必须，强调客观上的必要性'
  },
  {
    id: 'g027', type: 'grammar', difficulty: 0.5, knowledgeId: 'grammar_modal',
    content: 'He ___ be at home, because the light is off.',
    options: ['mustn\'t', 'can\'t', 'shouldn\'t', 'needn\'t'],
    answer: 1, explanation: 'can\'t be 表示"不可能"，用于否定推测'
  },
  {
    id: 'g028', type: 'grammar', difficulty: 0.6, knowledgeId: 'grammar_modal',
    content: 'You ___ have told him the truth earlier. Now it\'s too late.',
    options: ['must', 'can', 'should', 'may'],
    answer: 2, explanation: 'should have done 表示"本应该做某事却没做"，带有责备的语气'
  },
  // 虚拟语气
  {
    id: 'g029', type: 'grammar', difficulty: 0.7, knowledgeId: 'grammar_subjunctive',
    content: 'If I ___ you, I would not do that.',
    options: ['am', 'was', 'were', 'be'],
    answer: 2, explanation: '与现在事实相反的虚拟语气，be动词一律用were'
  },
  {
    id: 'g030', type: 'grammar', difficulty: 0.8, knowledgeId: 'grammar_subjunctive',
    content: 'I wish I ___ a bird and could fly in the sky.',
    options: ['am', 'was', 'were', 'have been'],
    answer: 2, explanation: 'wish 后接宾语从句，与现在事实相反用一般过去时，be动词用were'
  },
  {
    id: 'g031', type: 'grammar', difficulty: 0.8, knowledgeId: 'grammar_subjunctive',
    content: 'If he ___ yesterday, he would have met the famous singer.',
    options: ['came', 'comes', 'had come', 'has come'],
    answer: 2, explanation: '与过去事实相反的虚拟语气，从句用 had + 过去分词'
  },
  // 介词
  {
    id: 'g032', type: 'grammar', difficulty: 0.3, knowledgeId: 'grammar_preposition',
    content: 'He was born ___ May 1st, 2000.',
    options: ['in', 'on', 'at', 'from'],
    answer: 1, explanation: '在具体的某一天前用介词 on'
  },
  {
    id: 'g033', type: 'grammar', difficulty: 0.4, knowledgeId: 'grammar_preposition',
    content: 'She is very good ___ playing the piano.',
    options: ['in', 'at', 'with', 'for'],
    answer: 1, explanation: 'be good at 意为"擅长于..."'
  },
  {
    id: 'g034', type: 'grammar', difficulty: 0.5, knowledgeId: 'grammar_preposition',
    content: 'The bridge is made ___ stone.',
    options: ['of', 'from', 'in', 'by'],
    answer: 0, explanation: 'be made of 表示"由...制成"，能看出原材料'
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
  {
    id: 'r009', type: 'reading', difficulty: 0.5, knowledgeId: 'reading_main',
    content: 'Many people think that deserts are completely dead and empty. However, this is not true. Deserts are home to many kinds of plants and animals that have adapted to the harsh environment. For example, cacti can store water in their thick stems. Question: What is the main idea of the passage?',
    options: ['Deserts are dead and empty.', 'Cacti store water in their stems.', 'Deserts have life and adapted species.', 'Animals cannot survive in deserts.'],
    answer: 2, explanation: '文章反驳了沙漠毫无生机的观点，指出沙漠中有很多适应了恶劣环境的动植物。'
  },
  {
    id: 'r010', type: 'reading', difficulty: 0.6, knowledgeId: 'reading_detail',
    content: 'The Great Wall of China is one of the most famous landmarks in the world. It was built over many centuries to protect the Chinese Empire from invasions. The wall is not a single continuous line, but a series of walls and fortifications. Question: Why was the Great Wall built?',
    options: ['To attract tourists.', 'To protect the empire from invasions.', 'To connect different cities.', 'To serve as a trade route.'],
    answer: 1, explanation: '文章明确提到 "It was built over many centuries to protect the Chinese Empire from invasions."'
  },
  {
    id: 'r011', type: 'reading', difficulty: 0.7, knowledgeId: 'reading_infer',
    content: 'When Sarah saw the dark clouds gathering and felt the sudden drop in temperature, she quickly packed up her picnic basket and headed for her car. Question: What can be inferred from Sarah\'s actions?',
    options: ['She didn\'t like the food.', 'She was expecting a storm.', 'She forgot something in her car.', 'She wanted to go home early.'],
    answer: 1, explanation: '看到乌云密布和气温骤降，她赶紧收拾野餐篮走向汽车，可以推断她预料到暴风雨要来了。'
  },
  {
    id: 'r012', type: 'reading', difficulty: 0.8, knowledgeId: 'reading_vocab',
    content: 'The company\'s new policy was met with widespread opposition from the employees. Many workers protested outside the building, demanding a change. Question: What does the word "opposition" most likely mean?',
    options: ['Agreement', 'Support', 'Resistance', 'Understanding'],
    answer: 2, explanation: '根据后文的 "protested" (抗议) 和 "demanding a change" (要求改变)，可以推断 opposition 意为"反对，抵抗" (Resistance)。'
  },
  {
    id: 'r013', type: 'reading', difficulty: 0.5, knowledgeId: 'reading_main',
    content: 'Sleep is essential for a person\'s health and wellbeing. According to the National Sleep Foundation, adults need between 7 and 9 hours of sleep per night. Lack of sleep can lead to a variety of health problems, including obesity, diabetes, and heart disease. Question: What is the main purpose of this passage?',
    options: ['To explain how to sleep better.', 'To warn about the dangers of obesity.', 'To emphasize the importance of sleep.', 'To describe the National Sleep Foundation.'],
    answer: 2, explanation: '文章主要强调睡眠对健康的重要性，并指出了缺乏睡眠的危害。'
  },
  {
    id: 'r014', type: 'reading', difficulty: 0.6, knowledgeId: 'reading_detail',
    content: 'The Amazon rainforest is the largest rainforest in the world. It covers an area of 5.5 million square kilometers and spans across nine countries in South America. Brazil contains 60% of the rainforest, followed by Peru with 13%. Question: Which country contains the largest portion of the Amazon rainforest?',
    options: ['Peru', 'Colombia', 'Brazil', 'Argentina'],
    answer: 2, explanation: '文章明确指出 "Brazil contains 60% of the rainforest"。'
  },
  {
    id: 'r015', type: 'reading', difficulty: 0.7, knowledgeId: 'reading_infer',
    content: 'As the teacher handed back the graded exams, Mark\'s hands began to shake. He stared at the red "D" circled at the top of the page and sighed heavily. He knew his parents would not be pleased. Question: How is Mark feeling?',
    options: ['Excited', 'Relieved', 'Anxious and disappointed', 'Angry'],
    answer: 2, explanation: 'Mark 手发抖，叹气，且知道父母会不高兴，说明他因为成绩差而感到焦虑和失望。'
  },
  {
    id: 'r016', type: 'reading', difficulty: 0.8, knowledgeId: 'reading_vocab',
    content: 'The new smartphone features a sleek design and an innovative camera system that allows users to take professional-quality photos in low light. Question: What does the word "innovative" mean in this context?',
    options: ['Old-fashioned', 'Expensive', 'New and original', 'Complicated'],
    answer: 2, explanation: 'innovative 意为"创新的，新颖的"，指引入了新思想或新方法。'
  },
  {
    id: 'r017', type: 'reading', difficulty: 0.6, knowledgeId: 'reading_main',
    content: 'Recycling is a simple way to help protect the environment. By recycling paper, plastic, and glass, we can reduce the amount of waste that ends up in landfills. It also conserves natural resources and saves energy. Question: What is the best title for this passage?',
    options: ['How to Recycle Paper', 'The Benefits of Recycling', 'The Problem with Landfills', 'Saving Energy at Home'],
    answer: 1, explanation: '文章主要讨论了回收的好处，包括减少垃圾、节约资源和能源。'
  },
];

// ==================== 听力理解题 ====================
export const LISTENING_QUESTIONS: Question[] = [
  {
    id: 'l001', type: 'listening', difficulty: 0.3, knowledgeId: 'listen_detail',
    content: 'What time is the meeting tomorrow? (Audio: The meeting is scheduled for 10 AM tomorrow in the main conference room.)',
    options: ['9 AM', '10 AM', '11 AM', '2 PM'],
    answer: 1, explanation: '录音中明确提到会议时间是明天上午10点 (10 AM)。'
  },
  {
    id: 'l002', type: 'listening', difficulty: 0.4, knowledgeId: 'listen_main',
    content: 'What is the speaker mainly talking about? (Audio: Today we will discuss the new marketing strategy for the upcoming product launch. We need to focus on social media and influencer partnerships.)',
    options: ['A new product design', 'A marketing strategy', 'Social media platforms', 'Hiring new staff'],
    answer: 1, explanation: '录音的主旨是讨论新产品的营销策略 (marketing strategy)。'
  },
  {
    id: 'l003', type: 'listening', difficulty: 0.5, knowledgeId: 'listen_infer',
    content: 'How does the woman feel? (Audio: Man: Did you see your test score? Woman: Yes, I can\'t believe it! I studied so hard, but I still failed.)',
    options: ['Excited', 'Angry', 'Disappointed', 'Happy'],
    answer: 2, explanation: '女士说她学习很努力但还是没及格，可以推断她感到失望 (Disappointed)。'
  },
  {
    id: 'l004', type: 'listening', difficulty: 0.4, knowledgeId: 'listen_detail',
    content: 'Where is the man going? (Audio: Excuse me, could you tell me how to get to the nearest post office? I need to send this package.)',
    options: ['To the bank', 'To the supermarket', 'To the post office', 'To the police station'],
    answer: 2, explanation: '男士询问去邮局 (post office) 的路。'
  },
  {
    id: 'l005', type: 'listening', difficulty: 0.6, knowledgeId: 'listen_infer',
    content: 'What is the probable relationship between the speakers? (Audio: Man: Your table is ready, ma\'am. Right this way. Woman: Thank you. Could we get the menu, please?)',
    options: ['Husband and wife', 'Teacher and student', 'Waiter and customer', 'Doctor and patient'],
    answer: 2, explanation: '男士说"您的桌子准备好了"，女士要菜单，可以推断是服务员和顾客的关系。'
  },
  {
    id: 'l006', type: 'listening', difficulty: 0.4, knowledgeId: 'listen_detail',
    content: 'How much is the ticket? (Audio: The regular ticket is $20, but with your student ID, you get a 50% discount.)',
    options: ['$10', '$20', '$30', '$40'],
    answer: 0, explanation: '原价20美元，学生证打五折，所以是10美元。'
  },
  {
    id: 'l007', type: 'listening', difficulty: 0.5, knowledgeId: 'listen_main',
    content: 'What is the announcement about? (Audio: Attention all passengers on flight 402 to New York. Your flight has been delayed due to severe weather conditions. Please remain in the waiting area.)',
    options: ['A lost item', 'A flight delay', 'A gate change', 'A boarding call'],
    answer: 1, explanation: '广播提到 "Your flight has been delayed" (您的航班已延误)。'
  },
  {
    id: 'l008', type: 'listening', difficulty: 0.7, knowledgeId: 'listen_infer',
    content: 'What does the man imply? (Audio: Woman: Are you going to the concert tonight? Man: I have a huge history paper due tomorrow morning.)',
    options: ['He is going to the concert.', 'He likes history.', 'He cannot go to the concert.', 'He already finished his paper.'],
    answer: 2, explanation: '男士说明天早上有一篇很长的历史论文要交，暗示他今晚没时间去听音乐会。'
  },
  {
    id: 'l009', type: 'listening', difficulty: 0.8, knowledgeId: 'listen_detail',
    content: 'What did the woman forget? (Audio: Man: Do you have the tickets? Woman: Oh no! I left them on the kitchen counter when I was grabbing my keys.)',
    options: ['Her keys', 'Her phone', 'Her wallet', 'The tickets'],
    answer: 3, explanation: '女士说 "I left them (the tickets) on the kitchen counter" (我把它们落在厨房台面上了)。'
  },
  {
    id: 'l010', type: 'listening', difficulty: 0.5, knowledgeId: 'listen_detail',
    content: 'What time does the train leave? (Audio: The next train to Chicago will depart from platform 3 at 2:45 PM.)',
    options: ['2:15 PM', '2:30 PM', '2:45 PM', '3:00 PM'],
    answer: 2, explanation: '录音中明确提到火车将在 2:45 PM 发车。'
  },
  {
    id: 'l011', type: 'listening', difficulty: 0.6, knowledgeId: 'listen_main',
    content: 'What are the speakers discussing? (Audio: Man: Have you decided where to go for your vacation? Woman: I\'m torn between a beach resort in Hawaii and a cultural tour in Europe.)',
    options: ['Work schedules', 'Vacation plans', 'A business trip', 'Moving to a new city'],
    answer: 1, explanation: '两人在讨论去哪里度假 (vacation plans)。'
  },
  {
    id: 'l012', type: 'listening', difficulty: 0.7, knowledgeId: 'listen_infer',
    content: 'What does the woman mean? (Audio: Man: Can you help me move this sofa? Woman: I\'d love to, but my back has been killing me lately.)',
    options: ['She will help him move the sofa.', 'She wants to buy a new sofa.', 'She cannot help him because her back hurts.', 'She is going to the doctor.'],
    answer: 2, explanation: '女士说 "my back has been killing me lately" (我最近背痛得厉害)，委婉拒绝了帮忙。'
  },
  {
    id: 'l013', type: 'listening', difficulty: 0.4, knowledgeId: 'listen_detail',
    content: 'What did the man order? (Audio: Waitress: Are you ready to order? Man: Yes, I\'ll have the grilled chicken salad and a glass of iced tea, please.)',
    options: ['A hamburger and fries', 'Grilled chicken salad and iced tea', 'Steak and a beer', 'Pasta and water'],
    answer: 1, explanation: '男士点的是烤鸡肉沙拉和冰茶 (grilled chicken salad and a glass of iced tea)。'
  },
  {
    id: 'l014', type: 'listening', difficulty: 0.8, knowledgeId: 'listen_infer',
    content: 'What can be inferred about the man? (Audio: Woman: You look exhausted. Did you stay up late again? Man: Yeah, I was up until 3 AM trying to fix a bug in my code.)',
    options: ['He is a doctor.', 'He is a student.', 'He is a software developer.', 'He is a mechanic.'],
    answer: 2, explanation: '男士熬夜到凌晨3点为了修复代码中的bug (fix a bug in my code)，可以推断他是一名软件开发者。'
  }
];

// ==================== 写作题 ====================
export const WRITING_QUESTIONS: Question[] = [
  {
    id: 'w001', type: 'writing', difficulty: 0.3, knowledgeId: 'write_sentence',
    content: '请将以下句子翻译成英文：我昨天买了一本新书。',
    options: ['I buy a new book yesterday.', 'I bought a new book yesterday.', 'I have bought a new book yesterday.', 'I am buying a new book yesterday.'],
    answer: 1, explanation: '昨天发生的事情用一般过去时，buy 的过去式是 bought。'
  },
  {
    id: 'w002', type: 'writing', difficulty: 0.4, knowledgeId: 'write_sentence',
    content: '找出句子中的语法错误：She don\'t like playing tennis.',
    options: ['She', 'don\'t', 'like', 'playing'],
    answer: 1, explanation: '主语 She 是第三人称单数，否定助动词应该用 doesn\'t。'
  },
  {
    id: 'w003', type: 'writing', difficulty: 0.5, knowledgeId: 'write_paragraph',
    content: '选择最合适的连词填空：It was raining heavily, ___ we decided to stay at home.',
    options: ['because', 'but', 'so', 'although'],
    answer: 2, explanation: '前后是因果关系，"雨下得很大，所以我们决定待在家里"，用 so。'
  },
  {
    id: 'w004', type: 'writing', difficulty: 0.6, knowledgeId: 'write_paragraph',
    content: '以下哪个句子最适合作为段落的主题句 (Topic Sentence)？段落内容：首先，多吃蔬菜水果。其次，每天坚持运动。最后，保持充足的睡眠。',
    options: ['Vegetables are good for you.', 'How to stay healthy.', 'There are three ways to keep healthy.', 'Sleep is very important.'],
    answer: 2, explanation: '段落列举了保持健康的三种方法，所以主题句应该是"有三种保持健康的方法"。'
  },
  {
    id: 'w005', type: 'writing', difficulty: 0.7, knowledgeId: 'write_essay',
    content: '在写一封正式的求职信时，以下哪个结尾最合适？',
    options: ['Love,', 'Yours sincerely,', 'See you soon,', 'Cheers,'],
    answer: 1, explanation: '正式信件通常用 Yours sincerely 或 Yours faithfully 结尾。'
  },
  {
    id: 'w006', type: 'writing', difficulty: 0.4, knowledgeId: 'write_sentence',
    content: '请将以下句子翻译成英文：如果明天下雨，我们就不去野餐了。',
    options: ['If it rain tomorrow, we will not go for a picnic.', 'If it rains tomorrow, we will not go for a picnic.', 'If it will rain tomorrow, we do not go for a picnic.', 'If it rains tomorrow, we do not go for a picnic.'],
    answer: 1, explanation: '条件状语从句主将从现，从句用一般现在时 rains，主句用一般将来时 will not go。'
  },
  {
    id: 'w007', type: 'writing', difficulty: 0.5, knowledgeId: 'write_sentence',
    content: '找出句子中的语法错误：There is a lot of peoples in the park.',
    options: ['There', 'is', 'a lot of', 'peoples'],
    answer: 3, explanation: 'people 本身就是复数名词，不需要加 s。同时谓语动词应该用 are。'
  },
  {
    id: 'w008', type: 'writing', difficulty: 0.6, knowledgeId: 'write_paragraph',
    content: '选择最合适的过渡词填空：He is very smart. ___, he is also very hardworking.',
    options: ['However', 'Therefore', 'Moreover', 'Otherwise'],
    answer: 2, explanation: '前后两句是递进关系，"他很聪明，而且他也很努力"，用 Moreover (此外，而且)。'
  },
  {
    id: 'w009', type: 'writing', difficulty: 0.8, knowledgeId: 'write_essay',
    content: '在议论文中，以下哪句话最适合用来引出反方观点？',
    options: ['I strongly believe that...', 'In conclusion...', 'On the other hand, some people argue that...', 'First of all...'],
    answer: 2, explanation: '"On the other hand, some people argue that..." (另一方面，一些人认为...) 常用于引出对立或反方的观点。'
  },
  {
    id: 'w010', type: 'writing', difficulty: 0.4, knowledgeId: 'write_sentence',
    content: '请将以下句子翻译成英文：他不仅会说英语，还会说法语。',
    options: ['He speaks not only English but also French.', 'He speaks English and French.', 'He not only speaks English, he speaks French.', 'He speaks English, also French.'],
    answer: 0, explanation: 'not only... but also... 意为"不仅...而且..."，连接两个并列的成分。'
  },
  {
    id: 'w011', type: 'writing', difficulty: 0.5, knowledgeId: 'write_sentence',
    content: '找出句子中的语法错误：I am looking forward to see you soon.',
    options: ['am', 'looking', 'to', 'see'],
    answer: 3, explanation: 'look forward to 中的 to 是介词，后面应该接动名词 seeing。'
  },
  {
    id: 'w012', type: 'writing', difficulty: 0.6, knowledgeId: 'write_paragraph',
    content: '选择最合适的连词填空：___ he was very tired, he continued to work.',
    options: ['Because', 'Although', 'If', 'Since'],
    answer: 1, explanation: '前后是让步关系，"虽然他很累，但他继续工作"，用 Although。'
  },
  {
    id: 'w013', type: 'writing', difficulty: 0.7, knowledgeId: 'write_essay',
    content: '在写一篇关于"保护环境"的英语作文时，以下哪个句子最适合作为结论句？',
    options: ['There are many environmental problems today.', 'In short, protecting the environment is everyone\'s responsibility.', 'First, we should plant more trees.', 'Some people think pollution is not a big deal.'],
    answer: 1, explanation: '"In short" (简而言之) 常用于总结全文，"保护环境是每个人的责任" 适合作为结论。'
  },
  {
    id: 'w014', type: 'writing', difficulty: 0.8, knowledgeId: 'write_paragraph',
    content: '以下哪个句子存在"中式英语 (Chinglish)"的问题？',
    options: ['I will try my best.', 'Open the light, please.', 'Please turn on the light.', 'I completely agree with you.'],
    answer: 1, explanation: '"开灯"在英语中应该是 turn on the light，而不是 open the light。'
  }
];

// 获取所有题目
export function getAllQuestions(): Question[] {
  return [...VOCAB_QUESTIONS, ...GRAMMAR_QUESTIONS, ...READING_QUESTIONS, ...LISTENING_QUESTIONS, ...WRITING_QUESTIONS];
}

// 按知识点获取题目
export function getQuestionsByKnowledge(knowledgeId: string): Question[] {
  return getAllQuestions().filter(q => q.knowledgeId === knowledgeId);
}

// 按类型获取题目
export function getQuestionsByType(type: 'vocab' | 'grammar' | 'reading' | 'listening' | 'writing'): Question[] {
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

