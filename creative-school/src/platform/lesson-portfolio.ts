import type { LessonMaterial } from "./lesson-types";
import { M, T, Q, sources as S } from "./lesson-builder";
export const portfolioLessons: Record<string, LessonMaterial> = {
  "pf-1": M({
    goal: T(
      "Отбирать работы под конкретную роль и честно показывать вклад.",
      "Select work for a target role and state your contribution honestly.",
      "Нақты рөлге сай жұмыс таңдап, үлесіңізді шынайы көрсету.",
    ),
    principle: T(
      "Портфолио — аргумент для аудитории, а не архив всего сделанного. Заказчик ищет доказательство нужных навыков. Несколько сильных релевантных работ полезнее большого набора слабых. В командном проекте отделяйте свой вклад от общего результата. Учебный проект допустим, если честно назван учебным.",
      "A portfolio argues for an audience; it is not an archive. Clients look for evidence of required skills. A few strong relevant projects are more useful than many weak ones. Separate your contribution from team output. Student work is valid when honestly labeled.",
      "Портфолио — барлық жұмыс мұрағаты емес, аудиторияға дәлел. Клиент қажетті дағдының айғағын іздейді. Бірнеше мықты сәйкес жоба көп әлсіз жұмыстан пайдалы. Жеке үлесті топ нәтижесінен бөліңіз. Оқу жобасын солай шынайы белгілесе қолдануға болады.",
    ),
    method: T(
      "Опишите целевую роль и три требуемых навыка. Для каждого проекта запишите, какой навык он доказывает и есть ли право его показывать. Уберите слабые дубликаты. Поставьте самое сильное релевантное доказательство первым; разнообразие ради разнообразия не заменяет ясной специализации.",
      "Define the role and three required skills. For each project record what it proves and your right to show it. Remove weak duplicates. Lead with the strongest relevant evidence; variety for its own sake does not replace a clear specialty.",
      "Мақсатты рөл мен үш дағдыны анықтаңыз. Әр жобаның нені дәлелдейтінін және көрсету құқығын жазыңыз. Әлсіз қайталауды алып тастаңыз. Ең мықты сәйкес дәлелді бірінші қойыңыз; жай әртүрлілік нақты мамандануды алмастырмайды.",
    ),
    example: T(
      "Визуальный дизайнер выбирает из восьми проектов.",
      "A visual designer selects from eight projects.",
      "Визуалды дизайнер сегіз жобадан таңдайды.",
    ),
    steps: [
      T(
        "Выберите примеры типографики, системы макетов и процесса.",
        "Select examples of typography, layout systems and process.",
        "Типографика, макет жүйесі мен процесс мысалын таңдаңыз.",
      ),
      T(
        "В командной работе подпишите свою ответственность.",
        "Label your responsibility in team work.",
        "Топ жұмысындағы жауапкершілігіңізді көрсетіңіз.",
      ),
      T(
        "Уберите слабый повтор уже доказанного навыка.",
        "Remove a weaker repetition of a demonstrated skill.",
        "Дәлелденген дағдының әлсіз қайталануын алып тастаңыз.",
      ),
    ],
    result: T(
      "Подборка короче, специализация и вклад понятнее.",
      "The collection is shorter and your specialty clearer.",
      "Жинақ қысқарып, мамандану мен үлес анықталады.",
    ),
    practice: T(
      "Отберите три работы для одной аудитории.",
      "Select three projects for one audience.",
      "Бір аудиторияға үш жұмыс таңдаңыз.",
    ),
    actions: [
      T(
        "Опишите роль и необходимые навыки.",
        "Describe the role and required skills.",
        "Рөл мен қажет дағдыны сипаттаңыз.",
      ),
      T(
        "Составьте таблицу: работа, доказательство, вклад, права.",
        "Make a table: project, evidence, contribution, rights.",
        "Жоба, дәлел, үлес, құқық кестесін жасаңыз.",
      ),
      T(
        "Объясните порядок отбора одним абзацем.",
        "Explain the order in one paragraph.",
        "Іріктеу ретін бір абзацпен түсіндіріңіз.",
      ),
    ],
    deliverable: T(
      "Таблица отбора и три описания работ.",
      "Selection table and three project descriptions.",
      "Іріктеу кестесі және үш жоба сипаттамасы.",
    ),
    checks: [
      T(
        "Каждая работа доказывает нужный навык.",
        "Each project proves a relevant skill.",
        "Әр жоба тиісті дағдыны дәлелдейді.",
      ),
      T(
        "Контекст и вклад не приукрашены.",
        "Context and contribution are not embellished.",
        "Мәнмәтін мен үлес әсіреленбеген.",
      ),
    ],
    questions: [
      Q(
        T(
          "Что важнее числа работ?",
          "What matters more than project count?",
          "Жоба санынан не маңызды?",
        ),
        [
          T(
            "Релевантность и качество доказательств",
            "Relevance and evidence quality",
            "Сәйкестік пен дәлел сапасы",
          ),
          T(
            "Одинаковые имена файлов",
            "Identical filenames",
            "Бірдей файл атауы",
          ),
          T("Скрытие роли", "Hiding your role", "Рөлді жасыру"),
        ],
        0,
        T(
          "Аудитория оценивает конкретные навыки, не размер архива.",
          "The audience assesses skills, not archive size.",
          "Аудитория мұрағат көлемін емес, дағдыны бағалайды.",
        ),
      ),
      Q(
        T(
          "Как представить командный проект?",
          "How should team work be presented?",
          "Топ жобасын қалай көрсету керек?",
        ),
        [
          T("Приписать всё себе", "Claim everything", "Бәрін өзіңізге телу"),
          T(
            "Указать команду и свой вклад",
            "State team and contribution",
            "Топ пен үлесіңізді көрсету",
          ),
          T(
            "Убрать весь контекст",
            "Remove all context",
            "Барлық мәнмәтінді жою",
          ),
        ],
        1,
        T(
          "Атрибуция делает доказательство достоверным.",
          "Attribution makes evidence credible.",
          "Авторлықты көрсету дәлелді сенімді етеді.",
        ),
      ),
      Q(
        T(
          "Можно ли показать учебную работу?",
          "Can student work be shown?",
          "Оқу жұмысын көрсетуге бола ма?",
        ),
        [
          T("Никогда", "Never", "Ешқашан"),
          T(
            "Только выдав её за заказ",
            "Only by calling it a commission",
            "Тек тапсырыс деп көрсетіп",
          ),
          T(
            "Да, обозначив учебный контекст",
            "Yes, with educational context",
            "Иә, оқу мәнмәтінін көрсетіп",
          ),
        ],
        2,
        T(
          "Честный контекст полезнее вымышленного клиента.",
          "Honest context is better than an invented client.",
          "Шынайы мәнмәтін ойдан шығарылған клиенттен жақсы.",
        ),
      ),
    ],
    sources: [S.portfolio, S.licenses],
    minutes: 45,
  }),
  "pf-2": M({
    goal: T(
      "Превратить картинки в аргументированный кейс.",
      "Turn images into a reasoned case study.",
      "Суреттерді негізделген кейске айналдыру.",
    ),
    principle: T(
      "Кейс связывает задачу, ограничения, решения и наблюдаемый результат. Процесс нужен не ради числа эскизов, а чтобы объяснить выбор. Не придумывайте рост продаж: отделяйте измеренное, наблюдённое и ожидаемое. Если результата пока нет, опишите способ будущей проверки.",
      "A case connects problem, constraints, decisions and observed outcome. Process explains choices rather than counting sketches. Do not invent sales growth: distinguish measured, observed and expected outcomes. If results are unavailable, explain the planned validation.",
      "Кейс міндет, шектеу, шешім және байқалған нәтижені байланыстырады. Процесс эскиз саны үшін емес, таңдауды түсіндіру үшін керек. Сату өсімін ойдан қоспай, өлшенген, байқалған және күтілетінді бөліңіз. Нәтиже жоқ болса, тексеру жоспарын жазыңыз.",
    ),
    method: T(
      "Используйте пять блоков: контекст, роль, ключевые решения, финал и вывод. Для решения покажите альтернативу и критерий выбора. Подпишите иллюстрации, чтобы кейс был понятен без устного рассказа. Краткий итог в начале помогает читателю решить, какие детали изучить.",
      "Use context, role, decisions, final outcome and reflection. Show an alternative and decision criterion. Caption illustrations so the story stands without narration. An opening summary helps readers choose which details to inspect.",
      "Мәнмәтін, рөл, шешім, нәтиже және қорытынды блоктарын қолданыңыз. Балама мен таңдау өлшемін көрсетіңіз. Ауызша түсіндірусіз түсінікті болу үшін суретке жазу қосыңыз. Бастапқы қысқа түйін қандай детальды оқуды таңдауға көмектеседі.",
    ),
    example: T(
      "Афиша не читалась на телефоне; изменены сетка и иерархия.",
      "A poster was unreadable on mobile; grid and hierarchy changed.",
      "Афиша телефонда оқылмады; тор мен иерархия өзгерді.",
    ),
    steps: [
      T(
        "Покажите исходную проблему и свою роль.",
        "Show the initial problem and your role.",
        "Бастапқы мәселе мен рөліңізді көрсетіңіз.",
      ),
      T(
        "Сравните версии по поиску даты, а не вкусу.",
        "Compare date findability rather than taste.",
        "Нұсқаларды талғаммен емес, күнді табумен салыстырыңыз.",
      ),
      T(
        "Укажите наблюдение и размер маленького теста.",
        "State the observation and small test size.",
        "Байқау мен шағын сынақ көлемін көрсетіңіз.",
      ),
    ],
    result: T(
      "Причина выбора ясна; маленький тест не выдан за успех на всём рынке.",
      "Reasoning is clear without presenting a small test as market-wide proof.",
      "Таңдау себебі анық, шағын сынақ бүкіл нарық дәлелі болып көрсетілмеген.",
    ),
    practice: T(
      "Напишите кейс 400–600 слов с четырьмя иллюстрациями.",
      "Write a 400–600 word case with four illustrations.",
      "Төрт иллюстрациясы бар 400–600 сөздік кейс жазыңыз.",
    ),
    actions: [
      T(
        "Сформулируйте проблему и критерий успеха.",
        "State the problem and success criterion.",
        "Мәселе мен табыс өлшемін жазыңыз.",
      ),
      T(
        "Покажите два решения с альтернативами.",
        "Show two decisions and alternatives.",
        "Екі шешім мен баламасын көрсетіңіз.",
      ),
      T(
        "Отделите факт результата от дальнейшего плана.",
        "Separate outcome evidence from future plans.",
        "Нәтиже дерегін болашақ жоспардан бөліңіз.",
      ),
    ],
    deliverable: T(
      "Кейс с подписями и блоком ограничений.",
      "Captioned case with explicit limitations.",
      "Жазуы мен шектеу бөлімі бар кейс.",
    ),
    checks: [
      T(
        "Решения связаны с задачей.",
        "Decisions relate to the goal.",
        "Шешім міндетке байланысты.",
      ),
      T(
        "Нет вымышленных метрик.",
        "No fabricated metrics.",
        "Ойдан шығарылған метрика жоқ.",
      ),
    ],
    questions: [
      Q(
        T(
          "Зачем показывать альтернативу?",
          "Why show an alternative?",
          "Баламаны неге көрсетеді?",
        ),
        [
          T("Удлинить кейс", "Make it longer", "Кейсті ұзарту"),
          T(
            "Объяснить критерий выбора",
            "Explain the decision criterion",
            "Таңдау өлшемін түсіндіру",
          ),
          T("Скрыть финал", "Hide the final", "Нәтижені жасыру"),
        ],
        1,
        T(
          "Альтернатива раскрывает логику решения.",
          "An alternative reveals decision logic.",
          "Балама шешім қисынын ашады.",
        ),
      ),
      Q(
        T(
          "Продажи не измерялись. Что писать?",
          "Sales were not measured. What should be written?",
          "Сату өлшенбеді. Не жазу керек?",
        ),
        [
          T(
            "Случайный процент роста",
            "A random growth percentage",
            "Кездейсоқ өсу пайызы",
          ),
          T("Гарантию успеха", "A success guarantee", "Табыс кепілі"),
          T(
            "Наблюдения и то, что остаётся неизвестным",
            "Observations and what remains unknown",
            "Байқау және белгісіз қалғаны",
          ),
        ],
        2,
        T(
          "Честная граница доказательства укрепляет доверие.",
          "Honest evidence boundaries strengthen trust.",
          "Дәлел шегін шынайы көрсету сенімді арттырады.",
        ),
      ),
      Q(
        T(
          "Что помогает читать кейс без автора?",
          "What helps a case stand without its author?",
          "Кейсті авторсыз не түсінікті етеді?",
        ),
        [
          T(
            "Контекст и смысловые подписи",
            "Context and meaningful captions",
            "Мәнмәтін мен мағыналы жазулар",
          ),
          T("Только мокапы", "Only mockups", "Тек мокаптар"),
          T("Мелкий текст", "Tiny text", "Ұсақ мәтін"),
        ],
        0,
        T(
          "Подписи связывают изображение с решаемой проблемой.",
          "Captions connect images with the problem.",
          "Жазу суретті мәселемен байланыстырады.",
        ),
      ),
    ],
    sources: [S.portfolio],
    minutes: 65,
  }),
  "pf-3": M({
    goal: T(
      "Собирать полезную обратную связь и планировать правки.",
      "Collect useful feedback and plan revisions.",
      "Пайдалы кері байланыс жинап, түзетуді жоспарлау.",
    ),
    principle: T(
      "«Нравится» описывает вкус, но редко объясняет исправление. Просите найти проект, понять роль или открыть исходник. Записывайте действия и точные слова; отдельно — интерпретацию и возможную правку. Это защищает от подмены пользовательской проблемы личным мнением дизайнера.",
      "“Like” describes preference but rarely guides correction. Ask someone to find a project, identify your role or open a source. Record actions and exact words separately from interpretation and possible fixes. This prevents replacing a user problem with designer preference.",
      "«Ұнайды» талғамды білдіреді, бірақ түзетуді сирек түсіндіреді. Жоба табуды, рөлді түсінуді не түпнұсқаны ашуды сұраңыз. Әрекет пен нақты сөзді түсіндіру және түзетуден бөлек жазыңыз. Бұл пайдаланушы мәселесін дизайнер пікірімен алмастырмайды.",
    ),
    method: T(
      "Перед показом дайте короткий контекст и критерий. Не защищайте решение во время первого просмотра. Группируйте замечания: понятность, навигация, содержание, технический сбой. Приоритетны препятствия основной задаче. Неясное «сделать современнее» уточняйте вопросом о влиянии на цель.",
      "Give brief context and criteria before review; do not defend decisions during first viewing. Group feedback into clarity, navigation, content and technical failure. Prioritize barriers to the main goal. Clarify vague “make it modern” advice by asking about its impact on that goal.",
      "Қарауға дейін қысқа мәнмәтін мен өлшем беріңіз; алғашқы қарауда шешімді қорғамаңыз. Пікірді түсініктілік, навигация, мазмұн және ақауға бөліңіз. Негізгі мақсатқа кедергі басым. «Заманауи ет» кеңесінің мақсатқа әсерін нақтылаңыз.",
    ),
    example: T(
      "Зритель считает командную работу полностью вашей.",
      "A viewer assumes a team project was entirely yours.",
      "Көрермен топ жобасын толық сіздікі деп ойлайды.",
    ),
    steps: [
      T(
        "Запишите фразу, не споря.",
        "Record the statement without arguing.",
        "Дауласпай сөзін жазыңыз.",
      ),
      T(
        "Определите проблему: подпись роли незаметна.",
        "Identify the issue: the role label is not discoverable.",
        "Мәселені анықтаңыз: рөл жазуы байқалмайды.",
      ),
      T(
        "Перенесите роль в начало и проверьте снова.",
        "Move the role to the opening and retest.",
        "Рөлді басына көшіріп, қайта тексеріңіз.",
      ),
    ],
    result: T(
      "Правка связана с наблюдаемым непониманием, а не попыткой угодить каждому вкусу.",
      "The revision addresses observed misunderstanding rather than every preference.",
      "Түзету әр талғамға ұнауға емес, байқалған түсінбеуге бағытталған.",
    ),
    practice: T(
      "Покажите кейс двум людям и выберите три правки.",
      "Show a case to two people and select three revisions.",
      "Кейсті екі адамға көрсетіп, үш түзету таңдаңыз.",
    ),
    actions: [
      T(
        "Задайте одинаковый вопрос о вашей роли.",
        "Ask the same question about your role.",
        "Рөліңіз туралы бірдей сұрақ қойыңыз.",
      ),
      T(
        "Разделите факт, объяснение и решение.",
        "Separate fact, interpretation and solution.",
        "Факт, түсіндіру мен шешімді бөліңіз.",
      ),
      T(
        "После правки проверьте исходную проблему.",
        "Retest the original issue after revision.",
        "Түзетуден кейін бастапқы мәселені тексеріңіз.",
      ),
    ],
    deliverable: T(
      "Два наблюдения и приоритизированный план правок.",
      "Two observation records and a prioritized revision plan.",
      "Екі бақылау жазбасы және басымдықты түзету жоспары.",
    ),
    checks: [
      T(
        "Наблюдение отделено от предположения.",
        "Observation is separate from assumption.",
        "Байқау болжамнан бөлінген.",
      ),
      T(
        "У правки есть конкретная проблема.",
        "Each revision addresses a specific problem.",
        "Әр түзетудің нақты мәселесі бар.",
      ),
    ],
    questions: [
      Q(
        T(
          "Какой вопрос полезнее?",
          "Which question is more useful?",
          "Қай сұрақ пайдалырақ?",
        ),
        [
          T(
            "Вам нравится любимый мной цвет?",
            "Do you like my favorite color?",
            "Сүйікті түсім ұнай ма?",
          ),
          T("Это ведь красиво?", "It is beautiful, right?", "Бұл әдемі ғой?"),
          T(
            "Какую роль я выполнял в проекте?",
            "What was my role in the project?",
            "Жобадағы рөлім қандай болды?",
          ),
        ],
        2,
        T(
          "Так проверяется понимание, а не желание похвалить.",
          "This tests understanding rather than praise.",
          "Бұл мақтауды емес, түсінуді тексереді.",
        ),
      ),
      Q(
        T(
          "Что делать с «сделать современнее»?",
          "How should “make it modern” be handled?",
          "«Заманауи ет» дегенмен не істеу керек?",
        ),
        [
          T(
            "Уточнить мешающую задаче проблему",
            "Clarify the problem obstructing the goal",
            "Мақсатқа кедергі мәселені нақтылау",
          ),
          T("Сменить все цвета", "Change every color", "Барлық түсті ауыстыру"),
          T("Удалить кейс", "Delete the case", "Кейсті жою"),
        ],
        0,
        T(
          "Совет нужно связать с критерием задачи.",
          "Tie advice to a goal criterion.",
          "Кеңесті міндет өлшемімен байланыстыру керек.",
        ),
      ),
      Q(
        T(
          "Как проверить пользу правки?",
          "How can revision value be checked?",
          "Түзету пайдасын қалай тексереді?",
        ),
        [
          T("Посчитать эффекты", "Count effects", "Әсерді санау"),
          T(
            "Повторить проверку проблемы",
            "Retest the problem",
            "Мәселені қайта тексеру",
          ),
          T(
            "Посчитать потраченное время",
            "Count time spent",
            "Жұмсалған уақытты санау",
          ),
        ],
        1,
        T(
          "Затраченное время не доказывает улучшение результата.",
          "Time spent does not prove a better outcome.",
          "Жұмсалған уақыт нәтиже жақсарғанын дәлелдемейді.",
        ),
      ),
    ],
    sources: [S.testing, S.portfolio, S.critique],
    minutes: 55,
  }),
  "pf-4": M({
    goal: T(
      "Проверить доступ, права и данные перед публикацией.",
      "Check access, rights and data before publication.",
      "Жариялау алдында қолжетімділік, құқық пен деректі тексеру.",
    ),
    principle: T(
      "Публикация включает содержание, доступ и права. В Creative School опубликованный исходник доступен по публичной ссылке. Удалите личные данные, закрытые заметки и материалы без разрешения. То, что видно владельцу, может быть закрыто посетителю без аккаунта; проверяйте обе ситуации.",
      "Publishing includes content, access and rights. Creative School exposes the published editable source by public link. Remove personal data, private notes and unlicensed assets. What an owner sees may be unavailable to a signed-out visitor; test both contexts.",
      "Жариялау мазмұн, қолжетімділік пен құқықты қамтиды. Creative School жарияланған өңделетін түпнұсқаны ашық сілтемемен береді. Жеке дерек, құпия жазба және рұқсатсыз материалды алыңыз. Иесіне көрінген нәрсе кірусіз келушіге жабық болуы мүмкін; екеуін де тексеріңіз.",
    ),
    method: T(
      "Составьте список материалов и условий. В CC-лицензиях BY требует указания автора, NC ограничивает коммерческое использование, ND ограничивает распространение адаптаций согласно условиям лицензии. Покупка файла не обязательно разрешает раздавать исходник. Откройте ссылку без входа, проверьте телефон, скачивание и снятие с публикации.",
      "List assets and terms. In CC licenses BY requires credit, NC restricts commercial use and ND restricts sharing adaptations under its terms. Buying a file does not necessarily permit source redistribution. Test signed-out access, mobile, downloads and unpublishing.",
      "Материал мен шартты тізіңіз. CC лицензиясында BY авторды көрсетуді талап етеді, NC коммерциялық қолдануды, ND шарт бойынша бейімделген жұмысты таратуды шектейді. Файл сатып алу түпнұсқаны тарату құқығы болмауы мүмкін. Кірусіз ашылу, телефон, жүктеу және жариялаудан алуды тексеріңіз.",
    ),
    example: T(
      "Кейс содержит купленную фотографию и телефон клиента.",
      "A case contains a purchased photo and a client’s phone number.",
      "Кейсте сатып алынған фото мен клиент телефоны бар.",
    ),
    steps: [
      T(
        "Уберите ненужные персональные данные.",
        "Remove unnecessary personal data.",
        "Қажетсіз жеке деректі алыңыз.",
      ),
      T(
        "Проверьте право распространять фотографию внутри исходника.",
        "Check redistribution rights for the photo inside the source.",
        "Түпнұсқадағы фотоны тарату құқығын тексеріңіз.",
      ),
      T(
        "Проверьте очищенную публикацию без входа.",
        "Test the cleaned publication while signed out.",
        "Тазаланған жарияланымды кірусіз тексеріңіз.",
      ),
    ],
    result: T(
      "Зритель получает обещанный материал без раскрытия лишних данных.",
      "Viewers receive intended materials without unnecessary disclosure.",
      "Көрермен артық дерексіз көзделген материалды алады.",
    ),
    practice: T(
      "Проведите предпубликационную проверку одного проекта.",
      "Run a pre-publication audit of one project.",
      "Бір жобаны жариялар алдында тексеріңіз.",
    ),
    actions: [
      T(
        "Перечислите авторов, материалы и разрешения.",
        "List creators, assets and permissions.",
        "Автор, материал және рұқсатты тізіңіз.",
      ),
      T(
        "Откройте ссылку на телефоне без аккаунта.",
        "Open the link on a phone while signed out.",
        "Телефонда сілтемені аккаунтсыз ашыңыз.",
      ),
      T(
        "Снимите тестовую работу с публикации и проверьте закрытие доступа.",
        "Unpublish the test work and verify access closes.",
        "Сынақ жұмысын жариялаудан алып, қолжетімділік жабылғанын тексеріңіз.",
      ),
    ],
    deliverable: T(
      "Публичный кейс и чек-лист прав, данных и доступа.",
      "A public case and rights/data/access checklist.",
      "Ашық кейс және құқық/дерек/қолжетімділік тізімі.",
    ),
    checks: [
      T(
        "Ссылка проверена без входа.",
        "The link is tested signed out.",
        "Сілтеме кірусіз тексерілген.",
      ),
      T(
        "Условия всех материалов выполнены.",
        "All asset terms are satisfied.",
        "Барлық материал шарты орындалған.",
      ),
    ],
    questions: [
      Q(
        T(
          "Как проверить публичность?",
          "How do you test public access?",
          "Ашық қолжетімділікті қалай тексереді?",
        ),
        [
          T(
            "Открыть ссылку без входа",
            "Open the link signed out",
            "Сілтемені кірусіз ашу",
          ),
          T(
            "Смотреть только редактор",
            "Inspect only the editor",
            "Тек редакторды қарау",
          ),
          T("Переименовать проект", "Rename the project", "Жобаны қайта атау"),
        ],
        0,
        T(
          "Сессия владельца может скрывать проблему доступа.",
          "An owner session can conceal an access problem.",
          "Иесінің сеансы қолжетімділік мәселесін жасырады.",
        ),
      ),
      Q(
        T("Что означает NC?", "What does NC mean?", "NC нені білдіреді?"),
        [
          T("Никаких условий", "No conditions", "Шарт жоқ"),
          T(
            "Ограничение коммерческого использования",
            "Restricted commercial use",
            "Коммерциялық қолдануды шектеу",
          ),
          T("Передачу авторства", "Transfer of authorship", "Авторлықты беру"),
        ],
        1,
        T(
          "Проверяйте все условия конкретной лицензии, не только значок CC.",
          "Read all terms of the specific license, not just the CC symbol.",
          "Тек CC белгісін емес, нақты лицензия шартын оқыңыз.",
        ),
      ),
      Q(
        T(
          "Что важно перед публикацией исходника?",
          "What matters before publishing a source?",
          "Түпнұсқаны жариялауда не маңызды?",
        ),
        [
          T("Только цвет кнопки", "Only button color", "Тек батырма түсі"),
          T(
            "Только размер заголовка",
            "Only heading size",
            "Тек тақырып өлшемі",
          ),
          T(
            "Личные данные и права на вложенные материалы",
            "Personal data and included-asset rights",
            "Жеке дерек пен ішкі материал құқығы",
          ),
        ],
        2,
        T(
          "Исходник может раскрывать больше, чем итоговая картинка.",
          "A source can reveal more than a final image.",
          "Түпнұсқа соңғы суреттен көбірек ақпарат ашады.",
        ),
      ),
    ],
    sources: [S.licenses, S.portfolio],
    minutes: 45,
  }),
};
