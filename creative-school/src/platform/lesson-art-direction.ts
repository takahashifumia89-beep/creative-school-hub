import type { LessonMaterial } from "./lesson-types";
import { M, T, Q, sources as S } from "./lesson-builder";
const brief = {
  title: "How to write a creative brief: five steps for designers",
  url: "https://www.figma.com/resource-library/how-to-write-a-creative-brief/",
  publisher: "Figma",
};
const mood = {
  title: "How to make a mood board in 5 simple steps",
  url: "https://www.figma.com/resource-library/how-to-make-a-mood-board/",
  publisher: "Figma",
};
export const artDirectionLessons: Record<string, LessonMaterial> = {
  "ad-1": M({
    goal: T(
      "Составить бриф, который связывает цель, аудиторию и проверку.",
      "Write a brief connecting goal, audience and evaluation.",
      "Мақсат, аудитория мен тексеруді байланыстыратын бриф жазу.",
    ),
    principle: T(
      "Бриф — договорённость о задаче, а не список любимых цветов заказчика. Он объясняет аудиторию, основное сообщение, действие зрителя, форматы, ограничения, сроки и того, кто принимает решение. Отделяйте обязательное требование от гипотезы и предпочтения. Это оставляет пространство для нескольких обоснованных идей.",
      "A brief aligns the task rather than listing a client’s favorite colors. It identifies audience, message, desired action, formats, constraints, timing and decision owner. Separate requirements, hypotheses and preferences so several reasoned directions remain possible.",
      "Бриф — клиенттің сүйікті түс тізімі емес, міндет туралы келісім. Ол аудитория, хабар, көрермен әрекеті, пішім, шектеу, мерзім мен шешім иесін анықтайды. Міндетті талапты болжам мен талғамнан бөліңіз. Сонда бірнеше негізді идеяға орын қалады.",
    ),
    method: T(
      "Переведите «сделать ярче» в вопрос о цели: кто должен что заметить и сделать? Укажите критерий проверки до выбора стиля. Согласуйте набор выдаваемых файлов и число раундов обсуждения. Короткий понятный бриф полезнее длинного документа с противоречивыми требованиями.",
      "Translate “make it brighter” into a goal question: who should notice what and do what? Define evaluation before choosing a style. Agree deliverables and review rounds. A concise clear brief is more useful than a long contradictory document.",
      "«Ашықтау етуді» мақсат сұрағына айналдырыңыз: кім нені байқап, не істеуі керек? Стильге дейін тексеру өлшемін анықтаңыз. Файлдар мен талқылау айналымын келісіңіз. Қысқа анық бриф ұзын қайшылықты құжаттан пайдалы.",
    ),
    example: T(
      "Музею нужна афиша семейного мастер-класса, но просьба звучит «сделать модно».",
      "A museum asks for a “trendy” poster for a family workshop.",
      "Музей отбасылық сабақ афишасын «сәнді етуді» сұрайды.",
    ),
    steps: [
      T(
        "Уточните аудиторию, возраст детей, дату и способ записи.",
        "Clarify audience, children’s age, date and booking method.",
        "Аудитория, бала жасы, күн және жазылу жолын нақтылаңыз.",
      ),
      T(
        "Сформулируйте одно сообщение: занятие подходит новичкам и детям.",
        "State one message: suitable for beginners and children.",
        "Бір хабар жазыңыз: жаңадан бастаушы мен балаға сай.",
      ),
      T(
        "Выберите проверку: зритель быстро находит возраст и дату.",
        "Choose a test: viewers quickly find age and date.",
        "Тексеруді таңдаңыз: көрермен жас пен күнді тез табады.",
      ),
    ],
    result: T(
      "Решения можно сравнить по задаче, а не по спору о моде.",
      "Directions can be compared against the goal instead of arguing about trends.",
      "Бағыттарды сәнге таласпай, міндетпен салыстыруға болады.",
    ),
    practice: T(
      "Составьте одностраничный бриф вымышленного культурного события.",
      "Write a one-page brief for a fictional cultural event.",
      "Ойдан шығарылған мәдени шараға бір беттік бриф жасаңыз.",
    ),
    actions: [
      T(
        "Опишите аудиторию, сообщение и желаемое действие.",
        "Define audience, message and action.",
        "Аудитория, хабар мен әрекетті анықтаңыз.",
      ),
      T(
        "Запишите форматы, сроки и ограничения.",
        "Record formats, deadlines and constraints.",
        "Пішім, мерзім мен шектеуді жазыңыз.",
      ),
      T(
        "Отметьте предположения и критерий проверки.",
        "Label assumptions and evaluation criterion.",
        "Болжам мен тексеру өлшемін белгілеңіз.",
      ),
    ],
    deliverable: T(
      "Одностраничный бриф и три уточняющих вопроса.",
      "One-page brief and three clarification questions.",
      "Бір беттік бриф және үш нақтылау сұрағы.",
    ),
    checks: [
      T(
        "Цель описана через зрителя и действие.",
        "The goal names the viewer and action.",
        "Мақсат көрермен мен әрекет арқылы жазылған.",
      ),
      T(
        "Требования не противоречат друг другу.",
        "Requirements do not contradict each other.",
        "Талаптар бір-біріне қайшы емес.",
      ),
    ],
    questions: [
      Q(
        T(
          "Что лучше описывает цель брифа?",
          "Which best states a brief objective?",
          "Қайсысы бриф мақсатын жақсы сипаттайды?",
        ),
        [
          T(
            "Использовать три модных эффекта",
            "Use three trendy effects",
            "Үш сәнді әсер қолдану",
          ),
          T(
            "Помочь семьям понять возраст и записаться",
            "Help families identify age suitability and book",
            "Отбасыға жас сәйкестігін түсініп жазылуға көмектесу",
          ),
          T(
            "Сделать как у конкурента",
            "Copy a competitor’s look",
            "Бәсекелеске ұқсату",
          ),
        ],
        1,
        T(
          "Здесь указаны аудитория, понимание и действие; техника остаётся средством.",
          "Audience, understanding and action are specified; technique remains a means.",
          "Аудитория, түсіну мен әрекет көрсетілген; техника құрал болып қалады.",
        ),
      ),
      Q(
        T(
          "Зачем отделять гипотезу от требования?",
          "Why separate a hypothesis from a requirement?",
          "Болжамды талаптан неге бөлу керек?",
        ),
        [
          T(
            "Чтобы гипотезу можно было проверить и изменить",
            "So the hypothesis can be tested and revised",
            "Болжамды тексеріп өзгерту үшін",
          ),
          T(
            "Чтобы не разговаривать с заказчиком",
            "To avoid stakeholder discussion",
            "Клиентпен сөйлеспеу үшін",
          ),
          T(
            "Чтобы удалить ограничения",
            "To remove constraints",
            "Шектеуді жою үшін",
          ),
        ],
        0,
        T(
          "Непроверенная догадка не должна незаметно становиться обязательным условием.",
          "An untested guess should not silently become mandatory.",
          "Тексерілмеген жорамал жасырын міндетті шарт болмауы керек.",
        ),
      ),
      Q(
        T(
          "Когда согласовать критерии оценки?",
          "When should evaluation criteria be agreed?",
          "Бағалау өлшемі қашан келісіледі?",
        ),
        [
          T(
            "После выбора любимого варианта",
            "After choosing a favorite",
            "Сүйікті нұсқаны таңдаған соң",
          ),
          T(
            "После финального экспорта",
            "After final export",
            "Соңғы экспорттан кейін",
          ),
          T(
            "До разработки визуальных направлений",
            "Before developing visual directions",
            "Визуалды бағыттарды жасамай тұрып",
          ),
        ],
        2,
        T(
          "Ранние критерии позволяют сравнивать варианты последовательно.",
          "Early criteria enable consistent comparison.",
          "Ерте өлшем нұсқаларды бірізді салыстыруға мүмкіндік береді.",
        ),
      ),
    ],
    sources: [brief, S.needs],
    minutes: 50,
  }),
  "ad-2": M({
    goal: T(
      "Собрать мудборд с объяснимой визуальной логикой.",
      "Build a moodboard with an explainable visual logic.",
      "Түсіндіруге болатын визуалды қисыны бар мудборд құру.",
    ),
    principle: T(
      "Мудборд показывает направление, а не является готовым макетом. Референс полезен, когда ясно, что вы изучаете: свет, фактуру, композицию или типографику. Коллекция красивых несвязанных картинок не задаёт общего решения. Разделяйте вдохновение и материалы, которые вы действительно вправе включить в опубликованную работу.",
      "A moodboard communicates direction rather than a finished layout. A reference is useful when its role is clear: light, texture, composition or type. An unrelated image collection does not define a coherent solution. Separate inspiration from assets licensed for the published work.",
      "Мудборд дайын макет емес, бағытты көрсетеді. Референстен жарық, текстура, композиция не қаріпті зерттейтініңіз анық болса пайдалы. Байланыссыз әдемі суреттер ортақ шешім бермейді. Шабытты жарияланымда қолдануға құқығы бар материалдан бөліңіз.",
    ),
    method: T(
      "Выберите три слова-направления и соберите ограниченный набор примеров. Подпишите функцию каждого, уберите противоречащие примеры. Покажите две разные трактовки одного брифа. При обсуждении спрашивайте, какое направление лучше передаёт нужное сообщение, а не какая картинка красивее.",
      "Choose three directional words and a limited reference set. Annotate each role and remove contradictions. Show two interpretations of one brief. Discuss which direction communicates the message, rather than which individual image is prettier.",
      "Үш бағыт сөзін және шектеулі мысал жинағын таңдаңыз. Әрқайсының қызметін жазып, қайшылықтысын алыңыз. Бір брифтің екі түсіндірілуін көрсетіңіз. Жеке сурет сұлулығын емес, хабарды қай бағыт жақсы жеткізетінін талқылаңыз.",
    ),
    example: T(
      "Для выставки науки сравниваются направления «точно и спокойно» и «игровое открытие».",
      "A science exhibition compares “precise and calm” with “playful discovery.”",
      "Ғылым көрмесіне «нақты әрі сабырлы» және «ойын арқылы ашу» бағыттары салыстырылады.",
    ),
    steps: [
      T(
        "Соберите по шесть примеров на каждое направление.",
        "Collect six references for each direction.",
        "Әр бағытқа алты мысал жинаңыз.",
      ),
      T(
        "Подпишите, какой принцип берёте, не копируя готовую композицию.",
        "Label the principle borrowed without copying a finished layout.",
        "Дайын композицияны көшірмей, алынатын қағиданы жазыңыз.",
      ),
      T(
        "Сравните оба набора с аудиторией и сообщением брифа.",
        "Compare both sets with the brief’s audience and message.",
        "Екі жинақты бриф аудиториясы және хабарымен салыстырыңыз.",
      ),
    ],
    result: T(
      "Обсуждается визуальный язык, а не случайная подборка вкусов.",
      "Discussion concerns a visual language, not an arbitrary taste collection.",
      "Талқылау кездейсоқ талғам жинағы емес, визуалды тіл туралы болады.",
    ),
    practice: T(
      "Создайте два мудборда одного события из собственных или разрешённых изображений.",
      "Create two event moodboards using owned or permitted images.",
      "Өз не рұқсат етілген суреттермен бір шараға екі мудборд жасаңыз.",
    ),
    actions: [
      T(
        "Запишите три направляющих слова.",
        "Write three directional words.",
        "Үш бағыт сөзін жазыңыз.",
      ),
      T(
        "Аннотируйте каждый референс.",
        "Annotate every reference.",
        "Әр референсті түсіндіріңіз.",
      ),
      T(
        "Оставьте только примеры, работающие на выбранную идею.",
        "Keep only references supporting the idea.",
        "Идеяны қолдайтын мысалды ғана қалдырыңыз.",
      ),
    ],
    deliverable: T(
      "Два мудборда, комментарии и список источников изображений.",
      "Two annotated moodboards and an image-source list.",
      "Екі түсіндірілген мудборд және сурет дереккөздері.",
    ),
    checks: [
      T(
        "У каждого примера есть понятная роль.",
        "Each reference has a clear role.",
        "Әр мысалдың анық рөлі бар.",
      ),
      T(
        "Два направления различаются идеей, а не только цветом.",
        "Directions differ in idea, not just color.",
        "Бағыттар тек түспен емес, идеямен өзгеше.",
      ),
    ],
    questions: [
      Q(
        T(
          "Что делает референс полезным?",
          "What makes a reference useful?",
          "Референсті не пайдалы етеді?",
        ),
        [
          T(
            "Чётко указанное свойство, которое изучается",
            "A clearly identified property being studied",
            "Зерттелетін қасиетті анық көрсету",
          ),
          T("Большой размер файла", "Large file size", "Үлкен файл көлемі"),
          T(
            "Отсутствие комментария",
            "No annotation",
            "Түсініктеменің болмауы",
          ),
        ],
        0,
        T(
          "Подпись переводит впечатление в обсуждаемый принцип.",
          "An annotation turns an impression into a discussable principle.",
          "Жазу әсерді талқыланатын қағидаға айналдырады.",
        ),
      ),
      Q(
        T(
          "Чем мудборд отличается от готового макета?",
          "How does a moodboard differ from a finished layout?",
          "Мудборд дайын макеттен несімен өзгеше?",
        ),
        [
          T(
            "Он должен быть точной копией финала",
            "It must exactly copy the final",
            "Соңғының дәл көшірмесі болуы тиіс",
          ),
          T(
            "Он согласует направление до детализации",
            "It aligns direction before detailing",
            "Детальға дейін бағытты келіседі",
          ),
          T("Он отменяет бриф", "It replaces the brief", "Брифті жояды"),
        ],
        1,
        T(
          "Мудборд помогает выбрать визуальные принципы, а не завершает всю работу.",
          "It selects visual principles rather than completing the work.",
          "Ол бүкіл жұмысты аяқтамай, визуалды қағиданы таңдайды.",
        ),
      ),
      Q(
        T(
          "Как поступить с красивым, но противоречащим идее примером?",
          "What should happen to an attractive but contradictory reference?",
          "Әдемі, бірақ идеяға қайшы мысалмен не істеу керек?",
        ),
        [
          T(
            "Сделать его главным без объяснения",
            "Make it central without explanation",
            "Түсіндірмей негізгі ету",
          ),
          T("Скопировать в финал", "Copy it into the final", "Соңғыға көшіру"),
          T(
            "Убрать или явно выделить как отклонённый вариант",
            "Remove or mark it as a rejected option",
            "Алу не қабылданбаған нұсқа деп белгілеу",
          ),
        ],
        2,
        T(
          "Связность важнее количества понравившихся картинок.",
          "Coherence matters more than the number of liked images.",
          "Ұнаған сурет санынан тұтастық маңызды.",
        ),
      ),
    ],
    sources: [mood, S.licenses],
    minutes: 55,
  }),
  "ad-3": M({
    goal: T(
      "Перевести направление в проверяемый стилевой кадр.",
      "Translate a direction into a testable styleframe.",
      "Бағытты тексерілетін стиль кадрына айналдыру.",
    ),
    principle: T(
      "Стилевой кадр показывает будущий визуальный язык на реальном содержании. Это переход от референсов к собственному решению: композиция, типографика, палитра и характер изображения должны работать вместе. Красивый кадр с фиктивным коротким текстом не доказывает, что система выдержит реальные данные.",
      "A styleframe demonstrates the intended visual language using real content. It bridges references and an original solution: composition, type, palette and imagery must work together. An attractive frame with artificially short text does not show that the system handles real data.",
      "Стиль кадры болашақ визуалды тілді нақты мазмұнда көрсетеді. Ол референс пен өз шешіміңізді байланыстырады: композиция, қаріп, палитра мен бейне бірге жұмыс істейді. Жасанды қысқа мәтіні бар әдемі кадр жүйенің нақты дерекке төзуін дәлелдемейді.",
    ),
    method: T(
      "Возьмите один ключевой носитель из брифа и сделайте два кадра разного направления с одинаковой информацией. Изменяйте осмысленные принципы, а не только фильтр. Сравнивайте по критериям задачи, затем проверьте длинный заголовок и уменьшенную версию. Выбор зафиксируйте вместе с причиной.",
      "Choose one key deliverable and create two directions with identical information. Change meaningful principles rather than only a filter. Compare against brief criteria, then test a long heading and reduced version. Record the choice and reason.",
      "Брифтен бір негізгі тасымалдаушыны алып, бірдей ақпаратпен екі бағыт жасаңыз. Тек сүзгіні емес, мағыналы қағиданы өзгертіңіз. Міндет өлшемімен салыстырып, ұзын тақырып пен кіші нұсқаны тексеріңіз. Таңдау мен себебін тіркеңіз.",
    ),
    example: T(
      "Два варианта обложки образовательного фестиваля.",
      "Two cover directions for an educational festival.",
      "Білім фестивалі мұқабасының екі бағыты.",
    ),
    steps: [
      T(
        "Используйте одинаковые название, дату и формат.",
        "Use the same title, date and format.",
        "Бірдей атау, күн және пішімді қолданыңыз.",
      ),
      T(
        "В первом варианте стройте строгую сетку, во втором — игровую композицию.",
        "Use a disciplined grid in one and a playful composition in the other.",
        "Бірінде қатаң тор, екіншісінде ойын композициясын қолданыңыз.",
      ),
      T(
        "Проверьте читабельность и соответствие аудитории.",
        "Check readability and audience fit.",
        "Оқылу мен аудиторияға сәйкестікті тексеріңіз.",
      ),
    ],
    result: T(
      "Сравниваются две идеи на одинаковых условиях.",
      "Two ideas are compared under equal conditions.",
      "Екі идея бірдей жағдайда салыстырылады.",
    ),
    practice: T(
      "Сделайте два стилевых кадра из своего брифа.",
      "Make two styleframes from your brief.",
      "Брифіңізден екі стиль кадрын жасаңыз.",
    ),
    actions: [
      T(
        "Зафиксируйте неизменное содержание.",
        "Fix the shared content.",
        "Ортақ мазмұнды бекітіңіз.",
      ),
      T(
        "Назовите три принципа каждого направления.",
        "Name three principles per direction.",
        "Әр бағыттың үш қағидасын атаңыз.",
      ),
      T(
        "Выберите вариант по критериям и проверьте крайний случай.",
        "Choose by criteria and test an edge case.",
        "Өлшеммен таңдап, шеткі жағдайды тексеріңіз.",
      ),
    ],
    deliverable: T(
      "Два кадра, сравнительная таблица и обоснованный выбор.",
      "Two frames, comparison table and reasoned choice.",
      "Екі кадр, салыстыру кестесі және негізді таңдау.",
    ),
    checks: [
      T(
        "Содержание одинаково, принципы различимы.",
        "Content is equal and principles distinguishable.",
        "Мазмұн бірдей, қағидалар ажыратылады.",
      ),
      T(
        "Выбор связан с брифом.",
        "The choice relates to the brief.",
        "Таңдау брифке байланысты.",
      ),
    ],
    questions: [
      Q(
        T(
          "Почему сравнивать варианты с одинаковым текстом полезно?",
          "Why compare directions using the same text?",
          "Бағыттарды бірдей мәтінмен неге салыстырады?",
        ),
        [
          T(
            "Чтобы исключить влияние содержания на сравнение стиля",
            "To reduce content differences as a confound",
            "Мазмұн айырмасының әсерін азайту үшін",
          ),
          T(
            "Чтобы не проверять длинный текст",
            "To avoid testing long text",
            "Ұзын мәтінді тексермеу үшін",
          ),
          T(
            "Чтобы всегда выбрать первый",
            "To always choose the first",
            "Әрқашан біріншісін таңдау үшін",
          ),
        ],
        0,
        T(
          "Так легче понять, что изменилось именно из-за визуального решения.",
          "This helps isolate the effect of visual choices.",
          "Бұл визуалды шешім әсерін бөлуге көмектеседі.",
        ),
      ),
      Q(
        T(
          "Что должен показать styleframe?",
          "What should a styleframe demonstrate?",
          "Стиль кадры нені көрсетуі тиіс?",
        ),
        [
          T(
            "Только коллекцию чужих картинок",
            "Only a reference collection",
            "Тек бөгде сурет жинағын",
          ),
          T(
            "Согласованный визуальный язык на реальном содержании",
            "A coherent visual language on real content",
            "Нақты мазмұндағы тұтас визуалды тілді",
          ),
          T(
            "Только список программ",
            "Only a software list",
            "Тек бағдарлама тізімін",
          ),
        ],
        1,
        T(
          "Стилевой кадр — собственное применение выбранных принципов.",
          "A styleframe applies chosen principles in original work.",
          "Стиль кадры таңдалған қағиданы өз жұмысына қолданады.",
        ),
      ),
      Q(
        T(
          "Что проверить после выбора красивого кадра?",
          "What should follow choosing an attractive frame?",
          "Әдемі кадрды таңдағаннан кейін не тексеріледі?",
        ),
        [
          T(
            "Только цвет интерфейса редактора",
            "Only editor UI color",
            "Тек редактор интерфейсі түсі",
          ),
          T("Только название файла", "Only filename", "Тек файл атауы"),
          T(
            "Длинное содержание и уменьшенный размер",
            "Long content and reduced size",
            "Ұзын мазмұн мен кішірейтілген өлшем",
          ),
        ],
        2,
        T(
          "Направление должно выдерживать реальные ограничения носителя.",
          "The direction must survive real delivery constraints.",
          "Бағыт нақты тасымалдаушы шектеуіне төзуі керек.",
        ),
      ),
    ],
    sources: [S.hierarchy, brief],
    minutes: 60,
  }),
  "ad-4": M({
    goal: T(
      "Зафиксировать визуальную систему, пригодную для повторного применения.",
      "Document a visual system that can be reused.",
      "Қайта қолданылатын визуалды жүйені құжаттау.",
    ),
    principle: T(
      "Визуальная система — правила, которые создают согласованность разных носителей. Зафиксируйте роли цветов, типографику, интервалы, сетку, характер изображений и допустимые вариации. Один удачный экран не является системой: другой человек должен получить сходный результат без копирования каждой координаты.",
      "A visual system creates consistency across deliverables. Document color roles, typography, spacing, grid, imagery and allowed variation. One successful screen is not a system: another person should obtain a related result without copying every coordinate.",
      "Визуалды жүйе түрлі тасымалдаушының бірізділігін жасайды. Түс рөлі, қаріп, аралық, тор, бейне сипаты мен рұқсат етілген өзгерісті жазыңыз. Бір жақсы экран жүйе емес: басқа адам әр координатты көшірмей ұқсас нәтиже алуы тиіс.",
    ),
    method: T(
      "Описывайте назначение, а не только HEX-значение: основной акцент, фон, текст, состояние ошибки. Добавьте пример правильного и неправильного применения. Проверьте правила на трёх форматах и длинном переводе. При передаче укажите версии файлов и то, какие решения остаются свободными.",
      "Describe purpose, not only HEX values: primary accent, background, text and error state. Add correct and incorrect examples. Test three formats and longer translations. During handoff identify file versions and which decisions remain flexible.",
      "Тек HEX емес, қызметін жазыңыз: негізгі акцент, фон, мәтін және қате күйі. Дұрыс және қате мысал қосыңыз. Үш пішім мен ұзын аудармада тексеріңіз. Тапсыруда файл нұсқасы мен еркін шешімдерді белгілеңіз.",
    ),
    example: T(
      "Серия афиш должна сохранять узнаваемость в квадрате и вертикали.",
      "A poster series must remain recognizable in square and portrait formats.",
      "Афиша сериясы шаршы және тік пішімде танылуы тиіс.",
    ),
    steps: [
      T(
        "Опишите заголовочную роль, поля и акцентный цвет.",
        "Define heading role, margins and accent color.",
        "Тақырып рөлін, жиек пен акцент түсін анықтаңыз.",
      ),
      T(
        "Примените правила к трём разным названиям.",
        "Apply rules to three different titles.",
        "Ережені үш түрлі атауға қолданыңыз.",
      ),
      T(
        "Попросите другого человека сделать четвёртый макет по инструкции.",
        "Ask someone to make a fourth layout from the guide.",
        "Басқа адамнан нұсқаумен төртінші макет жасауды сұраңыз.",
      ),
    ],
    result: T(
      "Обнаруживаются недостающие правила, которые автор раньше держал в голове.",
      "Missing rules previously kept in the author’s head become visible.",
      "Автор ойында қалған жетіспейтін ережелер байқалады.",
    ),
    practice: T(
      "Соберите мини-гайд из пяти страниц для одного направления.",
      "Build a five-page mini guide for one direction.",
      "Бір бағытқа бес беттік шағын нұсқаулық жасаңыз.",
    ),
    actions: [
      T(
        "Запишите роли и значения токенов.",
        "Record token roles and values.",
        "Токен рөлі мен мәнін жазыңыз.",
      ),
      T(
        "Добавьте примеры применения и запретов.",
        "Add use and misuse examples.",
        "Қолдану және қате қолдану мысалын қосыңыз.",
      ),
      T(
        "Проверьте независимое воспроизведение.",
        "Test independent reproduction.",
        "Өздігінен қайталауды тексеріңіз.",
      ),
    ],
    deliverable: T(
      "Гайд, три носителя и список уточнений после передачи.",
      "Guide, three deliverables and handoff clarifications.",
      "Нұсқаулық, үш тасымалдаушы және тапсырудағы нақтылаулар.",
    ),
    checks: [
      T(
        "Токены имеют назначение и измеримые значения.",
        "Tokens have roles and measurable values.",
        "Токеннің қызметі мен өлшенетін мәні бар.",
      ),
      T(
        "Правила выдерживают другой формат и перевод.",
        "Rules survive another format and translation.",
        "Ереже өзге пішім мен аудармаға төзеді.",
      ),
    ],
    questions: [
      Q(
        T(
          "Что полезнее голого списка цветов?",
          "What is more useful than a bare color list?",
          "Жай түс тізімінен не пайдалы?",
        ),
        [
          T(
            "Ещё больше случайных оттенков",
            "More random shades",
            "Кездейсоқ реңкті көбейту",
          ),
          T(
            "Назначение цветов и правила сочетания",
            "Color roles and combination rules",
            "Түс қызметі мен үйлестіру ережесі",
          ),
          T("Удаление текста", "Removing text", "Мәтінді жою"),
        ],
        1,
        T(
          "Роли объясняют, когда применять значение.",
          "Roles explain when to apply a value.",
          "Рөл мәнді қашан қолдануды түсіндіреді.",
        ),
      ),
      Q(
        T(
          "Как проверить полноту гайда?",
          "How can guide completeness be tested?",
          "Нұсқаулық толықтығын қалай тексереді?",
        ),
        [
          T(
            "Дать другому человеку новую задачу по правилам",
            "Give another person a new task using the rules",
            "Басқа адамға ережемен жаңа міндет беру",
          ),
          T("Посчитать страницы", "Count pages", "Бетті санау"),
          T("Скрыть исходники", "Hide source files", "Түпнұсқаны жасыру"),
        ],
        0,
        T(
          "Независимое применение обнаруживает неявные решения.",
          "Independent use reveals implicit decisions.",
          "Өздігінен қолдану жасырын шешімді ашады.",
        ),
      ),
      Q(
        T(
          "Что означает один идеальный макет?",
          "What does one perfect mockup demonstrate?",
          "Бір мінсіз макет нені көрсетеді?",
        ),
        [
          T(
            "Систему для всех случаев без проверки",
            "An untested universal system",
            "Тексерусіз әмбебап жүйені",
          ),
          T(
            "Гарантию качества всех переводов",
            "Guaranteed translation quality",
            "Барлық аударма сапасының кепілін",
          ),
          T(
            "Один пример, который ещё нужно проверить на вариациях",
            "One example that still needs variation tests",
            "Әлі өзгерістерде тексерілетін бір мысалды",
          ),
        ],
        2,
        T(
          "Система подтверждается переносимостью правил.",
          "A system is demonstrated through transferable rules.",
          "Жүйе ереженің тасымалдануымен дәлелденеді.",
        ),
      ),
    ],
    sources: [S.spacing, S.type, S.contrast],
    minutes: 65,
  }),
  "ad-5": M({
    goal: T(
      "Презентовать решение через задачу и доказательства, а не защиту вкуса.",
      "Present decisions through goals and evidence rather than defending taste.",
      "Шешімді талғамды қорғаумен емес, міндет пен дәлел арқылы таныстыру.",
    ),
    principle: T(
      "Презентация помогает аудитории принять конкретное решение. Укажите контекст, проблему, идею, визуальные принципы, примеры и результат. Различайте наблюдения и предположения. Демонстрация десятков одинаковых мокапов не заменяет объяснения одной важной причины выбора.",
      "A presentation helps an audience make a specific decision. Show context, problem, idea, visual principles, applications and outcome. Separate observations from assumptions. Many similar mockups do not replace explaining one important decision.",
      "Таныстырылым аудиторияға нақты шешім қабылдауға көмектеседі. Мәнмәтін, мәселе, идея, визуалды қағида, мысал мен нәтижені көрсетіңіз. Байқауды болжамнан бөліңіз. Көп ұқсас мокап бір маңызды таңдаудың себебін түсіндірмейді.",
    ),
    method: T(
      "До встречи сформулируйте, что требуется согласовать. На каждом слайде оставьте один тезис и доказательство. Сначала напомните критерии брифа, затем покажите решение. Вопросы и правки записывайте по критериям; отделяйте запрос на изменение цели от исправления исполнения.",
      "Before the meeting state what needs agreement. Give each slide one claim and supporting evidence. Remind the audience of brief criteria before showing the solution. Record questions against criteria; distinguish a changed goal from execution corrections.",
      "Кездесуге дейін нені келісу керегін жазыңыз. Әр слайдта бір тезис пен дәлел қалдырыңыз. Шешімнен бұрын бриф өлшемін еске салыңыз. Сұрақты өлшеммен жазыңыз; мақсат өзгерісін орындау түзетуінен ажыратыңыз.",
    ),
    example: T(
      "Выбирается направление афиш фестиваля.",
      "A festival poster direction is being selected.",
      "Фестиваль афишасының бағыты таңдалады.",
    ),
    steps: [
      T(
        "Напомните аудиторию и два критерия выбора.",
        "Restate audience and two decision criteria.",
        "Аудитория мен екі таңдау өлшемін қайталаңыз.",
      ),
      T(
        "Покажите один ключевой кадр и две адаптации.",
        "Show one key frame and two adaptations.",
        "Бір негізгі кадр мен екі бейімдеуді көрсетіңіз.",
      ),
      T(
        "Завершите конкретным вопросом о согласовании и следующем шаге.",
        "End with a specific approval question and next step.",
        "Нақты келісу сұрағы және келесі қадаммен аяқтаңыз.",
      ),
    ],
    result: T(
      "Обсуждение заканчивается понятным решением и списком действий.",
      "Discussion ends with a clear decision and action list.",
      "Талқылау анық шешім және әрекет тізімімен аяқталады.",
    ),
    practice: T(
      "Подготовьте пять слайдов и двухминутный рассказ о проекте.",
      "Prepare five slides and a two-minute project presentation.",
      "Жобаға бес слайд және екі минуттық әңгіме дайындаңыз.",
    ),
    actions: [
      T(
        "Определите требуемое решение.",
        "Define the required decision.",
        "Қажет шешімді анықтаңыз.",
      ),
      T(
        "Оставьте по одному тезису на слайд.",
        "Keep one claim per slide.",
        "Әр слайдта бір тезис қалдырыңыз.",
      ),
      T(
        "После показа попросите зрителя пересказать вашу логику.",
        "Ask a viewer to restate the reasoning afterward.",
        "Көрсеткен соң көрерменнен қисынды қайталауды сұраңыз.",
      ),
    ],
    deliverable: T(
      "Пять слайдов, план речи и журнал полученной обратной связи.",
      "Five slides, speaking notes and a feedback log.",
      "Бес слайд, сөз жоспары және кері байланыс журналы.",
    ),
    checks: [
      T(
        "Понятно, какое решение нужно принять.",
        "The requested decision is clear.",
        "Қандай шешім керегі анық.",
      ),
      T(
        "Каждый тезис связан с задачей и примером.",
        "Each claim connects to a goal and example.",
        "Әр тезис міндет пен мысалға байланысты.",
      ),
    ],
    questions: [
      Q(
        T(
          "С чего полезно начать обсуждение?",
          "What is a useful opening for review?",
          "Талқылауды неден бастаған пайдалы?",
        ),
        [
          T(
            "С согласованной задачи и критериев",
            "With agreed goals and criteria",
            "Келісілген міндет пен өлшемнен",
          ),
          T(
            "С заявления «мне так нравится»",
            "With “I like it this way”",
            "«Маған осылай ұнайды» деуден",
          ),
          T(
            "Со списка всех программ",
            "With every software name",
            "Барлық бағдарлама атынан",
          ),
        ],
        0,
        T(
          "Общая задача делает оценку решений последовательной.",
          "A shared goal supports consistent evaluation.",
          "Ортақ міндет шешімді бірізді бағалауға көмектеседі.",
        ),
      ),
      Q(
        T(
          "Что должно завершать презентацию?",
          "What should conclude a presentation?",
          "Таныстырылым немен аяқталғаны дұрыс?",
        ),
        [
          T(
            "Новые несвязанные референсы",
            "Unrelated new references",
            "Байланыссыз жаңа референспен",
          ),
          T(
            "Конкретное решение и следующий шаг",
            "A concrete decision and next step",
            "Нақты шешім және келесі қадаммен",
          ),
          T(
            "Молчание без вопроса",
            "Silence without a question",
            "Сұрақсыз үнсіздікпен",
          ),
        ],
        1,
        T(
          "Аудитория должна понимать ожидаемое действие.",
          "The audience should understand the expected action.",
          "Аудитория күтілетін әрекетті түсінуі керек.",
        ),
      ),
      Q(
        T(
          "Почему менять цель и исправлять исполнение — разные вещи?",
          "Why distinguish a changed goal from execution fixes?",
          "Мақсат өзгерісі мен орындау түзетуі неге бөлек?",
        ),
        [
          T(
            "Чтобы игнорировать обратную связь",
            "To ignore feedback",
            "Кері байланысты елемеу үшін",
          ),
          T(
            "Чтобы всегда отказать заказчику",
            "To always refuse the client",
            "Клиентке үнемі бас тарту үшін",
          ),
          T(
            "Они меняют объём работы и критерии по-разному",
            "They affect scope and criteria differently",
            "Олар жұмыс көлемі мен өлшемге әртүрлі әсер етеді",
          ),
        ],
        2,
        T(
          "Изменение задачи требует новой договорённости, а не скрытой подмены проверки.",
          "A changed goal needs renewed agreement, not silently changed evaluation.",
          "Мақсат өзгерісі тексеруді жасырын ауыстыруды емес, жаңа келісімді қажет етеді.",
        ),
      ),
    ],
    sources: [S.critique, brief],
    minutes: 55,
  }),
};
