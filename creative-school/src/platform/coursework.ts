import { L } from "./locale";
export const coursework = {
  "visual-basics": {
    brief: L(
      "Серия из трёх афиш для одного события: квадрат, вертикаль и горизонталь.",
      "A series of three posters for one event: square, portrait and landscape.",
      "Бір іс-шараға үш афиша: шаршы, тік және көлденең.",
    ),
    criteria: [
      L(
        "Событие, дата и действие различимы за 5 секунд.",
        "Event, date and action are readable within 5 seconds.",
        "Іс-шара, күн және әрекет 5 секундта түсінікті.",
      ),
      L(
        "Одна сетка и не более двух гарнитур.",
        "One grid and at most two typefaces.",
        "Бір тор және ең көбі екі қаріп.",
      ),
      L(
        "Контраст основного текста не ниже 4.5:1.",
        "Body text contrast is at least 4.5:1.",
        "Негізгі мәтін контрасты кемінде 4.5:1.",
      ),
    ],
  },
  "3d-basics": {
    brief: L(
      "Соберите предметную сцену из 5–12 примитивов: главный объект, окружение и свет.",
      "Build a product scene from 5–12 primitives: focal object, surroundings and lighting.",
      "5–12 примитивтен заттық сахна жасаңыз: негізгі нысан, орта және жарық.",
    ),
    criteria: [
      L(
        "Силуэт узнаваем без материалов.",
        "Silhouette is recognizable without materials.",
        "Силуэт материалсыз танылады.",
      ),
      L(
        "Нет случайных пересечений и зависших объектов.",
        "No accidental intersections or floating objects.",
        "Кездейсоқ қиылысу мен қалқып тұрған нысан жоқ.",
      ),
      L(
        "Сохранены JSON, GLB и два ракурса PNG.",
        "JSON, GLB and two PNG views are saved.",
        "JSON, GLB және екі PNG көрінісі сақталған.",
      ),
    ],
  },
  "motion-basics": {
    brief: L(
      "Разработайте 6 кадров раскадровки заставки длительностью 5–8 секунд.",
      "Develop a six-panel storyboard for a 5–8 second title sequence.",
      "5–8 секундтық кіріспеге алты кадрлық жоспар жасаңыз.",
    ),
    criteria: [
      L(
        "Для каждого кадра указаны действие и длительность.",
        "Each panel specifies action and duration.",
        "Әр кадрда әрекет пен ұзақтық көрсетілген.",
      ),
      L(
        "Есть ускорение, остановка и время чтения.",
        "Includes acceleration, a pause and reading time.",
        "Үдеу, тоқтау және оқу уақыты бар.",
      ),
      L(
        "Первый и последний кадры читаются отдельно.",
        "First and last frames work independently.",
        "Алғашқы және соңғы кадр жеке түсінікті.",
      ),
    ],
  },
  "art-direction": {
    brief: L(
      "Подготовьте два визуальных направления для локального культурного события.",
      "Prepare two visual directions for a local cultural event.",
      "Жергілікті мәдени іс-шараға екі визуалды бағыт дайындаңыз.",
    ),
    criteria: [
      L(
        "Описаны аудитория, задача и ограничения.",
        "Audience, goal and constraints are documented.",
        "Аудитория, міндет пен шектеу жазылған.",
      ),
      L(
        "Для каждого направления есть мудборд и стилевой кадр.",
        "Each direction includes a moodboard and styleframe.",
        "Әр бағытта мудборд пен стиль кадры бар.",
      ),
      L(
        "Выбор направления обоснован критериями брифа.",
        "The chosen direction is justified against the brief.",
        "Бағыт таңдауы бриф өлшемдерімен негізделген.",
      ),
    ],
  },
  portfolio: {
    brief: L(
      "Опубликуйте три кейса и проверьте портфолио с человеком, который вас не знает.",
      "Publish three case studies and test the portfolio with someone new.",
      "Үш кейс жариялап, портфолионы сізді танымайтын адаммен тексеріңіз.",
    ),
    criteria: [
      L(
        "В каждом кейсе указаны задача, ваша роль, процесс и результат.",
        "Every case states the problem, your role, process and outcome.",
        "Әр кейсте міндет, рөліңіз, процесс пен нәтиже бар.",
      ),
      L(
        "Публичная ссылка работает без входа.",
        "Public link works while signed out.",
        "Ашық сілтеме жүйеге кірусіз жұмыс істейді.",
      ),
      L(
        "Материалы используются с разрешения.",
        "All materials are used with permission.",
        "Барлық материал рұқсатпен қолданылған.",
      ),
    ],
  },
  image: {
    brief: L(
      "Подготовьте одну фотографию для обложки 16:9 и публикации 1:1.",
      "Prepare one photograph for a 16:9 cover and a 1:1 post.",
      "Бір суретті 16:9 мұқаба мен 1:1 жарияланымға дайындаңыз.",
    ),
    criteria: [
      L(
        "Оригинал сохранён отдельно от результата.",
        "Original is kept separately from the result.",
        "Түпнұсқа нәтижеден бөлек сақталған.",
      ),
      L(
        "В светах и тенях видны детали.",
        "Highlight and shadow details are preserved.",
        "Жарық пен көлеңке детальдары сақталған.",
      ),
      L(
        "Представлены сравнение до/после и два PNG.",
        "Includes before/after comparison and two PNG files.",
        "Бұрын/кейін салыстыруы мен екі PNG бар.",
      ),
    ],
  },
  video: {
    brief: L(
      "Смонтируйте историю 20–40 секунд из 4–8 клипов с титром и звуком.",
      "Edit a 20–40 second story from 4–8 clips with a title and audio.",
      "4–8 клиптен титр мен дыбысы бар 20–40 секундтық оқиға жасаңыз.",
    ),
    criteria: [
      L(
        "Начало, развитие и завершение понятны без объяснения.",
        "Opening, development and ending are clear without explanation.",
        "Басы, дамуы мен аяқталуы түсіндірусіз түсінікті.",
      ),
      L(
        "Переходы осмысленны, речь не заглушена музыкой.",
        "Cuts are intentional and music does not mask speech.",
        "Қиылысулар мағыналы, музыка сөйлеуді баспайды.",
      ),
      L(
        "WebM просмотрен целиком после экспорта.",
        "The full WebM export has been reviewed.",
        "Экспортталған WebM толық қаралған.",
      ),
    ],
  },
  ux: {
    brief: L(
      "Создайте прототип регистрации на творческий мастер-класс из пяти экранов.",
      "Create a five-screen prototype for registering for a creative workshop.",
      "Шығармашылық шеберлік сабағына тіркелудің бес экрандық прототипін жасаңыз.",
    ),
    criteria: [
      L(
        "Есть пустое состояние, ошибка и подтверждение.",
        "Includes empty, error and confirmation states.",
        "Бос, қате және растау күйлері бар.",
      ),
      L(
        "У полей есть подписи, у действий — видимый фокус.",
        "Fields have labels and actions have visible focus.",
        "Өрістерде белгі, әрекеттерде көрінетін фокус бар.",
      ),
      L(
        "Проверено с двумя людьми без подсказок.",
        "Tested with two people without prompting.",
        "Екі адаммен көмексіз тексерілген.",
      ),
    ],
  },
} as const;
