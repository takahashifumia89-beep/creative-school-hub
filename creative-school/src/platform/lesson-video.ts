import type { LessonMaterial } from "./lesson-types";
import { M, T, Q, sources as S } from "./lesson-builder";
const storyboard = {
  title: "How to get started on storyboarding",
  url: "https://www.adobe.com/creativecloud/video/discover/storyboarding.html",
  publisher: "Adobe",
};
export const videoLessons: Record<string, LessonMaterial> = {
  "vid-1": M({
    goal: T(
      "Превратить набор исходников в историю с понятным началом, развитием и результатом.",
      "Turn source footage into a story with a clear opening, development and outcome.",
      "Бастапқы бейнелерді түсінікті басы, дамуы және нәтижесі бар оқиғаға айналдыру.",
    ),
    principle: T(
      "До импорта сформулируйте одно предложение: кто что делает и что должен понять зритель. Отбор — не конкурс самых красивых кадров. Для каждого фрагмента определите функцию: установить место, показать действие, дать новую информацию или показать результат. Повторяющий уже понятное кадр может быть технически хорошим и всё равно лишним. Сначала соберите черновую последовательность без декоративных переходов.",
      "Before importing, write one sentence: who does what, and what should the viewer understand? Selection is not a competition for the prettiest shots. Give each excerpt a function: establish location, show action, add information or reveal a result. A technically good shot may still be redundant. Build the rough sequence before decorative transitions.",
      "Импортқа дейін бір сөйлем жазыңыз: кім не істейді және көрермен нені түсінуі керек? Іріктеу — ең әдемі кадр байқауы емес. Әр үзіндіге міндет беріңіз: орынды таныту, әрекетті көрсету, ақпарат қосу не нәтижені ашу. Техникалық жақсы кадр қайталанса артық болуы мүмкін. Сәндік өтуден бұрын бастапқы ретті жинаңыз.",
    ),
    method: T(
      "Сначала просмотрите исходники целиком и отметьте полезные интервалы. Не путайте имя файла и его содержание: записывайте действие, крупность и качество звука. Чередуйте общий план с деталью, если это помогает понять действие. Просмотрите сборку без музыки и попросите человека пересказать смысл. В браузере исходники остаются на устройстве: сохранённый проект содержит настройки, поэтому не перемещайте оригиналы без плана повторной привязки.",
      "Watch complete source clips first and note useful ranges. A filename is not a description: record action, shot scale and audio quality. Alternate context and detail when it improves understanding. Watch the rough cut without music and ask someone to retell it. Browser sources remain on the device: a saved project stores settings, so retain originals and plan to relink them.",
      "Алдымен түпнұсқаны толық қарап, пайдалы аралықты белгілеңіз. Файл атауы мазмұн сипаттамасы емес: әрекет, план ірілігі мен дыбыс сапасын жазыңыз. Түсінуге көмектессе, жалпы планды детальмен алмастырыңыз. Жинақты музыкасыз көріп, адамнан мағынасын айтуды сұраңыз. Браузер түпнұсқасы құрылғыда қалады: жоба баптауды сақтайды, сондықтан файлды сақтап, қайта байланыстыруды жоспарлаңыз.",
    ),
    example: T(
      "Двадцатисекундный ролик о керамическом мастер-классе.",
      "A twenty-second film about a ceramics workshop.",
      "Керамика шеберлік сабағы туралы жиырма секундтық ролик.",
    ),
    steps: [
      T(
        "0–3 с: общий план объясняет место и занятие.",
        "0–3 s: a wide shot establishes place and activity.",
        "0–3 с: жалпы план орын мен жұмысты түсіндіреді.",
      ),
      T(
        "3–11 с: крупный план рук показывает изменение формы, 11–17 с — готовый результат.",
        "3–11 s: hands show the form changing; 11–17 s reveals the finished result.",
        "3–11 с: қолдың ірі планы пішін өзгерісін, 11–17 с дайын нәтижені көрсетеді.",
      ),
      T(
        "17–20 с: короткий титр сообщает дату и одно действие. Проверьте, успевает ли зритель прочитать.",
        "17–20 s: a short title gives the date and one action. Check reading time.",
        "17–20 с: қысқа титр күн мен бір әрекетті береді. Оқуға уақыт жеткілікті ме, тексеріңіз.",
      ),
    ],
    result: T(
      "Каждый фрагмент добавляет информацию; история понятна до музыки и эффектов.",
      "Each excerpt adds information; the story reads before music and effects.",
      "Әр үзінді ақпарат қосады; оқиға музыка мен әсерсіз түсінікті.",
    ),
    practice: T(
      "Соберите 20–40 секундную историю из 4–8 собственных или разрешённых клипов.",
      "Build a 20–40 second story using 4–8 original or licensed clips.",
      "4–8 өз не рұқсатты клиптен 20–40 секундтық оқиға жинаңыз.",
    ),
    actions: [
      T(
        "Запишите одно сообщение и составьте журнал исходников с полезными интервалами.",
        "Write one message and a source log with useful ranges.",
        "Бір хабар мен пайдалы аралығы бар түпнұсқа журналын жазыңыз.",
      ),
      T(
        "Для каждого выбранного кадра укажите его функцию; удалите один повтор.",
        "State each selected shot’s purpose and remove one redundant shot.",
        "Әр таңдалған кадр міндетін жазып, бір қайталауды алып тастаңыз.",
      ),
      T(
        "Проверьте сборку без звука с человеком, который не знает исходную идею.",
        "Test the silent cut with someone unfamiliar with the idea.",
        "Идеяны білмейтін адаммен дыбыссыз жинақты тексеріңіз.",
      ),
    ],
    deliverable: T(
      "Черновой монтаж, журнал исходников и список разрешений на материалы.",
      "Rough cut, source log and asset-rights checklist.",
      "Бастапқы монтаж, түпнұсқа журналы және материал құқығы тізімі.",
    ),
    checks: [
      T(
        "Есть контекст, действие и результат.",
        "Context, action and outcome are present.",
        "Контекст, әрекет пен нәтиже бар.",
      ),
      T(
        "Каждый клип нужен для смысла.",
        "Each clip contributes meaning.",
        "Әр клип мағынаға қажет.",
      ),
      T(
        "Оригиналы и права на них сохранены.",
        "Originals and their usage rights are retained.",
        "Түпнұсқа мен қолдану құқығы сақталған.",
      ),
    ],
    questions: [
      Q(
        T(
          "Что важнее при отборе кадра в короткую историю?",
          "What matters most when selecting a shot for a short story?",
          "Қысқа оқиғаға кадр таңдағанда не маңызды?",
        ),
        [
          T(
            "Его функция в сообщении",
            "Its function in the message",
            "Хабардағы міндеті",
          ),
          T(
            "Только самая высокая цена камеры",
            "Only the most expensive camera",
            "Тек камераның қымбаттығы",
          ),
          T(
            "Только максимальная длительность",
            "Only the longest duration",
            "Тек ең ұзақ болуы",
          ),
        ],
        0,
        T(
          "Кадр должен добавлять контекст, действие или результат; техническая красота не заменяет функцию.",
          "A shot should add context, action or result; technical polish does not replace purpose.",
          "Кадр контекст, әрекет не нәтиже қосуы тиіс; техникалық әдемілік міндетті алмастырмайды.",
        ),
      ),
      Q(
        T(
          "Зритель видит только крупные планы рук и не понимает происходящее. Что добавить?",
          "A viewer sees only hands and misses the context. What should you add?",
          "Көрермен тек қолдың ірі планын көріп, жағдайды түсінбейді. Не қосу керек?",
        ),
        [
          T(
            "Больше одинаковых деталей",
            "More identical details",
            "Көбірек бірдей деталь",
          ),
          T("Случайный переход", "A random transition", "Кездейсоқ өту"),
          T(
            "План, устанавливающий место и действие",
            "A shot establishing place and activity",
            "Орын мен әрекетті танытатын план",
          ),
        ],
        2,
        T(
          "Общий план может дать недостающий контекст перед деталями.",
          "An establishing shot can provide missing context before details.",
          "Жалпы план детальға дейін жетіспеген контексті бере алады.",
        ),
      ),
      Q(
        T(
          "Что проверить до публикации чужого клипа?",
          "What should you check before publishing someone else’s clip?",
          "Бөтен клипті жариялаудан бұрын нені тексеру керек?",
        ),
        [
          T(
            "Только его популярность",
            "Only its popularity",
            "Тек танымалдығын",
          ),
          T(
            "Лицензию или разрешение на выбранное использование",
            "License or permission for the intended use",
            "Таңдалған қолдануға лицензия не рұқсатты",
          ),
          T(
            "Только расширение файла",
            "Only the file extension",
            "Тек файл кеңейтімін",
          ),
        ],
        1,
        T(
          "Доступность для просмотра или скачивания сама по себе не даёт права на использование.",
          "Being viewable or downloadable does not itself grant reuse rights.",
          "Көру не жүктеу мүмкіндігі өздігінен қайта қолдану құқығын бермейді.",
        ),
      ),
    ],
    sources: [storyboard, S.resolve],
    minutes: 50,
  }),
  "vid-2": M({
    goal: T(
      "Выбирать точки входа и выхода, сохраняя понятный ритм и непрерывность.",
      "Choose in/out points while preserving clear rhythm and continuity.",
      "Түсінікті ырғақ пен жалғастықты сақтап, кіру/шығу нүктесін таңдау.",
    ),
    principle: T(
      "Точки In и Out ограничивают используемую часть исходника; длина фрагмента равна Out−In. Неразрушающая обрезка меняет ссылки на интервал, а не удаляет данные оригинала. Слишком длинный вход задерживает действие, слишком ранний выход лишает его результата. Резать нужно по смыслу и движению, а не только по одинаковой длине всех клипов.",
      "In and Out bound the source range being used; excerpt duration is Out−In. Non-destructive trimming changes range references rather than erasing the original. A long lead-in delays action, while an early exit loses its outcome. Cut for meaning and movement, not merely to make every clip equally long.",
      "In және Out қолданылатын түпнұсқа аралығын шектейді; ұзақтығы Out−In. Бұзбай қию бастапқы деректі өшірмей, аралық сілтемесін өзгертеді. Ұзақ кіріс әрекетті кешіктіреді, ерте шығыс нәтижені жоғалтады. Барлық клипті бірдей ұзарту үшін емес, мағына мен қозғалысқа сай қиыңыз.",
    ),
    method: T(
      "Сравните кадр перед склейкой и после неё. При переходе на другую крупность сохраните направление и фазу действия, если нет причины их менять. Следите за скачком положения рук, предмета и взгляда. В последовательном монтаже удаление фрагмента сокращает общий хронометраж; после каждой перестановки заново проверьте соседние склейки. При более сложной работе профессиональный редактор предоставляет отдельные инструменты trim/ripple/roll; не считайте их автоматически доступными в браузерной студии.",
      "Compare frames immediately before and after a cut. When changing shot size, preserve direction and action phase unless there is a reason to change them. Watch jumps in hand, object and gaze positions. Removing a clip from a sequential cut shortens total duration; recheck neighboring cuts after reordering. Professional editors offer distinct trim/ripple/roll tools for advanced work; do not assume all are present in the browser.",
      "Склейка алдындағы және кейінгі кадрды салыстырыңыз. План ірілігін ауыстырғанда себеп болмаса бағыт пен әрекет кезеңін сақтаңыз. Қол, зат және көзқарас орнындағы секірісті бақылаңыз. Тізбекті монтаждан клипті жою жалпы уақытты қысқартады; ретін өзгерткен соң көрші өтулерді тексеріңіз. Кәсіби редакторда trim/ripple/roll бөлек құралдары бар; олардың бәрі браузерде бар деп санамаңыз.",
    ),
    example: T(
      "Из длинного клипа оставить один законченный жест: человек берёт чашку.",
      "Retain one complete gesture from a long clip: picking up a cup.",
      "Ұзын клиптен бір толық қимылды қалдыру: адам кесені алады.",
    ),
    steps: [
      T(
        "Найдите подготовку движения, контакт с ручкой и устойчивый результат.",
        "Locate anticipation, hand contact and a stable outcome.",
        "Қозғалыс дайындығы, тұтқамен жанасу және тұрақты нәтижені табыңыз.",
      ),
      T(
        "Установите In=2.4 с и Out=7.2 с: длительность получится 4.8 с.",
        "Set In=2.4 s and Out=7.2 s: duration is 4.8 s.",
        "In=2.4 с, Out=7.2 с қойыңыз: ұзақтығы 4.8 с.",
      ),
      T(
        "Сравните выход до и после контакта. Оставьте вариант, где жест понятен и не затянут.",
        "Compare exiting before and after contact; choose a clear, unhurried gesture.",
        "Жанасуға дейінгі және кейінгі шығысты салыстырып, түсінікті әрі созылмағанын таңдаңыз.",
      ),
    ],
    result: T(
      "Зритель видит действие целиком; лишнее ожидание убрано без потери смысла.",
      "The action remains complete while unnecessary waiting is removed.",
      "Әрекет толық көрінеді, артық күту мағынаны жоғалтпай алынады.",
    ),
    practice: T(
      "Смонтируйте три варианта одной короткой последовательности с разным ритмом.",
      "Make three rhythms from one short sequence.",
      "Бір қысқа тізбектен үш түрлі ырғақ жасаңыз.",
    ),
    actions: [
      T(
        "Отметьте полезные In/Out каждого клипа и посчитайте сумму длительностей.",
        "Record useful In/Out points and sum clip durations.",
        "Әр клиптің In/Out нүктесін жазып, ұзақтықты қосыңыз.",
      ),
      T(
        "Сделайте спокойную и более быструю версии без потери начала/результата действий.",
        "Make calm and faster versions without losing action starts or outcomes.",
        "Әрекет басы мен нәтижесін жоғалтпай, баяу және жылдамырақ нұсқа жасаңыз.",
      ),
      T(
        "Проверьте направления и позиции на каждой склейке, затем выберите версию по задаче.",
        "Inspect direction and position at every cut, then choose against the brief.",
        "Әр склейкада бағыт пен орынды тексеріп, міндетке сай нұсқаны таңдаңыз.",
      ),
    ],
    deliverable: T(
      "Таблица In/Out, три монтажа и объяснение двух исправленных склеек.",
      "In/Out table, three cuts and explanations of two corrected edits.",
      "In/Out кестесі, үш монтаж және түзетілген екі склейка түсіндірмесі.",
    ),
    checks: [
      T(
        "0 ≤ In < Out ≤ длительность исходника.",
        "0 ≤ In < Out ≤ source duration.",
        "0 ≤ In < Out ≤ түпнұсқа ұзақтығы.",
      ),
      T(
        "Нет случайных скачков действия.",
        "No accidental action discontinuities.",
        "Кездейсоқ әрекет секірісі жоқ.",
      ),
      T(
        "Общий хронометраж пересчитан после правок.",
        "Total duration is recalculated after revisions.",
        "Түзетуден кейін жалпы уақыт қайта есептелген.",
      ),
    ],
    questions: [
      Q(
        T(
          "In=2.4 с, Out=7.2 с. Длительность?",
          "In=2.4 s, Out=7.2 s. Duration?",
          "In=2.4 с, Out=7.2 с. Ұзақтығы?",
        ),
        [
          T("9.6 с", "9.6 s", "9.6 с"),
          T("4.8 с", "4.8 s", "4.8 с"),
          T("7.2 с", "7.2 s", "7.2 с"),
        ],
        1,
        T(
          "Используемый интервал равен разности конца и начала: 7.2−2.4.",
          "The selected interval is end minus start: 7.2−2.4.",
          "Қолданылатын аралық соңы мен басының айырмасы: 7.2−2.4.",
        ),
      ),
      Q(
        T(
          "Что делает неразрушающая обрезка?",
          "What does non-destructive trimming do?",
          "Бұзбай қию не істейді?",
        ),
        [
          T(
            "Меняет используемый диапазон, сохраняя оригинал",
            "Changes the used range while retaining the source",
            "Түпнұсқаны сақтап, қолданылатын аралықты өзгертеді",
          ),
          T(
            "Обязательно удаляет файл",
            "Always deletes the file",
            "Файлды міндетті жояды",
          ),
          T(
            "Меняет авторские права",
            "Changes copyright",
            "Авторлық құқықты өзгертеді",
          ),
        ],
        0,
        T(
          "Монтаж хранит выбор интервала; оригинал нужен для дальнейших правок.",
          "The edit stores a range choice; the original remains needed for revisions.",
          "Монтаж аралық таңдауын сақтайды; түпнұсқа кейінгі түзетуге қажет.",
        ),
      ),
      Q(
        T(
          "После смены крупности рука неожиданно прыгает. Что проверить?",
          "A hand jumps unexpectedly after changing shot size. What should you inspect?",
          "План ірілігі өзгергенде қол күтпеген жерге секірді. Нені тексеру керек?",
        ),
        [
          T(
            "Только цвет интерфейса",
            "Only interface color",
            "Тек интерфейс түсін",
          ),
          T("Только имя экспорта", "Only export name", "Тек экспорт атауын"),
          T(
            "Фазу действия и положение по обе стороны склейки",
            "Action phase and position on both sides of the cut",
            "Склейканың екі жағындағы әрекет кезеңі мен орынды",
          ),
        ],
        2,
        T(
          "Непрерывность зависит от согласования действий, не от эффектного перехода.",
          "Continuity depends on matching action, not a flashy transition.",
          "Жалғастық әсерлі өтуге емес, әрекетті сәйкестендіруге тәуелді.",
        ),
      ),
    ],
    sources: [S.trim, S.resolve],
    minutes: 55,
  }),
  "vid-3": M({
    goal: T(
      "Сбалансировать речь и музыку и проверить экспортированный видеофайл.",
      "Balance speech and music and verify the exported video.",
      "Сөйлеу мен музыканы теңестіріп, экспортталған бейнені тексеру.",
    ),
    principle: T(
      "Gain меняет усиление сигнала, а регулировка volume управляет его уровнем в монтаже; точная организация зависит от редактора. Громкость на слух и пиковое значение — не одно и то же. Перегруженный исходник нельзя надёжно восстановить простым уменьшением ползунка: тише станет и уже записанное искажение. Сначала обеспечьте разборчивость речи, затем подмешивайте музыку.",
      "Gain changes signal amplification while volume controls its level in the edit; exact organization depends on the application. Perceived loudness and peak level are different. Turning down an already clipped source does not reliably restore it: the recorded distortion also becomes quieter. Establish intelligible speech before adding music.",
      "Gain сигнал күшейтуін, volume монтаждағы деңгейін басқарады; нақты ұйымдасуы редакторға байланысты. Құлақтағы қаттылық пен шың мәні бір емес. Артық күшейіп бұзылған түпнұсқаны жүгірткіні азайтумен қалпына келтіру қиын: жазылған бұрмалану да жай ғана бәсеңдейді. Алдымен сөйлеуді анық етіп, кейін музыка қосыңыз.",
    ),
    method: T(
      "Прослушайте речь отдельно, музыку отдельно и их сумму в наушниках и на небольшом динамике. Музыка не должна скрывать слова. Браузерная студия смешивает исходный звук клипов с отдельной дорожкой; сохранённые настройки не загружают медиа на сервер. Экспорт WebM выполняется в реальном времени, поэтому держите вкладку активной. MP4, профессиональная нормализация по громкости и совместимость любого кодека не гарантируются. Проверяйте реальный файл на устройстве назначения.",
      "Listen to speech, music and their sum on headphones and a small speaker. Music must not mask words. The browser studio combines clip audio with a separate soundtrack; saving settings does not upload media. WebM export runs in real time, so keep the tab active. MP4, professional loudness normalization and universal codec support are not guaranteed. Test the actual file on the destination device.",
      "Сөйлеу, музыка және қосындысын құлаққап пен шағын динамикте тыңдаңыз. Музыка сөзді жаппасын. Браузер студиясы клип дыбысын бөлек жолмен араластырады; баптауды сақтау медианы серверге жүктемейді. WebM нақты уақытта экспортталады, сондықтан терезені белсенді ұстаңыз. MP4, кәсіби қаттылық нормалауы мен барлық кодек үйлесімділігі кепілденбейді. Нақты файлды мақсатты құрылғыда тексеріңіз.",
    ),
    example: T(
      "Инструкция с голосом, тихой музыкой и коротким финальным титром.",
      "A spoken tutorial with quiet music and a short closing title.",
      "Дауысты нұсқаулық, бәсең музыка және қысқа соңғы титр.",
    ),
    steps: [
      T(
        "Проверьте голос без музыки: слова должны быть понятны и не искажены.",
        "Check the voice without music for clarity and distortion.",
        "Музыкасыз дауыстың анықтығы мен бұрмалануын тексеріңіз.",
      ),
      T(
        "Добавьте музыку с низкого уровня и повышайте только до нужной поддержки настроения.",
        "Add music quietly and raise it only enough to support the mood.",
        "Музыканы төменнен қосып, көңіл күйді қолдауға жеткіліктіге ғана көтеріңіз.",
      ),
      T(
        "Скачайте WebM и просмотрите от начала до конца, проверяя синхронность, звук и титр.",
        "Download WebM and review start to finish for sync, audio and title readability.",
        "WebM жүктеп, синхрон, дыбыс пен титр оқылуын басынан соңына дейін тексеріңіз.",
      ),
    ],
    result: T(
      "Речь остаётся понятной, музыка поддерживает ролик, конечный файл воспроизводится.",
      "Speech stays intelligible, music supports the piece and the delivered file plays.",
      "Сөйлеу түсінікті, музыка роликті қолдайды, соңғы файл ойналады.",
    ),
    practice: T(
      "Подготовьте 20–30 секундную инструкцию с голосом и легально используемой фоновой музыкой.",
      "Prepare a 20–30 second spoken instruction with licensed background music.",
      "Дауыс пен рұқсатты фон музыкасы бар 20–30 секундтық нұсқаулық дайындаңыз.",
    ),
    actions: [
      T(
        "Составьте список источников звука и прав на музыку.",
        "List audio sources and music usage rights.",
        "Дыбыс көздері мен музыка құқығын жазыңыз.",
      ),
      T(
        "Сравните две версии баланса на наушниках и динамике; отметьте места маскировки слов.",
        "Compare two balances on headphones and a speaker; note masked words.",
        "Екі теңгерімді құлаққап пен динамикте салыстырып, жабылған сөзді белгілеңіз.",
      ),
      T(
        "Экспортируйте, откройте в другом проигрывателе и проверьте полный хронометраж.",
        "Export, open in another player and review the complete duration.",
        "Экспорттап, басқа ойнатқышта ашып, толық уақытты тексеріңіз.",
      ),
    ],
    deliverable: T(
      "Исходный проект, финальный WebM и лист проверки звука/воспроизведения.",
      "Source project, final WebM and an audio/playback review sheet.",
      "Түпнұсқа жоба, соңғы WebM және дыбыс/ойнату тексеру парағы.",
    ),
    checks: [
      T(
        "Слова не перекрыты музыкой.",
        "Music does not mask speech.",
        "Музыка сөзді жаппайды.",
      ),
      T(
        "Нет слышимых перегрузов и резких скачков.",
        "No audible clipping or unintended level jumps.",
        "Естілетін бұрмалану не күтпеген қаттылық секірісі жоқ.",
      ),
      T(
        "Проверен скачанный файл, а не только предпросмотр.",
        "The downloaded file, not only preview, is checked.",
        "Тек алдын ала көрініс емес, жүктелген файл тексерілген.",
      ),
    ],
    questions: [
      Q(
        T(
          "Что делать первым, если музыка скрывает речь?",
          "What should you do first when music masks speech?",
          "Музыка сөйлеуді жапса, алдымен не істеу керек?",
        ),
        [
          T(
            "Повысить всё одновременно",
            "Raise everything together",
            "Бәрін бірге көтеру",
          ),
          T(
            "Снизить музыку и проверить разборчивость речи",
            "Lower music and check speech intelligibility",
            "Музыканы азайтып, сөйлеу анықтығын тексеру",
          ),
          T("Поменять имя файла", "Rename the file", "Файл атауын өзгерту"),
        ],
        1,
        T(
          "Поднятие суммы может усилить перегруз, не улучшая соотношение речи и музыки.",
          "Raising the whole mix can worsen clipping without improving the speech/music relationship.",
          "Қоспаны көтеру сөйлеу/музыка қатынасын жақсартпай, бұрмалануды күшейтуі мүмкін.",
        ),
      ),
      Q(
        T(
          "Уменьшение громкости уже искажённой записи…",
          "Turning down an already clipped recording…",
          "Бұрыннан бұзылған жазба дыбысын азайту…",
        ),
        [
          T(
            "Не гарантирует восстановления потерянной формы сигнала",
            "Does not guarantee recovery of the damaged waveform",
            "Бұзылған сигнал пішінін қалпына келтіруді кепілдемейді",
          ),
          T(
            "Всегда идеально восстанавливает звук",
            "Always restores sound perfectly",
            "Дыбысты әрдайым мінсіз қалпына келтіреді",
          ),
          T(
            "Добавляет новые аудиодорожки",
            "Adds new audio tracks",
            "Жаңа дыбыс жолын қосады",
          ),
        ],
        0,
        T(
          "Снижается уровень искажения, но исходная информация могла быть потеряна.",
          "The distortion becomes quieter, but source information may already be lost.",
          "Бұрмалану бәсеңдейді, бірақ бастапқы ақпарат жоғалған болуы мүмкін.",
        ),
      ),
      Q(
        T(
          "Как убедиться в готовности WebM к передаче?",
          "How do you verify a WebM handoff?",
          "WebM тапсыруға дайын екенін қалай тексереді?",
        ),
        [
          T(
            "Увидеть кнопку «Экспорт»",
            "See an Export button",
            "Экспорт батырмасын көру",
          ),
          T(
            "Проверить только название",
            "Check only the filename",
            "Тек атауды тексеру",
          ),
          T(
            "Открыть реальный файл и проверить изображение, звук, длительность и совместимость",
            "Open the file and check picture, audio, duration and compatibility",
            "Нақты файлды ашып, сурет, дыбыс, ұзақтық пен үйлесімділікті тексеру",
          ),
        ],
        2,
        T(
          "Успешный предпросмотр не доказывает корректность кодирования и поддержки проигрывателем.",
          "A preview does not prove correct encoding or player support.",
          "Алдын ала көрініс дұрыс кодтау мен ойнатқыш қолдауын дәлелдемейді.",
        ),
      ),
    ],
    sources: [S.gain, S.resolve],
    minutes: 55,
  }),
};
