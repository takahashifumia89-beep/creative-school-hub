export type Text3 = readonly [string, string, string];
export type Question = { q: Text3; options: Text3[]; answer: number; explanation?: Text3 };
export type Lesson = {
  id: string;
  title: Text3;
  body: Text3;
  task: Text3;
  minutes: number;
  questions: Question[];
};
export type Course = { id: string; title: Text3; lessons: Lesson[] };
export const curriculum: Course[] = [
  {
    id: "visual-basics",
    title: ["Визуальный дизайн", "Visual design", "Визуалды дизайн"],
    lessons: [
      {
        id: "vis-1",
        title: ["Иерархия", "Hierarchy", "Иерархия"],
        body: [
          "Один главный акцент направляет взгляд. Размер, контраст и свободное пространство задают порядок чтения.",
          "One primary focal point directs attention. Size, contrast and whitespace establish reading order.",
          "Бір негізгі акцент назарды бағыттайды. Өлшем, контраст және бос кеңістік оқу ретін анықтайды.",
        ],
        task: [
          "Создайте небольшой проект по теме «Иерархия». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Hierarchy”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Иерархия» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 15,
        questions: [
          {
            q: [
              "Как выделить главное на экране?",
              "How do you establish a focal point?",
              "Экранда негізгі акцентті қалай бөлуге болады?",
            ],
            options: [
              [
                "Изменить размер и контраст одного ключевого элемента",
                "Change the size and contrast of one key element",
                "Бір негізгі элементтің өлшемі мен контрастын өзгерту",
              ],
              [
                "Сделать все элементы одинаково заметными",
                "Make every element equally prominent",
                "Барлық элементті бірдей айқын ету",
              ],
              [
                "Убрать свободное пространство",
                "Remove all whitespace",
                "Барлық бос кеңістікті жою",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "vis-2",
        title: ["Сетка и интервалы", "Grids and spacing", "Тор және аралықтар"],
        body: [
          "Используйте модуль 8 px. Связанные элементы располагайте ближе друг к другу, чем к соседним группам.",
          "Use an 8 px spacing unit. Related elements should be closer to one another than to adjacent groups.",
          "8 px аралық модулін қолданыңыз. Өзара байланысты элементтер басқа топтарға қарағанда жақын орналасуы керек.",
        ],
        task: [
          "Создайте небольшой проект по теме «Сетка и интервалы». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Grids and spacing”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Тор және аралықтар» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 18,
        questions: [
          {
            q: [
              "Какие интервалы помогают распознать группу?",
              "Which spacing helps identify a group?",
              "Топты тануға қандай аралық көмектеседі?",
            ],
            options: [
              [
                "Внутри группы меньше, чем между группами",
                "Smaller within a group than between groups",
                "Топ ішінде топтар арасына қарағанда аз",
              ],
              [
                "Везде случайные",
                "Random spacing everywhere",
                "Барлық жерде кездейсоқ",
              ],
              [
                "Внутри группы больше, чем между группами",
                "Larger within a group than between groups",
                "Топ ішінде топтар арасына қарағанда үлкен",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "vis-3",
        title: [
          "Цвет и доступность",
          "Color and accessibility",
          "Түс және қолжетімділік",
        ],
        body: [
          "Контраст обычного текста по WCAG AA — не ниже 4.5:1. Передавайте смысл также текстом и формой, а не только цветом.",
          "WCAG AA requires at least 4.5:1 contrast for normal text. Communicate meaning with text and shape as well as color.",
          "WCAG AA бойынша қалыпты мәтін контрасты кемінде 4.5:1. Мағынаны түспен қатар мәтін және пішін арқылы жеткізіңіз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Цвет и доступность». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Color and accessibility”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Түс және қолжетімділік» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 21,
        questions: [
          {
            q: [
              "Минимальный контраст обычного текста WCAG AA?",
              "Minimum WCAG AA contrast for normal text?",
              "WCAG AA қалыпты мәтінінің ең аз контрасты?",
            ],
            options: [
              ["4.5:1", "4.5:1", "4.5:1"],
              ["1.5:1", "1.5:1", "1.5:1"],
              ["2:1", "2:1", "2:1"],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "vis-4",
        title: ["Типографика", "Typography", "Типографика"],
        body: [
          "Начните с одной гарнитуры и трёх размеров. Для основного текста используйте межстрочное расстояние около 1.5 и проверяйте длинные строки на телефоне.",
          "Start with one typeface and three sizes. Use roughly 1.5 line height for body text and test long lines on a phone.",
          "Бір қаріп пен үш өлшемнен бастаңыз. Негізгі мәтіннің жол биіктігін шамамен 1.5 етіп, ұзын жолдарды телефонда тексеріңіз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Типографика». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Typography”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Типографика» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 24,
        questions: [
          {
            q: [
              "Что улучшает чтение длинного текста?",
              "What improves long-form readability?",
              "Ұзын мәтінді оқуды не жақсартады?",
            ],
            options: [
              [
                "Достаточная высота строки и проверка ширины колонки",
                "Adequate line height and testing column width",
                "Жеткілікті жол биіктігі және баған енін тексеру",
              ],
              [
                "Минимальный межстрочный интервал",
                "Minimum line height",
                "Ең аз жол биіктігі",
              ],
              [
                "Пять конкурирующих гарнитур",
                "Five competing typefaces",
                "Бес бәсекелес қаріп",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
    ],
  },
  {
    id: "3d-basics",
    title: ["3D-моделирование", "3D modeling", "3D модельдеу"],
    lessons: [
      {
        id: "b3d-1",
        title: ["Форма и силуэт", "Form and silhouette", "Пішін және силуэт"],
        body: [
          "Разбейте объект на простые объёмы. Сначала проверьте пропорции и читаемость силуэта без материалов, затем добавляйте детали.",
          "Break an object into simple volumes. Check proportions and silhouette without materials before adding detail.",
          "Нысанды қарапайым көлемдерге бөліңіз. Деталь қоспас бұрын материалсыз пропорция мен силуэтті тексеріңіз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Форма и силуэт». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Form and silhouette”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Пішін және силуэт» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 15,
        questions: [
          {
            q: [
              "Что проверять до мелких деталей?",
              "What should you check before fine detail?",
              "Ұсақ деталь алдында нені тексеру керек?",
            ],
            options: [
              [
                "Пропорции и силуэт",
                "Proportions and silhouette",
                "Пропорция мен силуэт",
              ],
              [
                "Название экспортного файла",
                "Export filename",
                "Экспорт файлының атауы",
              ],
              ["Только блики", "Only specular highlights", "Тек жарқылдар"],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "b3d-2",
        title: ["Композиция сцены", "Scene composition", "Сахна композициясы"],
        body: [
          "Выберите главный объект и точку обзора. Проверяйте отрицательное пространство и избегайте случайных пересечений контура объектов.",
          "Choose a focal object and viewpoint. Check negative space and avoid accidental tangencies between object outlines.",
          "Негізгі нысан мен көру нүктесін таңдаңыз. Бос кеңістікті тексеріп, контурлардың кездейсоқ жанасуын болдырмаңыз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Композиция сцены». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Scene composition”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Сахна композициясы» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 18,
        questions: [
          {
            q: [
              "Что помогает отделить главный объект?",
              "What helps separate the focal object?",
              "Негізгі нысанды бөлуге не көмектеседі?",
            ],
            options: [
              [
                "Ракурс и свободное пространство",
                "Viewpoint and negative space",
                "Көру нүктесі мен бос кеңістік",
              ],
              [
                "Случайные пересечения контуров",
                "Accidental outline tangencies",
                "Контурдың кездейсоқ жанасуы",
              ],
              [
                "Максимум одинаковых деталей",
                "As many identical details as possible",
                "Мүмкіндігінше көп бірдей деталь",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "b3d-3",
        title: ["PBR-материалы", "PBR materials", "PBR материалдары"],
        body: [
          "Metalness описывает металл, roughness — микрошероховатость. Для пластика metalness равен 0; увеличенная roughness размывает отражение.",
          "Metalness describes a metal surface; roughness describes microscopic irregularity. Plastic uses metalness 0; higher roughness blurs reflections.",
          "Metalness металл қасиетін, roughness микро кедір-бұдырлықты сипаттайды. Пластик үшін metalness 0; roughness артса шағылысу жайылады.",
        ],
        task: [
          "Создайте небольшой проект по теме «PBR-материалы». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “PBR materials”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«PBR материалдары» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 21,
        questions: [
          {
            q: [
              "Что делает высокая roughness?",
              "What does high roughness do?",
              "Жоғары roughness не істейді?",
            ],
            options: [
              [
                "Размывает отражения",
                "Blurs reflections",
                "Шағылысуды жайылтады",
              ],
              [
                "Делает любой объект металлическим",
                "Makes every object metallic",
                "Барлық нысанды металл етеді",
              ],
              [
                "Меняет количество полигонов",
                "Changes polygon count",
                "Полигон санын өзгертеді",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "b3d-4",
        title: ["Освещение", "Lighting", "Жарықтандыру"],
        body: [
          "Ключевой свет задаёт объём, заполняющий смягчает тени, контровой отделяет объект от фона. Меняйте по одному источнику за раз.",
          "Key light defines form, fill softens shadows, and rim light separates the subject. Adjust one light at a time.",
          "Негізгі жарық көлем береді, толтырушы көлеңкені жұмсартады, контурлық жарық нысанды фоннан бөледі. Бір уақытта бір жарықты өзгертіңіз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Освещение». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Lighting”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Жарықтандыру» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 24,
        questions: [
          {
            q: [
              "Зачем нужен заполняющий свет?",
              "What is fill light for?",
              "Толтырушы жарық не үшін қажет?",
            ],
            options: [
              ["Смягчить тени", "To soften shadows", "Көлеңкені жұмсарту"],
              ["Удалить материалы", "To remove materials", "Материалды жою"],
              [
                "Изменить геометрию",
                "To change geometry",
                "Геометрияны өзгерту",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "b3d-5",
        title: [
          "Экспорт и проверка",
          "Export and review",
          "Экспорт және тексеру",
        ],
        body: [
          "Перед финальным рендером сделайте маленький тест. Проверьте кадрирование, пересечения, цвет и формат; сохраните исходную сцену отдельно.",
          "Render a small test before the final output. Inspect framing, intersections, color and format; keep the editable scene separately.",
          "Соңғы рендер алдында шағын сынақ жасаңыз. Кадр, қиылысу, түс пен форматты тексеріп, өңделетін сахнаны бөлек сақтаңыз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Экспорт и проверка». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Export and review”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Экспорт және тексеру» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 27,
        questions: [
          {
            q: [
              "Что сделать перед финальным рендером?",
              "What should precede a final render?",
              "Соңғы рендер алдында не істеу керек?",
            ],
            options: [
              [
                "Маленький тестовый рендер",
                "A small test render",
                "Шағын сынақ рендері",
              ],
              [
                "Удалить исходную сцену",
                "Delete the source scene",
                "Бастапқы сахнаны жою",
              ],
              [
                "Отключить проверку кадра",
                "Skip framing review",
                "Кадрды тексермеу",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
    ],
  },
  {
    id: "motion-basics",
    title: ["Анимация", "Animation", "Анимация"],
    lessons: [
      {
        id: "mot-1",
        title: ["Ключевые кадры", "Keyframes", "Негізгі кадрлар"],
        body: [
          "Для движения между двумя положениями нужны два ключа. Частота кадров определяет число изображений в секунду, но не скорость движения сама по себе.",
          "Movement between two poses needs two keys. Frame rate is images per second, not the speed of movement itself.",
          "Екі қалып арасындағы қозғалысқа екі негізгі кадр қажет. Кадр жиілігі — қозғалыс жылдамдығы емес, секундтағы сурет саны.",
        ],
        task: [
          "Создайте небольшой проект по теме «Ключевые кадры». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Keyframes”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Негізгі кадрлар» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 15,
        questions: [
          {
            q: [
              "Минимум ключей для двух разных положений?",
              "Minimum keys for two distinct poses?",
              "Екі түрлі қалыпқа ең аз негізгі кадр саны?",
            ],
            options: [
              ["Два", "Two", "Екі"],
              ["Один", "One", "Бір"],
              ["Ноль", "Zero", "Нөл"],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "mot-2",
        title: ["Тайминг", "Timing", "Тайминг"],
        body: [
          "Timing — длительность действия, spacing — расстояние между положениями в соседних кадрах. Плавное ускорение создают изменением spacing.",
          "Timing is action duration; spacing is the distance between successive poses. Change spacing to create gradual acceleration.",
          "Тайминг — әрекет ұзақтығы, spacing — көршілес кадрлардағы қалып аралығы. Бірқалыпты үдеу үшін аралықты өзгертіңіз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Тайминг». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Timing”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Тайминг» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 18,
        questions: [
          {
            q: ["Что такое spacing?", "What is spacing?", "Spacing деген не?"],
            options: [
              [
                "Расстояние между последовательными положениями",
                "Distance between successive poses",
                "Кезекті қалыптар аралығы",
              ],
              ["Размер видеофайла", "Video file size", "Бейне файлының көлемі"],
              [
                "Число цветовых каналов",
                "Number of color channels",
                "Түс арналарының саны",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "mot-3",
        title: ["Вторичное движение", "Secondary motion", "Қосымша қозғалыс"],
        body: [
          "Части объекта редко останавливаются одновременно. Небольшое запаздывание вторичных деталей помогает передать вес, но не должно отвлекать от главного.",
          "Parts rarely stop simultaneously. A slight lag in secondary elements suggests weight without distracting from the main action.",
          "Бөлшектер бір уақытта сирек тоқтайды. Қосымша бөлшектердің аздап кешігуі негізгі әрекеттен алаңдатпай салмақты сездіреді.",
        ],
        task: [
          "Создайте небольшой проект по теме «Вторичное движение». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Secondary motion”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Қосымша қозғалыс» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 21,
        questions: [
          {
            q: [
              "Как показать вес вторичным движением?",
              "How can secondary motion suggest weight?",
              "Қосымша қозғалыс салмақты қалай білдіреді?",
            ],
            options: [
              [
                "Добавить небольшое запаздывание частей",
                "Add a slight lag to secondary parts",
                "Бөлшектерге аздап кешігу қосу",
              ],
              [
                "Остановить все части строго одновременно",
                "Stop all parts at exactly the same time",
                "Барлық бөлшекті дәл бір уақытта тоқтату",
              ],
              [
                "Менять цвет каждый кадр",
                "Change color every frame",
                "Әр кадрда түсті өзгерту",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "mot-4",
        title: ["Раскадровка", "Storyboarding", "Кадр жоспары"],
        body: [
          "До анимации нарисуйте 4–6 ключевых кадров. Для каждого укажите действие, длительность и переход, затем проверьте последовательность без звука.",
          "Draw 4–6 key panels before animating. Note action, duration and transition, then check the sequence without sound.",
          "Анимация алдында 4–6 негізгі көрініс салыңыз. Әрқайсысына әрекет, ұзақтық және өтуді жазып, ретін дыбыссыз тексеріңіз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Раскадровка». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Storyboarding”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Кадр жоспары» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 24,
        questions: [
          {
            q: [
              "Что отметить в раскадровке?",
              "What belongs in a storyboard?",
              "Кадр жоспарында не белгіленеді?",
            ],
            options: [
              [
                "Действие, длительность и переход",
                "Action, duration and transition",
                "Әрекет, ұзақтық және өту",
              ],
              [
                "Только название программы",
                "Only the application name",
                "Тек бағдарлама атауы",
              ],
              [
                "Только итоговый размер файла",
                "Only final file size",
                "Тек соңғы файл көлемі",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "mot-5",
        title: ["Короткая заставка", "Short title sequence", "Қысқа кіріспе"],
        body: [
          "У заставки должна быть одна читаемая идея. Оставьте время на чтение текста и проверьте первый и последний кадр как самостоятельные композиции.",
          "A title sequence needs one readable idea. Allow time to read and assess the first and last frames as standalone compositions.",
          "Кіріспеде бір түсінікті идея болуы керек. Мәтінді оқуға уақыт қалдырып, алғашқы және соңғы кадрды жеке композиция ретінде тексеріңіз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Короткая заставка». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Short title sequence”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Қысқа кіріспе» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 27,
        questions: [
          {
            q: [
              "Как проверить читаемость заставки?",
              "How do you check title readability?",
              "Кіріспе мәтінінің оқылуын қалай тексереді?",
            ],
            options: [
              [
                "Дать достаточно времени на чтение",
                "Allow enough reading time",
                "Оқуға жеткілікті уақыт беру",
              ],
              [
                "Добавить максимум эффектов",
                "Add as many effects as possible",
                "Мүмкіндігінше көп әсер қосу",
              ],
              [
                "Скрыть первый кадр",
                "Hide the first frame",
                "Алғашқы кадрды жасыру",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
    ],
  },
  {
    id: "art-direction",
    title: ["Арт-дирекшн", "Art direction", "Арт-дирекшн"],
    lessons: [
      {
        id: "ad-1",
        title: ["Бриф", "Creative brief", "Шығармашылық бриф"],
        body: [
          "Определите аудиторию, задачу и измеримый результат. Разделите ограничения и предположения; до выбора стиля согласуйте критерии успеха.",
          "Define the audience, problem and measurable outcome. Separate constraints from assumptions and agree success criteria before styling.",
          "Аудиторияны, міндетті және өлшенетін нәтижені анықтаңыз. Шектеулерді болжамнан бөліп, стиль таңдағанға дейін табыс өлшемдерін келісіңіз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Бриф». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Creative brief”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Шығармашылық бриф» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 15,
        questions: [
          {
            q: [
              "Что определить до выбора стиля?",
              "What comes before choosing a style?",
              "Стиль таңдаудан бұрын не анықталады?",
            ],
            options: [
              [
                "Аудитория, задача и критерии успеха",
                "Audience, problem and success criteria",
                "Аудитория, міндет және табыс өлшемдері",
              ],
              ["Только модный цвет", "Only a trendy color", "Тек сәнді түс"],
              [
                "Только формат логотипа",
                "Only logo format",
                "Тек логотип пішімі",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "ad-2",
        title: ["Мудборд", "Moodboard", "Мудборд"],
        body: [
          "Мудборд выбирает направление, а не заменяет финальный дизайн. Подпишите, что берёте из референса: палитру, композицию или свет; учитывайте лицензии.",
          "A moodboard chooses a direction, not a final design. Annotate what each reference contributes: palette, composition or light; respect licenses.",
          "Мудборд соңғы дизайнды емес, бағытты анықтайды. Референстен алынатын палитра, композиция не жарықты белгілеңіз; лицензияны ескеріңіз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Мудборд». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Moodboard”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Мудборд» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 18,
        questions: [
          {
            q: [
              "Как использовать референс корректно?",
              "How should a reference be used?",
              "Референсті қалай дұрыс қолданады?",
            ],
            options: [
              [
                "Указать, какое свойство изучаете, и проверить права",
                "Annotate the relevant property and check rights",
                "Зерттелетін қасиетті көрсетіп, құқықты тексеру",
              ],
              [
                "Скопировать без указания источника",
                "Copy without attribution",
                "Дереккөзсіз көшіру",
              ],
              [
                "Считать его готовым решением",
                "Treat it as the finished solution",
                "Оны дайын шешім деп санау",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "ad-3",
        title: ["Стилевой кадр", "Styleframe", "Стиль кадры"],
        body: [
          "Styleframe показывает будущий визуальный язык в одном кадре. Создайте два разных направления на одном брифе и сравните их по критериям задачи.",
          "A styleframe demonstrates the visual language in one frame. Develop two directions for the same brief and compare against the criteria.",
          "Стиль кадры болашақ визуалды тілді бір кадрда көрсетеді. Бір брифке екі бағыт жасап, міндет өлшемдерімен салыстырыңыз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Стилевой кадр». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Styleframe”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Стиль кадры» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 21,
        questions: [
          {
            q: [
              "Что показывает styleframe?",
              "What does a styleframe show?",
              "Стиль кадры нені көрсетеді?",
            ],
            options: [
              [
                "Будущий визуальный язык",
                "The intended visual language",
                "Болашақ визуалды тіл",
              ],
              ["Расписание встреч", "Meeting schedule", "Кездесу кестесі"],
              [
                "Только техническое задание",
                "Only a technical specification",
                "Тек техникалық тапсырма",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "ad-4",
        title: ["Визуальная система", "Visual system", "Визуалды жүйе"],
        body: [
          "Зафиксируйте палитру, типографику, интервалы и примеры применения. Правила должны работать на маленьком экране и в длинном тексте.",
          "Document palette, typography, spacing and applications. Rules must work on small screens and with long text.",
          "Палитра, қаріп, аралық және қолдану мысалдарын тіркеңіз. Ережелер шағын экранда және ұзын мәтінде жұмыс істеуі тиіс.",
        ],
        task: [
          "Создайте небольшой проект по теме «Визуальная система». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Visual system”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Визуалды жүйе» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 24,
        questions: [
          {
            q: [
              "Что входит в визуальную систему?",
              "What belongs in a visual system?",
              "Визуалды жүйеге не кіреді?",
            ],
            options: [
              [
                "Палитра, типографика, интервалы и примеры",
                "Palette, type, spacing and examples",
                "Палитра, қаріп, аралық пен мысал",
              ],
              [
                "Только один красивый кадр",
                "Only one attractive frame",
                "Тек бір әдемі кадр",
              ],
              [
                "Только название бренда",
                "Only the brand name",
                "Тек бренд атауы",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "ad-5",
        title: ["Презентация", "Presentation", "Таныстырылым"],
        body: [
          "Объясняйте решение в порядке: задача, наблюдение, идея, принципы, примеры, результат. Отделяйте проверенные результаты от ожидаемых.",
          "Explain the problem, observation, idea, principles, applications and outcome in that order. Separate verified results from expectations.",
          "Міндет, байқау, идея, қағида, мысал және нәтижені ретімен түсіндіріңіз. Тексерілген нәтижені күтілетін нәтижеден бөліңіз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Презентация». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Presentation”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Таныстырылым» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 27,
        questions: [
          {
            q: [
              "С чего начать презентацию решения?",
              "Where should a solution presentation begin?",
              "Шешімді таныстыру неден басталады?",
            ],
            options: [
              [
                "С задачи и наблюдений",
                "With the problem and observations",
                "Міндет пен байқаулардан",
              ],
              [
                "Со случайных эффектов",
                "With random effects",
                "Кездейсоқ әсерлерден",
              ],
              [
                "С неподтверждённых обещаний",
                "With unverified promises",
                "Расталмаған уәделерден",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
    ],
  },
  {
    id: "portfolio",
    title: [
      "Портфолио и карьера",
      "Portfolio and career",
      "Портфолио және мансап",
    ],
    lessons: [
      {
        id: "pf-1",
        title: ["Отбор работ", "Selecting work", "Жұмыстарды іріктеу"],
        body: [
          "Покажите 3–5 сильных релевантных проектов вместо всех работ. Сильнейший поставьте первым и честно укажите свою роль в командном проекте.",
          "Show 3–5 strong relevant projects rather than everything. Lead with the strongest and clearly state your role in team work.",
          "Барлық жұмыстың орнына 3–5 мықты әрі сәйкес жобаны көрсетіңіз. Ең мықтысын бірінші қойып, топтық жобадағы рөліңізді нақты жазыңыз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Отбор работ». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Selecting work”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Жұмыстарды іріктеу» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 15,
        questions: [
          {
            q: [
              "Какую работу показать первой?",
              "Which work should lead?",
              "Қай жұмысты бірінші көрсеткен дұрыс?",
            ],
            options: [
              [
                "Самую сильную и релевантную",
                "The strongest relevant work",
                "Ең мықты және сәйкес жұмыс",
              ],
              ["Самую старую", "The oldest", "Ең ескі"],
              ["Случайную", "A random one", "Кездейсоқ"],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "pf-2",
        title: ["Кейс", "Case study", "Кейс"],
        body: [
          "Покажите задачу, ограничения, решения и результат. Включите промежуточные варианты с объяснением выбора, а не только финальную картинку.",
          "Show the problem, constraints, decisions and result. Include intermediate options with reasoning, not just the final image.",
          "Міндет, шектеу, шешім мен нәтижені көрсетіңіз. Соңғы суретпен қатар аралық нұсқалар мен таңдау себебін қосыңыз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Кейс». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Case study”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Кейс» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 18,
        questions: [
          {
            q: [
              "Что включить в кейс кроме финала?",
              "What belongs in a case study besides the final?",
              "Кейсте соңғы нәтижеден басқа не болуы керек?",
            ],
            options: [
              [
                "Ограничения, процесс и логику выбора",
                "Constraints, process and reasoning",
                "Шектеулер, процесс және таңдау себебі",
              ],
              [
                "Только цену программы",
                "Only software price",
                "Тек бағдарлама бағасы",
              ],
              [
                "Чужую работу без авторства",
                "Uncredited work by someone else",
                "Авторсыз бөтен жұмыс",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "pf-3",
        title: ["Обратная связь", "Feedback", "Кері байланыс"],
        body: [
          "Дайте незнакомому человеку минуту на просмотр. Попросите объяснить вашу специализацию и вклад; исправьте места, где смысл потерялся.",
          "Give a new viewer one minute. Ask them to explain your specialty and contribution; fix where meaning was lost.",
          "Бейтаныс адамға бір минут қарауға беріңіз. Мамандығыңыз бен үлесіңізді түсіндіруін сұрап, түсініксіз тұстарды түзетіңіз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Обратная связь». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Feedback”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Кері байланыс» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 21,
        questions: [
          {
            q: [
              "Как проверить понятность портфолио?",
              "How can you test portfolio clarity?",
              "Портфолио түсініктілігін қалай тексеруге болады?",
            ],
            options: [
              [
                "Попросить нового зрителя объяснить вашу роль",
                "Ask a new viewer to explain your role",
                "Жаңа көрерменнен рөліңізді түсіндіруді сұрау",
              ],
              [
                "Не показывать никому",
                "Never show anyone",
                "Ешкімге көрсетпеу",
              ],
              [
                "Скрыть описание проектов",
                "Hide project descriptions",
                "Жоба сипаттамасын жасыру",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "pf-4",
        title: ["Публикация", "Publishing", "Жариялау"],
        body: [
          "Проверьте мобильную версию, публичную ссылку без входа и права на материалы. Обновляйте подборку после сильных новых работ.",
          "Test mobile layout, the public link while signed out, and rights to materials. Update the selection when stronger work is ready.",
          "Мобильді нұсқаны, жүйеге кірмей ашылатын сілтемені және материал құқығын тексеріңіз. Жаңа мықты жұмыс дайын болғанда жинақты жаңартыңыз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Публикация». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Publishing”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Жариялау» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 24,
        questions: [
          {
            q: [
              "Как проверить публичную ссылку?",
              "How do you test a public link?",
              "Ашық сілтемені қалай тексереді?",
            ],
            options: [
              [
                "Открыть без авторизации",
                "Open while signed out",
                "Жүйеге кірмей ашу",
              ],
              [
                "Открыть только в своём аккаунте",
                "Open only in your own account",
                "Тек өз аккаунтында ашу",
              ],
              [
                "Проверить только цвет кнопки",
                "Check only the button color",
                "Тек батырма түсін тексеру",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
    ],
  },
  {
    id: "image",
    title: ["Обработка изображений", "Image editing", "Сурет өңдеу"],
    lessons: [
      {
        id: "img-1",
        title: [
          "Неразрушающая обработка",
          "Non-destructive editing",
          "Бұзбай өңдеу",
        ],
        body: [
          "Сохраняйте оригинал и настройки отдельно. Коррекцию яркости делайте до творческого тонирования; регулярно сравнивайте с исходником.",
          "Keep the original and settings separately. Correct brightness before creative grading and compare with the source regularly.",
          "Түпнұсқа мен баптауды бөлек сақтаңыз. Шығармашылық реңк алдында жарықтықты түзетіп, бастапқымен салыстырыңыз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Неразрушающая обработка». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Non-destructive editing”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Бұзбай өңдеу» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 15,
        questions: [
          {
            q: [
              "Как сохранить возможность вернуться к оригиналу?",
              "How do you preserve the original?",
              "Түпнұсқаға қайту мүмкіндігін қалай сақтайды?",
            ],
            options: [
              [
                "Хранить исходник и настройки отдельно",
                "Keep source and settings separately",
                "Түпнұсқа мен баптауды бөлек сақтау",
              ],
              [
                "Перезаписывать единственный файл",
                "Overwrite the only file",
                "Жалғыз файлды қайта жазу",
              ],
              [
                "Удалять исходник после каждого шага",
                "Delete source after each step",
                "Әр қадамнан соң түпнұсқаны жою",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "img-2",
        title: ["Кадрирование", "Cropping", "Қиып алу"],
        body: [
          "Выбирайте соотношение сторон под место публикации. Не обрезайте важные детали и проверяйте визуальный баланс после изменения кадра.",
          "Choose aspect ratio for the destination. Keep important details and recheck balance after cropping.",
          "Жариялау орнына сай арақатынасты таңдаңыз. Маңызды детальдарды қимай, кадр өзгерген соң тепе-теңдікті тексеріңіз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Кадрирование». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Cropping”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Қиып алу» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 18,
        questions: [
          {
            q: [
              "Что определяет соотношение сторон?",
              "What should determine aspect ratio?",
              "Жақтар арақатынасын не анықтайды?",
            ],
            options: [
              [
                "Место публикации и композиция",
                "Destination and composition",
                "Жариялау орны мен композиция",
              ],
              ["Только имя файла", "Only the filename", "Тек файл атауы"],
              ["Размер оперативной памяти", "RAM capacity", "Жедел жад көлемі"],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "img-3",
        title: ["Цветокоррекция", "Color correction", "Түсті түзету"],
        body: [
          "Яркость меняет светлоту, контраст — различие тонов, насыщенность — интенсивность цвета. Избегайте потери деталей в светах и тенях.",
          "Brightness changes lightness, contrast separates tones and saturation changes color intensity. Avoid losing highlight and shadow detail.",
          "Жарықтық ашықтықты, контраст реңк айырмасын, қанықтық түс қарқындылығын өзгертеді. Жарық пен көлеңке деталін сақтаңыз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Цветокоррекция». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Color correction”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Түсті түзету» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 21,
        questions: [
          {
            q: [
              "Что меняет насыщенность?",
              "What does saturation change?",
              "Қанықтық нені өзгертеді?",
            ],
            options: [
              ["Интенсивность цвета", "Color intensity", "Түс қарқындылығын"],
              ["Число пикселей", "Pixel count", "Пиксель санын"],
              ["Длительность клипа", "Clip duration", "Клип ұзақтығын"],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
    ],
  },
  {
    id: "video",
    title: ["Видеомонтаж", "Video editing", "Бейнемонтаж"],
    lessons: [
      {
        id: "vid-1",
        title: ["История и отбор", "Story and selects", "Оқиға және іріктеу"],
        body: [
          "Сформулируйте историю одним предложением. Отберите только кадры, которые двигают её вперёд; сначала соберите черновой монтаж без эффектов.",
          "State the story in one sentence. Select only shots that advance it and build a rough cut without effects first.",
          "Оқиғаны бір сөйлеммен жазыңыз. Оны дамытатын кадрларды ғана таңдап, алдымен әсерсіз бастапқы монтаж жинаңыз.",
        ],
        task: [
          "Создайте небольшой проект по теме «История и отбор». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Story and selects”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Оқиға және іріктеу» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 15,
        questions: [
          {
            q: [
              "С чего начать монтаж истории?",
              "Where should story editing start?",
              "Оқиға монтажы неден басталады?",
            ],
            options: [
              [
                "С отбора кадров под одну главную мысль",
                "Select shots around one central idea",
                "Бір негізгі ойға сай кадр іріктеуден",
              ],
              [
                "С покупки переходов",
                "Buy transitions first",
                "Өтулерді сатып алудан",
              ],
              [
                "С экспорта пустого проекта",
                "Export an empty project",
                "Бос жобаны экспорттаудан",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "vid-2",
        title: ["Обрезка и ритм", "Trimming and rhythm", "Қию және ырғақ"],
        body: [
          "Точки входа и выхода определяют длину клипа. Режьте на осмысленном действии, чередуйте крупность и проверяйте непрерывность направления.",
          "In and out points define clip length. Cut on meaningful action, vary shot size and preserve direction continuity.",
          "Кіру және шығу нүктелері клип ұзақтығын анықтайды. Мағыналы әрекетте қиып, план ірілігін өзгертіп, бағыттың жалғастығын сақтаңыз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Обрезка и ритм». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Trimming and rhythm”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Қию және ырғақ» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 18,
        questions: [
          {
            q: [
              "Что задают точки In и Out?",
              "What do In and Out points define?",
              "In және Out нүктелері нені анықтайды?",
            ],
            options: [
              [
                "Начало и конец используемого фрагмента",
                "Start and end of the selected excerpt",
                "Қолданылатын үзіндінің басы мен соңы",
              ],
              ["Цвет фона", "Background color", "Фон түсін"],
              [
                "Число аудиоканалов",
                "Audio channel count",
                "Дыбыс арнасының санын",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "vid-3",
        title: ["Звук и экспорт", "Audio and export", "Дыбыс және экспорт"],
        body: [
          "Выровняйте громкость речи и избегайте перегруза. Просмотрите экспорт целиком; убедитесь, что формат поддерживается площадкой и исходники сохранены.",
          "Balance speech loudness and avoid clipping. Watch the full export, check destination format support and keep source files.",
          "Сөйлеу дыбысын теңестіріп, бұрмаланудан сақтаныңыз. Экспортты толық қарап, платформаның форматты қолдауын тексеріп, түпнұсқаларды сақтаңыз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Звук и экспорт». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Audio and export”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Дыбыс және экспорт» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 21,
        questions: [
          {
            q: [
              "Что проверить после экспорта?",
              "What should you check after export?",
              "Экспорттан кейін нені тексеру керек?",
            ],
            options: [
              [
                "Видео целиком, звук и совместимость формата",
                "Full playback, audio and format compatibility",
                "Толық бейне, дыбыс және пішім үйлесімділігін",
              ],
              ["Только название файла", "Only the filename", "Тек файл атауын"],
              [
                "Только первый кадр",
                "Only the first frame",
                "Тек алғашқы кадрды",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
    ],
  },
  {
    id: "ux",
    title: ["UX и продукт", "UX and product", "UX және өнім"],
    lessons: [
      {
        id: "ux-1",
        title: [
          "Пользовательский сценарий",
          "User journey",
          "Пайдаланушы сценарийі",
        ],
        body: [
          "Опишите конкретную цель пользователя и шаги к ней. Включите состояния загрузки, пустые данные, ошибку и успешное завершение.",
          "Describe a specific user goal and steps to achieve it. Include loading, empty, error and success states.",
          "Нақты пайдаланушы мақсаты мен оған жету қадамдарын жазыңыз. Жүктелу, бос дерек, қате және сәтті аяқталу күйлерін қосыңыз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Пользовательский сценарий». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “User journey”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Пайдаланушы сценарийі» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 15,
        questions: [
          {
            q: [
              "Какие состояния нужны в сценарии?",
              "Which states belong in a user journey?",
              "Сценарийге қандай күйлер қажет?",
            ],
            options: [
              [
                "Загрузка, пустые данные, ошибка и успех",
                "Loading, empty, error and success",
                "Жүктелу, бос дерек, қате және сәттілік",
              ],
              [
                "Только идеальный успешный путь",
                "Only the ideal success path",
                "Тек мінсіз сәтті жол",
              ],
              ["Только анимация", "Only animation", "Тек анимация"],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "ux-2",
        title: ["Прототип", "Prototype", "Прототип"],
        body: [
          "Начните с простой схемы без декора. Проверьте основной путь с человеком, не объясняя, куда нажимать; запишите затруднения.",
          "Start with a simple undecorated wireframe. Test the main path without telling the participant where to click and record friction.",
          "Безендірусіз қарапайым сызбадан бастаңыз. Қайда басуды айтпай негізгі жолды адаммен тексеріп, қиындықтарды жазыңыз.",
        ],
        task: [
          "Создайте небольшой проект по теме «Прототип». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Prototype”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Прототип» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 18,
        questions: [
          {
            q: [
              "Как проводить тест прототипа?",
              "How should you test a prototype?",
              "Прототипті қалай тексереді?",
            ],
            options: [
              [
                "Наблюдать, не подсказывая кнопки",
                "Observe without prompting clicks",
                "Батырманы айтпай бақылау",
              ],
              [
                "Нажимать за пользователя",
                "Click for the user",
                "Пайдаланушы орнына басу",
              ],
              [
                "Показывать только дизайнеру",
                "Show only the designer",
                "Тек дизайнерге көрсету",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "ux-3",
        title: ["Доступный интерфейс", "Accessible UI", "Қолжетімді интерфейс"],
        body: [
          "Используйте семантические кнопки, видимый фокус и подписи полей. Все основные действия должны работать с клавиатуры и без различения цвета.",
          "Use semantic buttons, visible focus and field labels. Core actions must work with a keyboard and without distinguishing color.",
          "Мағыналық батырма, көрінетін фокус және өріс белгілерін қолданыңыз. Негізгі әрекеттер пернетақтамен және түсті ажыратусыз жұмыс істеуі тиіс.",
        ],
        task: [
          "Создайте небольшой проект по теме «Доступный интерфейс». Сделайте два варианта, сравните их по принципу урока и запишите, почему выбрали итоговый. Сохраните исходник и экспорт.",
          "Create a small project on “Accessible UI”. Make two variations, compare them using the lesson principle and explain your final choice. Save the editable source and an export.",
          "«Қолжетімді интерфейс» тақырыбына шағын жоба жасаңыз. Екі нұсқаны сабақ қағидасымен салыстырып, соңғы таңдауды түсіндіріңіз. Өңделетін түпнұсқа мен экспортты сақтаңыз.",
        ],
        minutes: 21,
        questions: [
          {
            q: [
              "Что делает действие доступным с клавиатуры?",
              "What makes an action keyboard-accessible?",
              "Әрекетті пернетақтаға қолжетімді не етеді?",
            ],
            options: [
              [
                "Семантическая кнопка с видимым фокусом",
                "A semantic button with visible focus",
                "Көрінетін фокусы бар мағыналық батырма",
              ],
              [
                "Только цветная картинка",
                "Only a colored picture",
                "Тек түрлі түсті сурет",
              ],
              [
                "Скрытый интерактивный div без фокуса",
                "An unfocusable interactive div",
                "Фокуссыз интерактивті div",
              ],
            ],
            answer: 0,
          },
          {
            q: [
              "Что сдавать для самостоятельной проверки?",
              "What should you submit for self-review?",
              "Өзіндік тексеруге не тапсыру керек?",
            ],
            options: [
              [
                "Только название проекта.",
                "Only a project title.",
                "Тек жоба атауы.",
              ],
              [
                "Исходник, экспорт и объяснение выбора между двумя вариантами.",
                "The source, export and reasoning comparing two versions.",
                "Түпнұсқа, экспорт және екі нұсқаны таңдау түсіндірмесі.",
              ],
              [
                "Случайный чужой пример без указания автора.",
                "An unrelated example without attribution.",
                "Авторсыз кездейсоқ бөгде мысал.",
              ],
            ],
            answer: 1,
          },
        ],
      },
    ],
  },
];
export const lessonMap = new Map(
  curriculum.flatMap((c) =>
    c.lessons.map((l) => [l.id, { ...l, courseId: c.id }] as const),
  ),
);
