import type { LessonMaterial } from "./lesson-types";
import { M, T, Q, sources as S } from "./lesson-builder";
export const foundationLessons: Record<string, LessonMaterial> = {
  "vis-1": M({
    goal: T(
      "Выстроить и проверить порядок чтения афиши.",
      "Build and test a poster’s reading order.",
      "Афишаның оқу ретін құрып, тексеру.",
    ),
    principle: T(
      "Иерархия начинается с важности сообщения, а не с красивого шрифта. Сначала определите, что человек должен заметить, понять и сделать. Размер, контраст, положение и группировка поддерживают этот порядок. Если всё выделено одинаково, взгляд не получает направления.",
      "Hierarchy begins with message importance rather than an attractive font. Define what the viewer should notice, understand and do. Size, contrast, position and grouping support that order. Equal emphasis gives attention no direction.",
      "Иерархия әдемі қаріптен емес, хабар маңызынан басталады. Көрермен нені байқап, түсініп, істеуі керегін анықтаңыз. Өлшем, контраст, орын мен топтау сол ретті қолдайды. Бірдей акцент назарды бағыттамайды.",
    ),
    method: T(
      "Разделите содержание на главный заголовок, подтверждающие сведения и служебный текст. Соберите чёрно-белый макет, уменьшите до миниатюры или слегка размойте. Должен оставаться один главный акцент. Затем проверьте порядок чтения с новым зрителем, не объясняя замысел.",
      "Separate primary heading, supporting facts and utility text. Work in grayscale, reduce to a thumbnail or blur slightly. One main focal point should remain. Test reading order with a new viewer without explaining your intention.",
      "Негізгі тақырып, қосымша дерек және қызметтік мәтінді бөліңіз. Ақ-қара макетті кішірейтіп не аздап бұлыңғырлатыңыз. Бір негізгі акцент қалуы керек. Оқу ретін ойыңызды түсіндірмей жаңа көрерменмен тексеріңіз.",
    ),
    example: T(
      "Афиша кинопоказа: название, дата, место, регистрация.",
      "A screening poster: title, date, venue, registration.",
      "Кино афишасы: атау, күн, орын, тіркелу.",
    ),
    steps: [
      T(
        "Название фильма — первый уровень, дата — второй.",
        "Make the film title primary and date secondary.",
        "Фильм атауы бірінші, күн екінші деңгейде болсын.",
      ),
      T(
        "Место и регистрацию соберите в связанную группу.",
        "Group venue and registration together.",
        "Орын мен тіркелуді байланысты топқа жинаңыз.",
      ),
      T(
        "Покажите миниатюру на пять секунд и спросите, что запомнилось.",
        "Show a thumbnail for five seconds and ask what was remembered.",
        "Кіші көріністі бес секунд көрсетіп, не есте қалғанын сұраңыз.",
      ),
    ],
    result: T(
      "Зритель называет фильм первым и находит дату без подсказки: это проверка сообщения, не красоты.",
      "The viewer names the film first and finds the date unaided: a communication test, not a beauty score.",
      "Көрермен фильмді бірінші атап, күнді көмексіз табады: бұл әдемілік емес, хабар тексеруі.",
    ),
    practice: T(
      "Создайте две афиши вымышленного мастер-класса.",
      "Create two posters for a fictional workshop.",
      "Ойдан шығарылған шеберлік сабағына екі афиша жасаңыз.",
    ),
    actions: [
      T(
        "Выпишите три уровня информации.",
        "Write three information levels.",
        "Үш ақпарат деңгейін жазыңыз.",
      ),
      T(
        "В варианте B измените только масштаб заголовка.",
        "Change only heading scale in version B.",
        "B нұсқасында тек тақырып масштабын өзгертіңіз.",
      ),
      T(
        "Сравните миниатюры с новым зрителем и запишите наблюдение.",
        "Compare thumbnails with a new viewer and record the observation.",
        "Кіші көріністерді жаңа көрерменмен салыстырып, байқауды жазыңыз.",
      ),
    ],
    deliverable: T(
      "Два PNG, исходник и вывод из трёх предложений.",
      "Two PNGs, source and a three-sentence conclusion.",
      "Екі PNG, түпнұсқа және үш сөйлемдік қорытынды.",
    ),
    checks: [
      T(
        "Есть один главный акцент.",
        "One main focal point is present.",
        "Бір негізгі акцент бар.",
      ),
      T(
        "Вывод опирается на наблюдение, не на вкус.",
        "The conclusion uses observation rather than taste.",
        "Қорытынды талғамға емес, байқауға сүйенеді.",
      ),
    ],
    questions: [
      Q(
        T(
          "С чего начинается иерархия?",
          "Where does hierarchy start?",
          "Иерархия неден басталады?",
        ),
        [
          T("С важности сообщения", "Message importance", "Хабар маңызынан"),
          T("С количества эффектов", "Effect count", "Әсер санынан"),
          T("С цены шрифта", "Font price", "Қаріп бағасынан"),
        ],
        0,
        T(
          "Визуальные средства обслуживают информационную задачу.",
          "Visual means serve the information goal.",
          "Визуалды тәсілдер ақпарат міндетіне қызмет етеді.",
        ),
      ),
      Q(
        T(
          "Дата доминирует вместо названия. Что исправить?",
          "The date dominates instead of the title. What should change?",
          "Күн атаудың орнына басым. Нені түзету керек?",
        ),
        [
          T(
            "Удалить всю информацию",
            "Delete all information",
            "Барлық ақпаратты жою",
          ),
          T(
            "Соотношение масштаба и контраста",
            "Relative scale and contrast",
            "Салыстырмалы өлшем мен контраст",
          ),
          T("Добавить ещё узоры", "Add more patterns", "Өрнекті көбейту"),
        ],
        1,
        T(
          "Нужен относительный акцент без потери необходимого содержания.",
          "Adjust relative emphasis without losing necessary content.",
          "Қажетті мазмұнды жоғалтпай салыстырмалы акцентті өзгерту керек.",
        ),
      ),
      Q(
        T(
          "Что проверяет короткий просмотр?",
          "What does brief viewing test?",
          "Қысқа қарау нені тексереді?",
        ),
        [
          T("Лицензию шрифта", "Font license", "Қаріп лицензиясын"),
          T("Скорость сети", "Network speed", "Желі жылдамдығын"),
          T(
            "Порядок внимания и запоминания",
            "Attention and recall order",
            "Назар мен есте сақтау ретін",
          ),
        ],
        2,
        T(
          "Это проверка восприятия сообщения, а не технических свойств файла.",
          "It tests communication, not technical file properties.",
          "Бұл файл техникасын емес, хабарды қабылдауды тексереді.",
        ),
      ),
    ],
    sources: [S.hierarchy],
    minutes: 40,
  }),
  "vis-2": M({
    goal: T(
      "Построить повторяемую сетку и систему интервалов.",
      "Build a repeatable grid and spacing system.",
      "Қайталанатын тор мен аралық жүйесін құру.",
    ),
    principle: T(
      "Сетка — система связей, а не видимая клетка. Общие края связывают заголовок, изображение и подпись. Интервалы показывают отношения: внутри группы они обычно меньше, чем между группами. USWDS использует токены на основе 8 px; это полезный пример системы, а не универсальный закон.",
      "A grid is a system of relationships, not graph paper. Shared edges connect heading, image and caption. Spacing signals relationships: usually smaller within groups than between groups. USWDS uses tokens based on 8 px; this is a useful system example, not a universal law.",
      "Тор — көрінетін клетка емес, байланыс жүйесі. Ортақ жиек тақырып, сурет пен жазуды біріктіреді. Топ ішіндегі аралық әдетте топтар арасынан аз. USWDS 8 px негізді токен қолданады; бұл әмбебап заң емес, жүйе мысалы.",
    ),
    method: T(
      "Выберите поля, колонки и небольшой набор интервалов: например 8/16/24/32. Сначала выровняйте крупные блоки, затем подписи. Проверяйте длинные названия, отсутствующие описания и узкий экран. Перед добавлением нового случайного отступа ищите проблему в структуре.",
      "Choose margins, columns and a small spacing scale, such as 8/16/24/32. Align major blocks before captions. Test long titles, missing descriptions and narrow screens. Before inventing another arbitrary gap, inspect the structure.",
      "Жиек, баған және 8/16/24/32 сияқты шағын аралық қатарын таңдаңыз. Алдымен ірі блокты, кейін жазуды туралаңыз. Ұзын атау, жоқ сипаттама және тар экранды тексеріңіз. Жаңа кездейсоқ аралық қоспай, құрылымды қараңыз.",
    ),
    example: T(
      "Карточка события с названием, датой и кнопкой.",
      "An event card with title, date and button.",
      "Атау, күн және батырмасы бар іс-шара карточкасы.",
    ),
    steps: [
      T(
        "Задайте внешний отступ 24 px и один левый край.",
        "Use a 24 px inset and one left edge.",
        "Сыртқы ішкі жиекті 24 px етіп, сол жиекті теңестіріңіз.",
      ),
      T(
        "Между названием и датой оставьте 8 px, до кнопки — 24 px.",
        "Use 8 px between title and date, 24 px before the button.",
        "Атау мен күн арасына 8 px, батырмаға дейін 24 px қалдырыңыз.",
      ),
      T(
        "Замените название двухстрочным и проверьте систему.",
        "Insert a two-line title and recheck the system.",
        "Екі жолдық атау қойып, жүйені тексеріңіз.",
      ),
    ],
    result: T(
      "Карточки разной длины сохраняют общую структуру.",
      "Cards with different content retain a common structure.",
      "Мазмұны әртүрлі карточкалар ортақ құрылымды сақтайды.",
    ),
    practice: T(
      "Соберите три карточки и мобильную версию одной из них.",
      "Build three cards and a mobile version of one.",
      "Үш карточка және біреуінің мобильді нұсқасын жасаңыз.",
    ),
    actions: [
      T(
        "Запишите четыре разрешённых интервала.",
        "Record four allowed spacing values.",
        "Төрт рұқсат етілген аралықты жазыңыз.",
      ),
      T(
        "Используйте короткое, длинное и отсутствующее описание.",
        "Test short, long and missing descriptions.",
        "Қысқа, ұзын және жоқ сипаттаманы тексеріңіз.",
      ),
      T(
        "Скройте направляющие и проверьте группировку.",
        "Hide guides and inspect grouping.",
        "Бағыттауыштарды жасырып, топтауды тексеріңіз.",
      ),
    ],
    deliverable: T(
      "Сетка, мобильная карточка и список токенов.",
      "Grid, mobile card and token list.",
      "Тор, мобильді карточка және токен тізімі.",
    ),
    checks: [
      T(
        "Связанные элементы ближе соседних групп.",
        "Related elements are closer than adjacent groups.",
        "Байланысты элементтер көрші топтардан жақын.",
      ),
      T(
        "Длинное содержание не ломает выравнивание.",
        "Long content preserves alignment.",
        "Ұзын мазмұн туралауды бұзбайды.",
      ),
    ],
    questions: [
      Q(
        T(
          "Зачем нужны токены интервалов?",
          "Why use spacing tokens?",
          "Аралық токендері не үшін керек?",
        ),
        [
          T("Для согласованности", "For consistency", "Бірізділік үшін"),
          T(
            "Для запрета адаптивности",
            "To forbid responsiveness",
            "Бейімделуді тыю үшін",
          ),
          T(
            "Для одинакового размера всех объектов",
            "To size everything identically",
            "Барлығын бір өлшем ету үшін",
          ),
        ],
        0,
        T(
          "Небольшой набор значений уменьшает случайные различия.",
          "A small scale reduces arbitrary differences.",
          "Шағын қатар кездейсоқ айырманы азайтады.",
        ),
      ),
      Q(
        T(
          "Что обычно означает малый промежуток?",
          "What does a smaller gap usually mean?",
          "Кіші аралық әдетте нені білдіреді?",
        ),
        [
          T("Разные разделы", "Different sections", "Әртүрлі бөлім"),
          T(
            "Связь элементов группы",
            "Related group members",
            "Топ мүшелерінің байланысы",
          ),
          T("Ошибка экспорта", "Export failure", "Экспорт қатесі"),
        ],
        1,
        T(
          "Близость помогает воспринимать элементы вместе.",
          "Proximity groups elements perceptually.",
          "Жақындық элементтерді бірге қабылдауға көмектеседі.",
        ),
      ),
      Q(
        T(
          "Что проверять с длинным названием?",
          "What should be checked with a long title?",
          "Ұзын атауда не тексеріледі?",
        ),
        [
          T("Только цвет", "Only color", "Тек түс"),
          T("Только имя файла", "Only filename", "Тек файл атауы"),
          T(
            "Переносы, интервалы и общие края",
            "Wrapping, spacing and shared edges",
            "Жолға бөлу, аралық пен ортақ жиек",
          ),
        ],
        2,
        T(
          "Система должна выдерживать реальное содержание.",
          "The system must handle real content.",
          "Жүйе нақты мазмұнға төзуі керек.",
        ),
      ),
    ],
    sources: [S.spacing, S.hierarchy],
    minutes: 45,
  }),
  "vis-3": M({
    goal: T(
      "Проверять контраст и передавать смысл без зависимости от цвета.",
      "Check contrast and communicate meaning independently of color.",
      "Контрастты тексеріп, мағынаны түске тәуелсіз жеткізу.",
    ),
    principle: T(
      "Цветовая гармония не равна доступности. WCAG 2.2 AA требует минимум 4.5:1 для обычного текста и 3:1 для крупного. Крупный означает примерно 18 pt обычного или 14 pt жирного текста. Значение 4.49 нельзя округлить до проходного 4.5. Эти пороги не заменяют полной проверки интерфейса.",
      "Color harmony is not accessibility. WCAG 2.2 AA requires 4.5:1 for normal text and 3:1 for large text, approximately 18 pt regular or 14 pt bold. A result of 4.49 cannot be rounded to a passing 4.5. These thresholds do not replace a full interface audit.",
      "Түс үйлесімі қолжетімділікке тең емес. WCAG 2.2 AA қалыпты мәтінге 4.5:1, ірі мәтінге 3:1 талап етеді: шамамен 18 pt қалыпты не 14 pt қалың. 4.49 мәнін өтетін 4.5 деп дөңгелектеуге болмайды. Бұл шектер толық аудитті алмастырмайды.",
    ),
    method: T(
      "Измерьте реальные пары текста и фона, включая состояния кнопки и ошибки. Не обозначайте ошибку только красным: добавьте понятный текст. Проверьте макет без цвета и с увеличенным текстом. Сначала меняйте светлоту и цвет надписи, а не уменьшайте нужный текст ради красивого пятна.",
      "Measure actual text/background pairs, including button and error states. Do not rely on red alone: add clear error text. Test without color and with enlarged text. Adjust lightness and text color before sacrificing content for decoration.",
      "Мәтін/фонның нақты жұптарын, батырма мен қате күйлерін өлшеңіз. Тек қызылға сүйенбей, анық қате мәтінін қосыңыз. Түссіз және үлкейген мәтінмен тексеріңіз. Безендіру үшін мәтінді жоғалтпай, ашықтық пен жазу түсін өзгертіңіз.",
    ),
    example: T(
      "Белая надпись на лаймовой кнопке плохо читается.",
      "White text on a lime button is hard to read.",
      "Лайм батырмадағы ақ жазу нашар оқылады.",
    ),
    steps: [
      T(
        "Измерьте исходную пару цветов.",
        "Measure the original color pair.",
        "Бастапқы түс жұбын өлшеңіз.",
      ),
      T(
        "Сохраните фон, попробуйте тёмный текст и измерьте снова.",
        "Keep the background, try dark text and measure again.",
        "Фонды сақтап, қара мәтінді байқап, қайта өлшеңіз.",
      ),
      T(
        "Добавьте текст ошибки рядом с цветной рамкой.",
        "Add error text beside the colored border.",
        "Түсті жиекке қате мәтінін қосыңыз.",
      ),
    ],
    result: T(
      "Фирменный цвет сохранён, смысл не зависит от различения красного и зелёного.",
      "Brand color remains while meaning does not depend on distinguishing red and green.",
      "Бренд түсі сақталып, мағына қызыл мен жасылды ажыратуға тәуелсіз болады.",
    ),
    practice: T(
      "Проверьте три текстовые пары и одно состояние ошибки.",
      "Audit three text pairs and one error state.",
      "Үш мәтін жұбы мен бір қате күйін тексеріңіз.",
    ),
    actions: [
      T(
        "Запишите HEX-цвета и коэффициенты.",
        "Record HEX values and ratios.",
        "HEX мәндері мен коэффициенттерді жазыңыз.",
      ),
      T(
        "Исправьте непроходящие пары.",
        "Correct failing pairs.",
        "Өтпейтін жұптарды түзетіңіз.",
      ),
      T(
        "Проверьте понимание ошибки без цвета.",
        "Check error comprehension without color.",
        "Қатенің түссіз түсініктілігін тексеріңіз.",
      ),
    ],
    deliverable: T(
      "Таблица до/после и макет ошибки.",
      "Before/after table and an error mockup.",
      "Бұрын/кейін кестесі және қате макеті.",
    ),
    checks: [
      T(
        "Обычный текст достигает 4.5:1 без округления.",
        "Normal text reaches 4.5:1 without rounding.",
        "Қалыпты мәтін дөңгелектеусіз 4.5:1 жетеді.",
      ),
      T(
        "Ошибка объясняется текстом.",
        "The error is explained in text.",
        "Қате мәтінмен түсіндіріледі.",
      ),
    ],
    questions: [
      Q(
        T(
          "Порог обычного текста WCAG AA?",
          "WCAG AA threshold for normal text?",
          "WCAG AA қалыпты мәтін шегі?",
        ),
        [
          T("3:1", "3:1", "3:1"),
          T("4.5:1", "4.5:1", "4.5:1"),
          T("1:1", "1:1", "1:1"),
        ],
        1,
        T(
          "3:1 относится к крупному тексту; обычному требуется 4.5:1.",
          "3:1 is for large text; normal text needs 4.5:1.",
          "3:1 ірі мәтінге, қалыпты мәтінге 4.5:1 қажет.",
        ),
      ),
      Q(
        T(
          "Проходит ли 4.49:1 порог 4.5:1?",
          "Does 4.49:1 meet 4.5:1?",
          "4.49:1 мәні 4.5:1 шегіне сай ма?",
        ),
        [
          T("Нет", "No", "Жоқ"),
          T("Да, округляем", "Yes, round it", "Иә, дөңгелектейміз"),
          T("Только на телефоне", "Only on mobile", "Тек телефонда"),
        ],
        0,
        T(
          "Порог сравнивается с рассчитанным значением без округления вверх.",
          "Compare the calculated value without rounding upward.",
          "Есептелген мән жоғары дөңгелектеусіз салыстырылады.",
        ),
      ),
      Q(
        T(
          "Как лучше обозначить ошибку?",
          "How should an error be indicated?",
          "Қатені қалай көрсеткен дұрыс?",
        ),
        [
          T("Только красной рамкой", "Only red border", "Тек қызыл жиекпен"),
          T("Только миганием", "Only flashing", "Тек жыпылықтаумен"),
          T(
            "Текстом и дополнительным визуальным признаком",
            "Text plus a visual cue",
            "Мәтін және визуалды белгімен",
          ),
        ],
        2,
        T(
          "Текст сообщает, что исправить, даже если цвет не различим.",
          "Text explains correction even when color is not distinguishable.",
          "Түс ажыратылмаса да мәтін түзетуді түсіндіреді.",
        ),
      ),
    ],
    sources: [S.contrast, S.labels],
    minutes: 45,
  }),
  "vis-4": M({
    goal: T(
      "Собрать типографическую шкалу для трёх языков.",
      "Build a type scale for three languages.",
      "Үш тілге қаріп өлшемдері қатарын құру.",
    ),
    principle: T(
      "Размер сам по себе не гарантирует читаемость: гарнитуры отличаются x-height и оптическим размером. Работают вместе размер, насыщенность, длина строки и межстрочное расстояние. Одна гарнитура с несколькими ролями часто даёт достаточно контраста без конкурирующих декоративных шрифтов.",
      "Size alone does not guarantee readability: families differ in x-height and optical size. Size, weight, line length and line height work together. One family with distinct roles often gives sufficient contrast without competing decorative fonts.",
      "Өлшемнің өзі оқылуды кепілдемейді: қаріптер x-height пен оптикалық өлшемі бойынша өзгеше. Өлшем, қалыңдық, жол ұзындығы мен биіктігі бірге жұмыс істейді. Рөлдері анық бір қаріп бірнеше сәндік қаріпсіз жеткілікті контраст береді.",
    ),
    method: T(
      "Задайте заголовок, абзац и подпись. Начните, например, с 32/18/14 px и межстрочного 1.5 для абзаца, затем настройте по реальному тексту. Проверьте длинный перевод и буквы Ә, Ғ, Қ, Ң, Ө, Ұ, Ү, Һ, І. Проверяйте экспорт: отсутствие шрифта у зрителя может изменить переносы.",
      "Define heading, body and caption. Start, for example, at 32/18/14 px and 1.5 body line height, then tune with real content. Test longer translations and Ә, Ғ, Қ, Ң, Ө, Ұ, Ү, Һ, І. Check exports: font substitution can change wrapping.",
      "Тақырып, абзац және жазуды анықтаңыз. Мысалы, 32/18/14 px және 1.5 жол биіктігінен бастап, нақты мәтінге бейімдеңіз. Ұзын аударма мен Ә, Ғ, Қ, Ң, Ө, Ұ, Ү, Һ, І әріптерін тексеріңіз. Экспортта қаріп ауысса жолдар өзгеруі мүмкін.",
    ),
    example: T(
      "Описание выставки в русском, английском и казахском вариантах.",
      "An exhibition description in Russian, English and Kazakh.",
      "Көрме сипаттамасы орысша, ағылшынша және қазақша.",
    ),
    steps: [
      T(
        "Создайте три роли на одной гарнитуре.",
        "Create three roles in one family.",
        "Бір қаріпте үш рөл жасаңыз.",
      ),
      T(
        "Вставьте длинный перевод и специальные буквы.",
        "Insert a long translation and specific characters.",
        "Ұзын аударма мен арнайы әріптерді қойыңыз.",
      ),
      T(
        "Сузьте колонку и проверьте переносы и экспорт.",
        "Narrow the column and inspect wrapping and export.",
        "Бағанды тарылтып, жолға бөлу мен экспортты тексеріңіз.",
      ),
    ],
    result: T(
      "Все символы видны, роли различимы, длинный текст не обрезается.",
      "All characters render, roles are distinct and longer text is not clipped.",
      "Барлық таңба көрінеді, рөлдер ажыратылады, ұзын мәтін қиылмайды.",
    ),
    practice: T(
      "Оформите один текст на трёх языках в двух ширинах.",
      "Typeset one text in three languages and two widths.",
      "Бір мәтінді үш тілде, екі енде рәсімдеңіз.",
    ),
    actions: [
      T(
        "Запишите семейство, размеры и высоту строки.",
        "Record family, sizes and line height.",
        "Қаріп тобын, өлшем мен жол биіктігін жазыңыз.",
      ),
      T(
        "Разрешите переносы вместо нечитаемого уменьшения перевода.",
        "Allow wrapping rather than unreadably shrinking translations.",
        "Аударманы оқылмайтындай кішірейтпей, жолға бөліңіз.",
      ),
      T(
        "Проверьте шесть экспортированных макетов.",
        "Inspect six exported layouts.",
        "Алты экспортталған макетті тексеріңіз.",
      ),
    ],
    deliverable: T(
      "Шесть макетов и таблица типографических ролей.",
      "Six layouts and a table of type roles.",
      "Алты макет және қаріп рөлдері кестесі.",
    ),
    checks: [
      T(
        "Казахские символы отображаются корректно.",
        "Kazakh characters render correctly.",
        "Қазақ әріптері дұрыс көрінеді.",
      ),
      T(
        "Перевод не потерял слова из-за обрезки.",
        "No translation content is lost to clipping.",
        "Аударма сөзі қиылып жоғалмаған.",
      ),
    ],
    questions: [
      Q(
        T(
          "Почему шрифты при одном px выглядят разными?",
          "Why do fonts at the same px size look different?",
          "Бір px өлшемдегі қаріптер неге өзгеше көрінеді?",
        ),
        [
          T(
            "Различаются метрики и x-height",
            "Metrics and x-height differ",
            "Өлшемдері мен x-height әртүрлі",
          ),
          T(
            "px всегда равен сантиметру",
            "px always equals a centimeter",
            "px әрқашан сантиметрге тең",
          ),
          T("Из-за имени проекта", "Because of project name", "Жоба атауынан"),
        ],
        0,
        T(
          "Оптический размер зависит от конструкции букв.",
          "Optical size depends on letter construction.",
          "Оптикалық өлшем әріп құрылысына тәуелді.",
        ),
      ),
      Q(
        T(
          "Как проверять казахскую поддержку?",
          "How do you check Kazakh support?",
          "Қазақша қолдауды қалай тексереді?",
        ),
        [
          T("Только на A–Z", "Only A–Z", "Тек A–Z арқылы"),
          T(
            "На реальных словах со специфическими буквами и в экспорте",
            "With real Kazakh words and exported output",
            "Нақты қазақ сөздерімен және экспортта",
          ),
          T("Числом теней", "By counting shadows", "Көлеңке санымен"),
        ],
        1,
        T(
          "Латинский набор не гарантирует наличие нужных знаков.",
          "Latin glyphs do not guarantee other required characters.",
          "Латын әріптері қажетті таңбалар барын кепілдемейді.",
        ),
      ),
      Q(
        T(
          "Длинный перевод не помещается. Что лучше?",
          "A longer translation overflows. What is better?",
          "Ұзын аударма сыймайды. Не дұрыс?",
        ),
        [
          T(
            "Удалить половину текста",
            "Delete half the text",
            "Мәтіннің жартысын жою",
          ),
          T("Уменьшить до 7 px", "Shrink to 7 px", "7 px дейін кішірейту"),
          T(
            "Изменить ширину или переносы, сохранив читаемость",
            "Adjust width or wrapping while retaining readability",
            "Оқылуды сақтап, ен не жолға бөлуді өзгерту",
          ),
        ],
        2,
        T(
          "Содержание и чтение важнее искусственного сохранения одной строки.",
          "Content and reading matter more than forcing one line.",
          "Бір жолды күштеп сақтаудан мазмұн мен оқылу маңызды.",
        ),
      ),
    ],
    sources: [S.type, S.contrast],
    minutes: 50,
  }),

  "ux-1": M({
    goal: T(
      "Отделить потребность от решения и описать полный сценарий.",
      "Separate a need from a solution and describe a complete journey.",
      "Қажеттілікті шешімнен бөліп, толық сценарийді сипаттау.",
    ),
    principle: T(
      "Потребность описывает проблему в контексте: «хочу понять, подходит ли мне занятие», а не «хочу большую кнопку». GOV.UK рекомендует опираться на исследование, а не предположения. Не встраивайте конкретный канал или технологию в описание проблемы: иначе другие решения останутся незамеченными.",
      "A need describes a contextual problem: “I need to know whether this class suits me,” not “I need a bigger button.” GOV.UK recommends research evidence rather than assumptions. Avoid embedding a channel or technology in the problem, which can conceal alternative solutions.",
      "Қажеттілік жағдайдағы мәселені білдіреді: «сабақтың маған сай екенін білгім келеді», «үлкен батырма керек» емес. GOV.UK болжамнан гөрі зерттеу дерегіне сүйенуді ұсынады. Мәселеге нақты технологияны қоспаңыз: ол басқа шешімдерді жасыруы мүмкін.",
    ),
    method: T(
      "Запишите цель, исходную ситуацию и ограничения. Для каждого шага укажите вопрос пользователя, действие и ответ системы. Добавьте загрузку, пустой результат, ошибку и успех. Проверьте возвращение, исправление данных и сохранение работы после сбоя. Непроверенные предположения помечайте отдельно.",
      "Write the goal, context and constraints. For each step record the user question, action and system response. Include loading, empty, error and success states. Check recovery, correction and preservation of work. Label unverified assumptions separately.",
      "Мақсат, жағдай және шектеуді жазыңыз. Әр қадамға сұрақ, әрекет пен жүйе жауабын белгілеңіз. Жүктелу, бос нәтиже, қате мен сәттілікті қосыңыз. Қайту, түзету және еңбекті сақтауды тексеріңіз. Тексерілмеген болжамды бөлек белгілеңіз.",
    ),
    example: T(
      "Регистрация на вечерний мастер-класс при нестабильной сети.",
      "Workshop registration on an unstable connection.",
      "Тұрақсыз желіде кешкі сабаққа тіркелу.",
    ),
    steps: [
      T(
        "До формы покажите уровень, время, место и условия отмены.",
        "Show level, time, venue and cancellation terms before the form.",
        "Формаға дейін деңгей, уақыт, орын және бас тарту шартын көрсетіңіз.",
      ),
      T(
        "После отправки различайте ожидание и подтверждённый успех.",
        "Distinguish waiting from confirmed success after submission.",
        "Жіберген соң күтуді расталған сәттіліктен ажыратыңыз.",
      ),
      T(
        "При ошибке сохраните поля и предложите безопасный повтор.",
        "On failure preserve fields and offer a safe retry.",
        "Қатеде өрістерді сақтап, қауіпсіз қайталауды ұсыныңыз.",
      ),
    ],
    result: T(
      "Сценарий показывает завершение после сбоя, а не только идеальный путь.",
      "The journey covers recovery, not only the happy path.",
      "Сценарий мінсіз жолмен қатар қалпына келуді қамтиды.",
    ),
    practice: T(
      "Опишите сохранение проекта при сетевой ошибке и конфликте версий.",
      "Describe saving through a network failure and version conflict.",
      "Желі қатесі мен нұсқа қақтығысында сақтауды сипаттаңыз.",
    ),
    actions: [
      T(
        "Сформулируйте потребность без названия кнопки.",
        "State the need without naming a button.",
        "Қажеттілікті батырма атамай жазыңыз.",
      ),
      T(
        "Нарисуйте минимум пять состояний.",
        "Draw at least five states.",
        "Кемінде бес күй салыңыз.",
      ),
      T(
        "Отметьте сохраняемые данные и способы восстановления.",
        "Mark retained data and recovery actions.",
        "Сақталатын дерек пен қалпына келуді белгілеңіз.",
      ),
    ],
    deliverable: T(
      "Карта состояний и список проверяемых предположений.",
      "A state map and testable-assumption list.",
      "Күйлер картасы және тексерілетін болжам тізімі.",
    ),
    checks: [
      T(
        "Потребность описывает проблему, а не интерфейс.",
        "The need describes a problem, not an interface.",
        "Қажеттілік интерфейсті емес, мәселені сипаттайды.",
      ),
      T(
        "Ошибка не уничтожает введённые данные.",
        "Failure does not destroy entered data.",
        "Қате енгізілген деректі жоймайды.",
      ),
    ],
    questions: [
      Q(
        T(
          "Какое утверждение описывает потребность?",
          "Which statement describes a need?",
          "Қай сөйлем қажеттілікті сипаттайды?",
        ),
        [
          T("Нужна синяя кнопка", "I need a blue button", "Көк батырма керек"),
          T(
            "Нужно понять, сохранилась ли работа",
            "I need to know whether my work was saved",
            "Жұмысым сақталғанын білу керек",
          ),
          T(
            "Нужна определённая библиотека",
            "I need a specific library",
            "Нақты кітапхана керек",
          ),
        ],
        1,
        T(
          "Проблема сформулирована без заранее выбранного решения.",
          "The problem is stated without preselecting a solution.",
          "Мәселе алдын ала шешім таңдамай тұжырымдалған.",
        ),
      ),
      Q(
        T(
          "Что делать с предположением об аудитории?",
          "What should happen to an audience assumption?",
          "Аудитория болжамымен не істеу керек?",
        ),
        [
          T("Выдать за факт", "Present it as fact", "Дерек деп көрсету"),
          T("Скрыть от команды", "Hide it from the team", "Топтан жасыру"),
          T(
            "Пометить и запланировать проверку",
            "Label it and plan validation",
            "Белгілеп, тексеруді жоспарлау",
          ),
        ],
        2,
        T(
          "Пометка отделяет доказательство от гипотезы.",
          "Labeling separates evidence from hypotheses.",
          "Белгілеу дәлелді гипотезадан бөледі.",
        ),
      ),
      Q(
        T(
          "Почему после отказа полезно оставить поля заполненными?",
          "Why preserve fields after a rejection?",
          "Қабылданбағанда өрістерді неге сақтау керек?",
        ),
        [
          T(
            "Для восстановления без повторного ввода",
            "For recovery without re-entry",
            "Қайта термей қалпына келу үшін",
          ),
          T(
            "Чтобы считать заявку успешной",
            "To mark the request successful",
            "Өтінімді сәтті санау үшін",
          ),
          T(
            "Чтобы скрыть серверную ошибку",
            "To hide the server error",
            "Сервер қатесін жасыру үшін",
          ),
        ],
        0,
        T(
          "Сохранение ввода помогает повтору, но не означает подтверждение сервером.",
          "Retained input supports retry but does not imply confirmation.",
          "Енгізілгенді сақтау қайталауға көмектеседі, бірақ растауды білдірмейді.",
        ),
      ),
    ],
    sources: [S.needs],
    minutes: 50,
  }),
  "ux-2": M({
    goal: T(
      "Проверять прототип наблюдением без подсказок.",
      "Test a prototype by observing without prompting.",
      "Прототипті көмексіз бақылаумен тексеру.",
    ),
    principle: T(
      "Прототип проверяет гипотезу, а не доказывает красоту дизайна. Детализация зависит от вопроса: структура допускает схему, поиск элементов требует взаимодействия. Не тратьте время на эффекты, которые не уменьшают текущую неопределённость. Ограничения прототипа нужно заранее объяснить, не раскрывая правильный путь.",
      "A prototype tests a hypothesis rather than proving design beauty. Fidelity follows the question: structure can use sketches, while discoverability needs interaction. Avoid effects that do not reduce uncertainty. Explain prototype limitations without revealing the right path.",
      "Прототип дизайн әдемілігін дәлелдемей, гипотезаны тексереді. Нақтылық сұраққа тәуелді: құрылымға сызба, элемент табуға әрекеттесу керек. Белгісіздікті азайтпайтын әсерге уақыт жұмсамаңыз. Дұрыс жолды айтпай, прототип шектеуін түсіндіріңіз.",
    ),
    method: T(
      "Дайте реалистичную задачу вместо последовательности кликов. Попросите думать вслух, записывайте паузы и ошибки. Не ограничивайтесь вопросом «нравится ли»: проверяйте завершение и понимание результата. Маленький тест помогает искать проблемы, но не даёт точной статистики всей аудитории.",
      "Give a realistic task rather than click instructions. Invite thinking aloud and record pauses and errors. Go beyond “do you like it?” to completion and interpretation. A small test reveals issues, not precise population statistics.",
      "Басу тізбегінің орнына өмірлік міндет беріңіз. Дауыстап ойлануды сұрап, кідіріс пен қатені жазыңыз. «Ұнай ма?» деумен шектелмей, аяқтау мен нәтижені түсінуді тексеріңіз. Шағын сынақ мәселені табады, аудиторияның нақты статистикасын емес.",
    ),
    example: T(
      "Проверка выбора даты занятия.",
      "Testing class-date selection.",
      "Сабақ күнін таңдауды тексеру.",
    ),
    steps: [
      T(
        "Задание: «Вы свободны в пятницу вечером. Найдите занятие».",
        "Task: “You are free Friday evening. Find a class.”",
        "Міндет: «Жұма кешінде боссыз. Сабақ табыңыз».",
      ),
      T(
        "Не добавляйте подсказку «нажмите календарь».",
        "Do not prompt “click the calendar.”",
        "«Күнтізбені басыңыз» деп көмектеспеңіз.",
      ),
      T(
        "Запишите действия и то, как участник понял подтверждение.",
        "Record actions and interpretation of confirmation.",
        "Әрекеттер мен растауды түсінуді жазыңыз.",
      ),
    ],
    result: T(
      "Наблюдение «не заметил календарь» полезнее общей похвалы.",
      "“Did not notice the calendar” is more useful than general praise.",
      "«Күнтізбені байқамады» жалпы мақтаудан пайдалы.",
    ),
    practice: T(
      "Проведите два теста одного сценария и исправьте одну проблему.",
      "Run two tests of one journey and fix one issue.",
      "Бір сценарийді екі рет тексеріп, бір мәселені түзетіңіз.",
    ),
    actions: [
      T(
        "Запишите гипотезу и критерий наблюдения.",
        "Write the hypothesis and observation criterion.",
        "Гипотеза мен бақылау өлшемін жазыңыз.",
      ),
      T(
        "Разделите факт, интерпретацию и решение.",
        "Separate fact, interpretation and solution.",
        "Факт, түсіндіру мен шешімді бөліңіз.",
      ),
      T(
        "Повторите проверку после правки.",
        "Retest after revision.",
        "Түзетуден кейін қайта тексеріңіз.",
      ),
    ],
    deliverable: T(
      "Сценарий, две записи наблюдений, исправленный экран.",
      "Task script, two observation notes and a revised screen.",
      "Сценарий, екі бақылау жазбасы және түзетілген экран.",
    ),
    checks: [
      T(
        "Задание не подсказывает кнопки.",
        "The task does not name buttons.",
        "Міндет батырмаларды меңземейді.",
      ),
      T(
        "Вывод ограничен участниками и задачей.",
        "The conclusion is limited to participants and task.",
        "Қорытынды қатысушылар мен міндет аясында.",
      ),
    ],
    questions: [
      Q(
        T(
          "Какое задание меньше подсказывает путь?",
          "Which task avoids prompting?",
          "Қай міндет жолды аз меңзейді?",
        ),
        [
          T(
            "Нажмите зелёную кнопку",
            "Click the green button",
            "Жасыл батырманы басыңыз",
          ),
          T(
            "Откройте третью вкладку",
            "Open the third tab",
            "Үшінші қойындыны ашыңыз",
          ),
          T(
            "Найдите занятие на свободный вечер",
            "Find a class for a free evening",
            "Бос кешке сабақ табыңыз",
          ),
        ],
        2,
        T(
          "Цель позволяет наблюдать самостоятельный выбор.",
          "A goal allows independent navigation to be observed.",
          "Мақсат өздігінен таңдауды бақылауға мүмкіндік береді.",
        ),
      ),
      Q(
        T(
          "Что является наблюдением?",
          "Which is an observation?",
          "Қайсысы байқау?",
        ),
        [
          T(
            "Участник трижды открыл меню",
            "The participant opened the menu three times",
            "Қатысушы мәзірді үш рет ашты",
          ),
          T(
            "Пользователь невнимателен",
            "The user is careless",
            "Пайдаланушы зейінсіз",
          ),
          T(
            "Интерфейс идеален",
            "The interface is perfect",
            "Интерфейс мінсіз",
          ),
        ],
        0,
        T(
          "Конкретное действие проверяемо; оценка личности не объясняет проблему.",
          "An action is verifiable; a personality judgment does not explain the issue.",
          "Нақты әрекет тексеріледі; жеке баға мәселені түсіндірмейді.",
        ),
      ),
      Q(
        T(
          "Что даёт тест с двумя людьми?",
          "What can testing two people provide?",
          "Екі адамды тексеру не береді?",
        ),
        [
          T(
            "Точную конверсию всей страны",
            "Exact national conversion",
            "Елдің нақты конверсиясын",
          ),
          T(
            "Сигналы проблем для дальнейшей проверки",
            "Signals of issues for further testing",
            "Әрі қарай тексеруге мәселе белгілерін",
          ),
          T(
            "Гарантию отсутствия ошибок",
            "A guarantee of no errors",
            "Қате жоқтығының кепілін",
          ),
        ],
        1,
        T(
          "Маленькая выборка подходит для поиска проблем, не таких обобщений.",
          "A small sample suits issue discovery, not those generalizations.",
          "Шағын іріктеу мәселе табуға сай, мұндай жалпылауға емес.",
        ),
      ),
    ],
    sources: [S.prototypes, S.testing],
    minutes: 60,
  }),
  "ux-3": M({
    goal: T(
      "Проверить форму клавиатурой и понятность ошибок.",
      "Test keyboard access and error comprehension in a form.",
      "Форманың пернетақта қолжетімділігі мен қателерін тексеру.",
    ),
    principle: T(
      "Доступность — поведение, а не декоративный режим. Кнопка работает с клавиатуры, фокус остаётся видимым, поле имеет постоянную подпись. Placeholder исчезает при вводе и не заменяет label. Цветная рамка без текста не объясняет, какое значение исправить.",
      "Accessibility is behavior, not decoration. Buttons work by keyboard, focus stays visible, and fields have persistent labels. A placeholder disappears during entry and does not replace a label. A colored border alone does not explain what to correct.",
      "Қолжетімділік — безендіру емес, әрекет. Батырма пернетақтамен жұмыс істейді, фокус көрінеді, өрістің тұрақты белгісі бар. Енгізгенде жоғалатын placeholder label орнын баспайды. Түсті жиек жалғыз өзі нені түзету керегін түсіндірмейді.",
    ),
    method: T(
      "Пройдите путь клавишами Tab, Shift+Tab, Enter и Space. Сравните фокус с логическим порядком, введите неверные данные и проверьте инструкцию. Увеличьте масштаб до 200%: сообщения и действия должны оставаться достижимыми. Проверка вручную дополняет, но не заменяет проверку вспомогательными технологиями.",
      "Walk the path using Tab, Shift+Tab, Enter and Space. Check logical focus order, enter invalid data and inspect instructions. Zoom to 200%: messages and actions must remain reachable. Manual checking complements rather than replaces assistive-technology testing.",
      "Жолды Tab, Shift+Tab, Enter және Space арқылы өтіңіз. Фокус ретін, қате дерек нұсқауын тексеріңіз. 200% үлкейткенде хабар мен әрекет қолжетімді болсын. Қолмен тексеру көмекші технология сынағын толықтырады, алмастырмайды.",
    ),
    example: T(
      "Регистрация сообщает о неверной почте только красным цветом.",
      "Signup indicates invalid email only in red.",
      "Тіркелу қате поштаны тек қызылмен көрсетеді.",
    ),
    steps: [
      T(
        "Добавьте постоянную подпись и конкретную инструкцию.",
        "Add a persistent label and specific instruction.",
        "Тұрақты белгі мен нақты нұсқау қосыңыз.",
      ),
      T(
        "Проверьте Enter и видимый фокус кнопки.",
        "Test Enter and visible button focus.",
        "Enter мен батырма фокусын тексеріңіз.",
      ),
      T(
        "Сохраните корректные поля после отказа.",
        "Preserve valid fields after rejection.",
        "Қабылданбағанда дұрыс өрістерді сақтаңыз.",
      ),
    ],
    result: T(
      "Форму можно исправить и завершить без мыши и различения цветов.",
      "The form can be corrected and completed without a mouse or color distinction.",
      "Форманы тінтуірсіз және түсті ажыратусыз түзетіп, аяқтауға болады.",
    ),
    practice: T(
      "Найдите и исправьте три проблемы формы.",
      "Find and fix three form issues.",
      "Форманың үш мәселесін тауып, түзетіңіз.",
    ),
    actions: [
      T(
        "Запишите порядок фокуса.",
        "Record focus order.",
        "Фокус ретін жазыңыз.",
      ),
      T(
        "Замените «Неверно» конкретным сообщением.",
        "Replace “Invalid” with a specific message.",
        "«Қате» сөзін нақты хабармен ауыстырыңыз.",
      ),
      T(
        "Повторите путь без мыши при увеличении 200%.",
        "Repeat without a mouse at 200% zoom.",
        "Тінтуірсіз, 200% үлкейтіп қайталаңыз.",
      ),
    ],
    deliverable: T(
      "Чек-лист и макеты до/после.",
      "Checklist and before/after layouts.",
      "Тексеру тізімі және бұрын/кейін макеттері.",
    ),
    checks: [
      T(
        "Подписи и фокус постоянны и видимы.",
        "Labels and focus are persistent and visible.",
        "Белгі мен фокус тұрақты әрі көрінетін.",
      ),
      T(
        "Сообщения помогают исправить данные.",
        "Messages help correct data.",
        "Хабарлар деректі түзетуге көмектеседі.",
      ),
    ],
    questions: [
      Q(
        T(
          "Почему placeholder не заменяет label?",
          "Why does a placeholder not replace a label?",
          "Placeholder неге label алмастырмайды?",
        ),
        [
          T(
            "Исчезает при вводе",
            "It disappears during entry",
            "Енгізгенде жоғалады",
          ),
          T(
            "Всегда слишком яркий",
            "It is always too bright",
            "Әрқашан тым ашық",
          ),
          T(
            "Не поддерживает кириллицу",
            "It cannot use Cyrillic",
            "Кириллді қолдамайды",
          ),
        ],
        0,
        T(
          "Постоянная подпись сохраняет контекст заполнения.",
          "A persistent label preserves entry context.",
          "Тұрақты белгі толтыру мәнмәтінін сақтайды.",
        ),
      ),
      Q(
        T(
          "Что нужно пользователю клавиатуры?",
          "What does a keyboard user need?",
          "Пернетақта пайдаланушысына не қажет?",
        ),
        [
          T("Скрытый фокус", "Hidden focus", "Жасырын фокус"),
          T(
            "Видимый фокус и логический порядок",
            "Visible focus and logical order",
            "Көрінетін фокус пен қисынды рет",
          ),
          T("Обязательная мышь", "A required mouse", "Міндетті тінтуір"),
        ],
        1,
        T(
          "Нужно понимать, какой элемент получит действие.",
          "The active action target must be identifiable.",
          "Әрекет қолданылатын элемент анық болуы тиіс.",
        ),
      ),
      Q(
        T(
          "Какое сообщение полезнее?",
          "Which message is useful?",
          "Қай хабар пайдалы?",
        ),
        [
          T("Просто красная рамка", "Only a red border", "Тек қызыл жиек"),
          T("Что-то не так", "Something is wrong", "Бірдеңе дұрыс емес"),
          T(
            "Введите почту вида name@example.com",
            "Enter an email such as name@example.com",
            "Поштаны name@example.com түрінде енгізіңіз",
          ),
        ],
        2,
        T(
          "Конкретная инструкция помогает независимо от цвета.",
          "Specific instructions help independently of color.",
          "Нақты нұсқау түске тәуелсіз көмектеседі.",
        ),
      ),
    ],
    sources: [S.focus, S.labels, S.contrast],
    minutes: 50,
  }),
};
