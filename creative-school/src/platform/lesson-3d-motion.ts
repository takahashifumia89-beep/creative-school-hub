import type { LessonMaterial, LessonSource } from "./lesson-types";
import { M, T, Q } from "./lesson-builder";
const S = {
  primitives: {
    title: "Mesh Primitives",
    url: "https://docs.blender.org/manual/en/latest/modeling/meshes/primitives.html",
    publisher: "Blender Manual",
  },
  modeling: {
    title: "Introduction to Modeling",
    url: "https://docs.blender.org/manual/en/latest/modeling/introduction.html",
    publisher: "Blender Manual",
  },
  camera: {
    title: "Cameras",
    url: "https://docs.blender.org/manual/en/latest/render/cameras.html",
    publisher: "Blender Manual",
  },
  material: {
    title: "Principled BSDF",
    url: "https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/principled.html",
    publisher: "Blender Manual",
  },
  light: {
    title: "Light Objects",
    url: "https://docs.blender.org/manual/en/latest/render/lights/light_object.html",
    publisher: "Blender Manual",
  },
  output: {
    title: "Output",
    url: "https://docs.blender.org/manual/en/latest/render/output/properties/output.html",
    publisher: "Blender Manual",
  },
  keys: {
    title: "Keyframes — Introduction",
    url: "https://docs.blender.org/manual/en/latest/animation/keyframes/introduction.html",
    publisher: "Blender Manual",
  },
  curves: {
    title: "F-Curves — Introduction",
    url: "https://docs.blender.org/manual/en/latest/editors/graph_editor/fcurves/introduction.html",
    publisher: "Blender Manual",
  },
  animation: {
    title: "Animation Fundamentals — course overview",
    url: "https://studio.blender.org/training/animation-fundamentals/",
    publisher: "Blender Studio",
  },
  storyboard: {
    title: "How to get started on storyboarding",
    url: "https://www.adobe.com/creativecloud/video/discover/storyboarding.html",
    publisher: "Adobe",
  },
} satisfies Record<string, LessonSource>;
export const modelMotionLessons: Record<string, LessonMaterial> = {
  "b3d-1": M({
    goal: T(
      "Разложить предмет на крупные объёмы и проверить пропорции по силуэту.",
      "Decompose an object into major volumes and verify proportions through silhouette.",
      "Затты негізгі көлемдерге бөліп, пропорциясын силуэт арқылы тексеру.",
    ),
    principle: T(
      "Блокинг — черновая модель, которая проверяет отношения размеров до детализации. Найдите высоту, ширину и глубину по переднему и боковому видам; запишите отношения, например корпус вдвое шире крышки. Куб описывает плоские грани, цилиндр — ось и круглое сечение, сфера — непрерывный объём. Полигональная поверхность состоит из вершин, рёбер и граней; больше полигонов не исправят неверные крупные пропорции.",
      "A blockout tests size relationships before detail. Identify height, width and depth from front and side views; record ratios such as a body twice the lid width. A box describes planar faces, a cylinder an axis and circular section, and a sphere a continuous volume. Polygon surfaces contain vertices, edges and faces; more polygons will not repair incorrect major proportions.",
      "Бастапқы пішін детальға дейін өлшем қатынасын тексереді. Алдыңғы және бүйір көріністен биіктік, ен, тереңдікті тауып, мысалы денесі қақпағынан екі есе кең деп жазыңыз. Текше жазық жақтарды, цилиндр ось пен дөңгелек қиманы, шар жұмсақ көлемді береді. Полигон беті төбе, қыр және жақтан тұрады; полигонды көбейту ірі пропорция қатесін түземейді.",
    ),
    method: T(
      "Силуэт — внешний контур с выбранной точки. Проверьте один тёмный цвет и уменьшенный кадр: ручка не должна сливаться с корпусом. Перемещение, вращение и масштаб меняют разные свойства. Сохраняйте вариант до крупной правки и меняйте один параметр за раз, чтобы понимать причину улучшения.",
      "Silhouette is the outline from a chosen viewpoint. Test one dark color and a small image: a handle must remain distinct from its body. Translation, rotation and scale change different properties. Save a version before major edits and vary one parameter at a time to identify what improves the form.",
      "Силуэт — таңдалған нүктеден көрінетін сыртқы контур. Бір қара түспен, шағын кадрда тексеріңіз: тұтқа денемен бірігіп кетпесін. Жылжыту, бұру және масштаб бөлек қасиеттерді өзгертеді. Ірі түзетуден бұрын нұсқа сақтап, жақсару себебін білу үшін бір параметрді өзгертіңіз.",
    ),
    example: T(
      "Настольная лампа из шести простых объёмов.",
      "A desk lamp from six simple volumes.",
      "Алты қарапайым көлемнен үстел шамы.",
    ),
    steps: [
      T(
        "Задайте высоту 4 единицы; основание шириной 2 и высотой 0.3.",
        "Set height to 4 units; make the base 2 wide and 0.3 high.",
        "Биіктікті 4 бірлік, табан енін 2, биіктігін 0.3 етіңіз.",
      ),
      T(
        "Добавьте две стойки, шарнир и абажур, проверяя соединения.",
        "Add two arms, a joint and shade, checking connections.",
        "Екі тірек, топса және қалпақ қосып, байланысын тексеріңіз.",
      ),
      T(
        "Уберите различие материалов и выберите вид, где части не сливаются.",
        "Remove material differences and choose a view with separated parts.",
        "Материал айырмасын алып, бөлшектері бірігіп кетпейтін көріністі таңдаңыз.",
      ),
    ],
    result: T(
      "Лампа узнаётся без мелких кнопок и текстур.",
      "The lamp reads without small buttons or textures.",
      "Шам ұсақ батырма мен текстурасыз танылады.",
    ),
    practice: T(
      "Соберите чайник или лампу из 5–9 примитивов.",
      "Build a kettle or lamp from 5–9 primitives.",
      "5–9 примитивтен шәйнек не шам жасаңыз.",
    ),
    actions: [
      T(
        "Запишите три отношения размеров по референсу.",
        "Record three size ratios from the reference.",
        "Референстен үш өлшем қатынасын жазыңыз.",
      ),
      T(
        "Сравните передний и боковой виды одной модели.",
        "Compare front and side views of one model.",
        "Бір модельдің алдыңғы және бүйір көрінісін салыстырыңыз.",
      ),
      T(
        "Сделайте второй вариант с одной изменённой пропорцией.",
        "Make a second version changing one proportion.",
        "Бір пропорциясы өзгерген екінші нұсқа жасаңыз.",
      ),
    ],
    deliverable: T(
      "Редактируемый JSON, два PNG силуэта и объяснение выбора варианта.",
      "Editable JSON, two silhouette PNGs and reasoning for the chosen version.",
      "Өңделетін JSON, екі силуэт PNG және нұсқа таңдауының түсіндірмесі.",
    ),
    checks: [
      T(
        "Предмет узнаваем без бликов.",
        "The object reads without highlights.",
        "Зат жарқылсыз танылады.",
      ),
      T(
        "Пропорции проверены с двух сторон.",
        "Proportions are checked from two sides.",
        "Пропорция екі жақтан тексерілген.",
      ),
      T(
        "Важные части не сливаются.",
        "Important parts remain distinct.",
        "Маңызды бөліктер бірігіп кетпейді.",
      ),
    ],
    questions: [
      Q(
        T(
          "Что исправить первым, если модель не похожа на предмет?",
          "What should you correct first if the model misses the object?",
          "Модель затқа ұқсамаса, алдымен нені түзету керек?",
        ),
        [
          T("Добавить полигонов", "Add polygons", "Полигон қосу"),
          T(
            "Сверить крупные пропорции",
            "Check major proportions",
            "Негізгі пропорцияны тексеру",
          ),
          T("Увеличить блеск", "Increase gloss", "Жылтырды арттыру"),
        ],
        1,
        T(
          "Детализация не исправляет неверный общий объём.",
          "Detail cannot repair incorrect overall volume.",
          "Деталь қате жалпы көлемді түземейді.",
        ),
      ),
      Q(
        T(
          "Как проверить силуэт?",
          "How do you inspect silhouette?",
          "Силуэтті қалай тексереді?",
        ),
        [
          T(
            "Одним цветом в маленьком размере",
            "One color at a small size",
            "Бір түспен шағын өлшемде",
          ),
          T("Только по текстуре", "Only by texture", "Тек текстурамен"),
          T("Спрятав контур", "By hiding the outline", "Контурды жасырып"),
        ],
        0,
        T(
          "Так видны контур и разделение частей, а не шейдинг.",
          "This reveals contour and separation rather than shading.",
          "Бұл шейдингті емес, контур мен бөлінуін көрсетеді.",
        ),
      ),
      Q(
        T("Вращение меняет…", "Rotation changes…", "Бұру нені өзгертеді?"),
        [
          T("Число граней", "Face count", "Жақ санын"),
          T("Цвет", "Color", "Түсті"),
          T(
            "Ориентацию в пространстве",
            "Orientation in space",
            "Кеңістіктегі бағытты",
          ),
        ],
        2,
        T(
          "Ориентация, положение и размер — разные свойства.",
          "Orientation, position and size are different properties.",
          "Бағыт, орын және өлшем — бөлек қасиеттер.",
        ),
      ),
    ],
    sources: [S.primitives, S.modeling],
    minutes: 40,
  }),
  "b3d-2": M({
    goal: T(
      "Выбрать главный объект, ракурс и осмысленное свободное пространство.",
      "Choose a focal object, viewpoint and purposeful negative space.",
      "Негізгі нысан, ракурс және мағыналы бос кеңістікті таңдау.",
    ),
    principle: T(
      "Начните с намерения: зритель должен заметить форму продукта, функцию или настроение? Иерархию создают размер, положение, контраст и пустота. Фон и вторичный предмет должны поддерживать главный объект или объяснять масштаб. Удаляйте детали по одной: если смысл не меняется, возможно, они лишние.",
      "Start with intent: should the viewer notice product form, function or mood? Size, placement, contrast and empty space establish hierarchy. Background and secondary props should support the subject or explain scale. Remove details one at a time: if the message survives, they may be unnecessary.",
      "Ниеттен бастаңыз: көрермен өнім пішінін, қызметін не көңіл күйін байқауы керек пе? Өлшем, орналасу, контраст пен бос орын иерархия жасайды. Фон мен қосымша зат негізгі нысанды қолдауы не масштабты түсіндіруі тиіс. Детальды бір-бірлеп алыңыз: мағына өзгермесе, ол артық болуы мүмкін.",
    ),
    method: T(
      "В перспективе далёкие предметы выглядят меньше, а ортографическая проекция не уменьшает их с расстоянием. Последняя помогает сравнивать пропорции, но не исправляет модель автоматически. Избегайте касаний, когда край чашки точно совпадает с краем подставки: разведите контуры или сделайте явное перекрытие. Проверяйте кадр миниатюрой.",
      "Perspective makes distant objects appear smaller; orthographic projection does not shrink them with distance. Orthographic views aid proportion checks but do not correct a model automatically. Avoid tangencies where a cup edge exactly matches a stand edge: separate contours or create clear overlap. Review a thumbnail.",
      "Перспективада алыстағы зат кішірейеді, ортографиялық проекцияда қашықтық өлшемді азайтпайды. Ортографиялық көрініс пропорцияны тексереді, бірақ модельді автоматты түземейді. Кесе жиегі тұғыр жиегімен дәл келетін жанасудан сақтаныңыз: ажыратыңыз не анық қабаттастырыңыз. Шағын кадрда тексеріңіз.",
    ),
    example: T(
      "Чашка на подставке для карточки товара.",
      "A cup on a stand for a product card.",
      "Тауар карточкасына тұғырдағы кесе.",
    ),
    steps: [
      T(
        "Сместите чашку от центра, оставив место перед ручкой.",
        "Offset the cup, leaving space in front of the handle.",
        "Кесені орталықтан ығыстырып, тұтқа алдында орын қалдырыңыз.",
      ),
      T(
        "Добавьте один менее контрастный предмет для масштаба.",
        "Add one lower-contrast prop for scale.",
        "Масштабқа контрасты төмен бір зат қосыңыз.",
      ),
      T(
        "Сравните три ракурса и уберите неоднозначные касания.",
        "Compare three views and remove ambiguous tangencies.",
        "Үш ракурсты салыстырып, түсініксіз жанасуды жойыңыз.",
      ),
    ],
    result: T(
      "Форма чашки понятна до разглядывания деталей.",
      "The cup form is clear before inspecting detail.",
      "Кесе пішіні детальға үңілмей-ақ түсінікті.",
    ),
    practice: T(
      "Сделайте симметричную, диагональную и свободную композиции одной сцены.",
      "Make symmetrical, diagonal and spacious compositions of one scene.",
      "Бір сахнаға симметриялы, диагональды және кең композиция жасаңыз.",
    ),
    actions: [
      T(
        "Сохраните одинаковые материалы и состав объектов.",
        "Keep materials and object set fixed.",
        "Материал мен нысан құрамын өзгертпеңіз.",
      ),
      T(
        "Меняйте только расположение и ракурс.",
        "Change only placement and viewpoint.",
        "Тек орналасу мен ракурсты өзгертіңіз.",
      ),
      T(
        "Уменьшите изображения и запишите, что замечается первым.",
        "Reduce images and record what is noticed first.",
        "Суретті кішірейтіп, бірінші байқалатынды жазыңыз.",
      ),
    ],
    deliverable: T(
      "Три PNG и сцена с именами объектов.",
      "Three PNGs and a scene with named objects.",
      "Үш PNG және нысандары аталған сахна.",
    ),
    checks: [
      T(
        "Главный объект виден первым.",
        "The focal object is noticed first.",
        "Негізгі нысан бірінші байқалады.",
      ),
      T(
        "Важные формы не перекрыты.",
        "Important forms remain visible.",
        "Маңызды пішін жабылмаған.",
      ),
      T(
        "Касания контуров исправлены.",
        "Outline tangencies are resolved.",
        "Контур жанасуы түзетілген.",
      ),
    ],
    questions: [
      Q(
        T(
          "Что отличает ортографический вид?",
          "What distinguishes orthographic projection?",
          "Ортографиялық проекция несімен ерекшеленеді?",
        ),
        [
          T(
            "Удалённые предметы уменьшаются",
            "Distant subjects shrink",
            "Алыс зат кішірейеді",
          ),
          T(
            "Размер не уменьшается из-за расстояния",
            "Size does not shrink with distance",
            "Өлшем қашықтықтан кішіреймейді",
          ),
          T(
            "Автоматически меняются пропорции",
            "Proportions are corrected automatically",
            "Пропорция автоматты түзетіледі",
          ),
        ],
        1,
        T(
          "Проекция убирает перспективное уменьшение, а не ошибки модели.",
          "Projection removes perspective size reduction, not modeling errors.",
          "Проекция модель қатесін емес, перспективалық кішіреюді жояды.",
        ),
      ),
      Q(
        T(
          "Как убрать случайное касание краёв?",
          "How do you fix accidental edge tangency?",
          "Жиектің кездейсоқ жанасуын қалай түзетеді?",
        ),
        [
          T(
            "Развести или явно перекрыть контуры",
            "Separate or clearly overlap outlines",
            "Контурды ажырату не анық қабаттастыру",
          ),
          T("Добавить текстуру", "Add texture", "Текстура қосу"),
          T("Увеличить PNG", "Increase PNG size", "PNG өлшемін арттыру"),
        ],
        0,
        T(
          "Это пространственная неоднозначность, а не дефект разрешения.",
          "This is spatial ambiguity, not a resolution defect.",
          "Бұл ажыратымдылық қатесі емес, кеңістіктік түсініксіздік.",
        ),
      ),
      Q(
        T(
          "Зачем смотреть миниатюру?",
          "Why inspect a thumbnail?",
          "Шағын көріністі неге тексереді?",
        ),
        [
          T(
            "Чтобы измерить полигоны",
            "To measure polygons",
            "Полигонды өлшеуге",
          ),
          T(
            "Чтобы заменить проверку материала",
            "To replace material review",
            "Материал тексеруін алмастыруға",
          ),
          T(
            "Чтобы проверить иерархию крупных форм",
            "To test major-form hierarchy",
            "Негізгі пішін иерархиясын тексеруге",
          ),
        ],
        2,
        T(
          "Мелкие детали исчезают, крупные отношения становятся очевиднее.",
          "Fine detail disappears, exposing major relationships.",
          "Ұсақ деталь жоғалып, негізгі қатынас айқынырақ көрінеді.",
        ),
      ),
    ],
    sources: [S.camera, S.modeling],
    minutes: 40,
  }),
  "b3d-3": M({
    goal: T(
      "Создать три объяснимых материала и сравнить их при одном свете.",
      "Create three explainable materials and compare under one lighting setup.",
      "Үш түсіндірілетін материал жасап, бір жарықта салыстыру.",
    ),
    principle: T(
      "PBR описывает реакцию поверхности на свет. Base color — основной цвет, metalness — металлический характер, roughness — распределение микронеровностей. Для однородной поверхности metalness обычно около 0 у неметалла или 1 у металла. Глянцевый пластик остаётся неметаллом; промежуточная металличность не делает любую поверхность «дороже».",
      "PBR describes a surface response to light. Base color is its color, metalness its metallic character, and roughness its micro-surface distribution. Uniform nonmetals usually use metalness near 0 and metals near 1. Glossy plastic remains nonmetallic; intermediate metalness is not a universal expensive-looking setting.",
      "PBR беттің жарыққа жауабын сипаттайды. Base color — негізгі түс, metalness — металл сипаты, roughness — микро кедір-бұдырлық. Біртекті бейметалда metalness әдетте 0, металда 1 маңында. Жылтыр пластик металл емес; аралық metalness кез келген бетті «қымбат» етпейді.",
    ),
    method: T(
      "Низкая roughness даёт чёткие отражения, высокая — более широкие и размытые. Она не создаёт настоящую геометрию царапин. Сравнивайте одинаковые формы под одинаковым светом: изменение света, ракурса и материала одновременно скрывает причину результата. Металл отражает окружение, поэтому в бедном окружении может выглядеть плоским. Браузерная модель материала упрощена относительно полного Blender.",
      "Low roughness creates sharper reflections; high roughness broadens them. It does not create scratch geometry. Compare identical forms under fixed light: changing lighting, view and material together hides cause and effect. Metal reflects its environment and can look flat in an empty one. The browser material model is simpler than full Blender.",
      "Төмен roughness анық, жоғарысы жайылған шағылысу береді. Ол нақты сызат геометриясын жасамайды. Бірдей пішінді бір жарықта салыстырыңыз: жарық, ракурс пен материалды бірге өзгерту себепті жасырады. Металл ортаны шағылыстырады, бос ортада жазық көрінуі мүмкін. Браузер материалы толық Blender-ге қарағанда жеңілдетілген.",
    ),
    example: T(
      "Матовый пластик, полированный и грубый металл на одинаковых шарах.",
      "Matte plastic, polished metal and rough metal on identical spheres.",
      "Бірдей шардағы күңгірт пластик, жылтыратылған және кедір-бұдыр металл.",
    ),
    steps: [
      T(
        "Пластик: metalness 0, roughness 0.65, нейтральный фон.",
        "Plastic: metalness 0, roughness 0.65, neutral backdrop.",
        "Пластик: metalness 0, roughness 0.65, бейтарап фон.",
      ),
      T(
        "Второй шар: metalness 1, roughness 0.15, тот же свет.",
        "Second sphere: metalness 1, roughness 0.15, same light.",
        "Екінші шар: metalness 1, roughness 0.15, сол жарық.",
      ),
      T(
        "Дублируйте металл и измените только roughness на 0.7.",
        "Duplicate the metal and change only roughness to 0.7.",
        "Металды көшіріп, тек roughness мәнін 0.7 етіңіз.",
      ),
    ],
    result: T(
      "Различается поведение отражений, а не случайная яркость.",
      "Reflection behavior differs rather than random brightness.",
      "Кездейсоқ жарықтық емес, шағылысу сипаты өзгереді.",
    ),
    practice: T(
      "Создайте три образца материалов, затем проверьте их на кубе и сфере.",
      "Create three materials, then inspect them on a box and sphere.",
      "Үш материал жасап, текше мен шарда тексеріңіз.",
    ),
    actions: [
      T(
        "Запишите цвет, metalness и roughness каждого образца.",
        "Record color, metalness and roughness for each sample.",
        "Әр үлгінің түсі, metalness және roughness мәнін жазыңыз.",
      ),
      T(
        "Не меняйте свет во время сравнения.",
        "Keep lighting fixed during comparison.",
        "Салыстыруда жарықты өзгертпеңіз.",
      ),
      T(
        "Объясните различия бликов на плоской и округлой форме.",
        "Explain highlights on planar and curved forms.",
        "Жазық және жұмыр пішіндегі жарқылды түсіндіріңіз.",
      ),
    ],
    deliverable: T(
      "Сцена и PNG сравнения с таблицей настроек.",
      "Scene and comparison PNG with a settings table.",
      "Сахна, салыстыру PNG және баптау кестесі.",
    ),
    checks: [
      T(
        "Пластик не стал металлом ради блеска.",
        "Plastic is not made metallic merely for gloss.",
        "Пластик жылтыр үшін металл етілмеген.",
      ),
      T(
        "Свет при сравнении одинаков.",
        "Lighting is fixed for comparison.",
        "Салыстыру жарығы бірдей.",
      ),
      T(
        "Настройки можно воспроизвести.",
        "Settings are reproducible.",
        "Баптауды қайталауға болады.",
      ),
    ],
    questions: [
      Q(
        T(
          "Как сделать пластик глянцевее?",
          "How do you make plastic glossier?",
          "Пластикті қалай жылтыратады?",
        ),
        [
          T(
            "Снизить roughness при metalness около 0",
            "Lower roughness with metalness near 0",
            "Metalness 0 маңында roughness азайту",
          ),
          T(
            "Обязательно metalness 1",
            "Always metalness 1",
            "Міндетті metalness 1",
          ),
          T("Изменить fps", "Change fps", "Fps өзгерту"),
        ],
        0,
        T(
          "Глянец и металлическая природа — разные свойства.",
          "Gloss and metallic character are separate properties.",
          "Жылтырлық пен металл сипаты бөлек.",
        ),
      ),
      Q(
        T(
          "Что меняет roughness 0.15 → 0.7?",
          "What changes with roughness 0.15 → 0.7?",
          "Roughness 0.15 → 0.7 нені өзгертеді?",
        ),
        [
          T("Число граней", "Face count", "Жақ санын"),
          T(
            "Чёткость и ширину отражений",
            "Reflection sharpness and spread",
            "Шағылысу айқындығы мен жайылуын",
          ),
          T("Длину анимации", "Animation duration", "Анимация ұзақтығын"),
        ],
        1,
        T(
          "Параметр управляет реакцией микроповерхности, не геометрией или временем.",
          "It controls micro-surface response, not geometry or time.",
          "Ол геометрия не уақытты емес, микро бет жауабын басқарады.",
        ),
      ),
      Q(
        T(
          "Почему сравнение под разным светом ненадёжно?",
          "Why is comparison under different light unreliable?",
          "Әртүрлі жарықта салыстыру неге сенімсіз?",
        ),
        [
          T(
            "Материалам нужен один цвет",
            "Materials require one color",
            "Материал бір түсті болуы тиіс",
          ),
          T(
            "Металл не отражает окружение",
            "Metal ignores its environment",
            "Металл ортаны шағылыстырмайды",
          ),
          T(
            "Меняется сразу несколько условий",
            "Multiple conditions change together",
            "Бірнеше жағдай бірге өзгереді",
          ),
        ],
        2,
        T(
          "Для причинного сравнения остальные условия сохраняют.",
          "Keep other conditions fixed to attribute a result to one change.",
          "Өзгерістің себебін түсіну үшін өзге жағдайды сақтаңыз.",
        ),
      ),
    ],
    sources: [S.material],
    minutes: 45,
  }),
  "b3d-4": M({
    goal: T(
      "Объяснять роль света и отделять мощность от мягкости.",
      "Explain lighting roles and separate power from softness.",
      "Жарық рөлін түсіндіріп, қуатты жұмсақтықтан ажырату.",
    ),
    principle: T(
      "Один ключевой источник задаёт рисунок света; боковое направление помогает увидеть объём. Fill открывает теневые детали, rim отделяет край от фона. Это роли, а не обязательные три лампы: добавляйте источник только для конкретной задачи. Равномерный фронтальный свет способен скрыть форму даже в ярком кадре.",
      "One key source establishes the lighting pattern; side light helps reveal volume. Fill reveals shadow detail; rim separates edges from the backdrop. These are roles, not three mandatory lamps: add a source for a reason. Uniform frontal light can conceal form even in a bright frame.",
      "Бір негізгі жарық жарық суретін жасайды; бүйір бағыт көлемді ашады. Fill көлеңке деталін, rim жиекті фоннан бөледі. Бұл міндетті үш шам емес, рөлдер: көзді нақты міндет үшін қосыңыз. Біркелкі маңдай жарық ашық кадрда да пішінді жасырады.",
    ),
    method: T(
      "Мягкость тени зависит от видимого размера источника относительно объекта. Большой близкий источник обычно даёт мягче переход, маленький — жёстче. Увеличение мощности не увеличивает размер лампы. В браузере используйте реально доступные настройки и не обещайте управление софтбоксом, если размера источника нет. Сохраняйте камеру и материал, сравнивая свет.",
      "Shadow softness depends on apparent source size relative to the subject. A larger nearby source generally softens transitions; a small one hardens them. Increasing power does not enlarge the emitter. Use controls actually available in the browser; do not claim softbox-size control if absent. Keep camera and material fixed when comparing lights.",
      "Көлеңке жұмсақтығы нысанға қатысты көрінетін көз өлшеміне тәуелді. Үлкен жақын көз өтуді жұмсартады, кішісі қатайтады. Қуатты арттыру көзді үлкейтпейді. Браузерде нақты бар баптауды қолданыңыз; өлшемі жоқ болса, софтбокс басқаруы бар демеңіз. Жарықты салыстырғанда камера мен материалды сақтаңыз.",
    ),
    example: T(
      "Округлый флакон на тёмном фоне.",
      "A rounded bottle on a dark background.",
      "Қараңғы фондағы жұмыр құты.",
    ),
    steps: [
      T(
        "Поставьте ключевой свет сбоку, создав разницу сторон.",
        "Place the key to one side to create tonal difference.",
        "Екі жақта реңк айырмасы болатындай негізгі жарықты бүйірге қойыңыз.",
      ),
      T(
        "Снизьте общий свет, не теряя полностью теневую сторону.",
        "Reduce ambient fill without losing the shadow side.",
        "Көлеңкелі жақ жоғалмайтындай жалпы жарықты азайтыңыз.",
      ),
      T(
        "Сравните более светлый фон: отделяйте контур не только яркостью.",
        "Compare a lighter backdrop; do not rely only on brightness for separation.",
        "Ашығырақ фонмен салыстырып, контурды тек жарықтықпен бөлмеңіз.",
      ),
    ],
    result: T(
      "Округлость видна, важные детали не стали белым пятном.",
      "Curvature reads and key details do not become a white patch.",
      "Жұмырлық көрінеді, маңызды деталь ақ даққа айналмайды.",
    ),
    practice: T(
      "Создайте нейтральный, драматичный и мягкий световой варианты одного объекта.",
      "Create neutral, dramatic and soft lighting studies of one object.",
      "Бір нысанға бейтарап, драмалық және жұмсақ жарық нұсқасын жасаңыз.",
    ),
    actions: [
      T(
        "Зафиксируйте материал и ракурс.",
        "Keep material and viewpoint fixed.",
        "Материал мен ракурсты сақтаңыз.",
      ),
      T(
        "Запишите направление и доступную мощность.",
        "Record direction and available power.",
        "Бағыт пен қолжетімді қуатты жазыңыз.",
      ),
      T(
        "Отметьте потерянные в тенях или светах детали.",
        "Note details lost in shadows or highlights.",
        "Көлеңке не жарықта жоғалған детальды белгілеңіз.",
      ),
    ],
    deliverable: T(
      "Три PNG с объяснением задачи света.",
      "Three PNGs explaining each lighting goal.",
      "Әр жарық міндеті түсіндірілген үш PNG.",
    ),
    checks: [
      T(
        "У каждого источника есть назначение.",
        "Every light has a purpose.",
        "Әр жарықтың міндеті бар.",
      ),
      T(
        "Контур отделён от фона.",
        "Outline separates from backdrop.",
        "Контур фоннан бөлінген.",
      ),
      T(
        "Пересвет не уничтожает детали.",
        "Overexposure does not erase detail.",
        "Артық жарық детальды жоймайды.",
      ),
    ],
    questions: [
      Q(
        T(
          "Основная роль fill?",
          "The main role of fill?",
          "Fill негізгі рөлі?",
        ),
        [
          T("Создать геометрию", "Create geometry", "Геометрия жасау"),
          T(
            "Открыть теневые детали",
            "Reveal shadow detail",
            "Көлеңке деталін ашу",
          ),
          T("Изменить fps", "Change fps", "Fps өзгерту"),
        ],
        1,
        T(
          "Fill уменьшает контраст теней, поддерживая ключевой рисунок.",
          "Fill reduces shadow contrast while supporting the key pattern.",
          "Fill негізгі суретті қолдап, көлеңке контрастын азайтады.",
        ),
      ),
      Q(
        T(
          "Что обычно делает тень мягче?",
          "What usually softens shadows?",
          "Көлеңкені әдетте не жұмсартады?",
        ),
        [
          T(
            "Больший видимый размер источника",
            "A larger apparent light source",
            "Үлкенірек көрінетін жарық көзі",
          ),
          T("Только больше мощности", "Only more power", "Тек көп қуат"),
          T("Имя объекта", "Object name", "Нысан атауы"),
        ],
        0,
        T(
          "Размер источника и мощность регулируют разные свойства.",
          "Emitter size and power control different properties.",
          "Жарық көзінің өлшемі мен қуаты бөлек қасиеттерді басқарады.",
        ),
      ),
      Q(
        T(
          "Яркий объект выглядит плоским. Что проверить?",
          "A bright object looks flat. What should be checked?",
          "Ашық нысан жазық көрінеді. Нені тексеру керек?",
        ),
        [
          T("Только PNG-размер", "Only PNG dimensions", "Тек PNG өлшемін"),
          T("Только полигоны", "Only polygons", "Тек полигонды"),
          T(
            "Направление света и градиент формы",
            "Light direction and form gradient",
            "Жарық бағыты мен пішін градиентін",
          ),
        ],
        2,
        T(
          "Объём читается по распределению света, не по средней яркости.",
          "Volume reads through light distribution, not average brightness.",
          "Көлем орташа жарықтықтан емес, жарық таралуынан оқылады.",
        ),
      ),
    ],
    sources: [S.light, S.material],
    minutes: 45,
  }),
  "b3d-5": M({
    goal: T(
      "Подготовить проверяемый комплект изображения, модели и исходника.",
      "Prepare a verifiable image, model and editable-source package.",
      "Тексерілетін сурет, модель және өңделетін түпнұсқа жинағын дайындау.",
    ),
    principle: T(
      "PNG хранит один растровый вид, GLB переносит геометрию и материалы, JSON сохраняет редактируемые параметры этой студии. Ни один формат не гарантирует перенос всех свойств в чужую программу. Проверьте, что именно экспортируется: свет, камера и направляющие могут не входить в модель. Не удаляйте исходник после получения красивого PNG.",
      "PNG stores one raster view, GLB transfers geometry and materials, and JSON retains this studio’s editable settings. No format guarantees every property survives in another application. Check what is exported: lights, camera and guides may not be model content. Do not delete the source after obtaining an attractive PNG.",
      "PNG бір растрлық көріністі, GLB геометрия мен материалды, JSON осы студияның өңделетін баптауын сақтайды. Еш пішім барлық қасиет басқа бағдарламаға көшетінін кепілдемейді. Не экспортталатынын тексеріңіз: жарық, камера мен бағыттағыш модельге кірмеуі мүмкін. Әдемі PNG алған соң түпнұсқаны жоймаңыз.",
    ),
    method: T(
      "Выберите пиксельные размеры под задачу, например 1600×900 для обложки. DPI без изменения числа пикселей не добавляет деталей. Откройте скачанный файл, проверьте цвет, фон, края и состав модели. Для анимационного рендера в полноценном пакете сначала проверяют один кадр и короткий фрагмент; статическая браузерная сцена не является рендер-фермой.",
      "Choose pixel dimensions for the destination, such as 1600×900 for a cover. Changing DPI without pixel count adds no detail. Open downloaded files and check color, background, edges and model contents. In a full animation package, render a test frame and short segment first; a static browser scene is not a render farm.",
      "Мақсатқа сай пиксель өлшемін таңдаңыз, мысалы мұқабаға 1600×900. Пиксель санын өзгертпей DPI арттыру деталь қоспайды. Жүктелген файлдың түсін, фонын, жиегі мен модель құрамын тексеріңіз. Толық анимация пакетінде алдымен сынақ кадры мен қысқа үзінді жасалады; статикалық браузер сахнасы рендер фермасы емес.",
    ),
    example: T(
      "Передача лампы дизайнеру обложки и 3D-художнику.",
      "Delivering a lamp to a cover designer and a 3D artist.",
      "Шамды мұқаба дизайнері мен 3D суретшіге беру.",
    ),
    steps: [
      T(
        "Сохраните lamp-v03.json и запишите цель кадра.",
        "Save lamp-v03.json and record the framing goal.",
        "lamp-v03.json сақтап, кадр мақсатын жазыңыз.",
      ),
      T(
        "Скачайте PNG для макета и GLB для 3D-программы.",
        "Export PNG for layout and GLB for the 3D application.",
        "Макетке PNG, 3D бағдарламаға GLB жүктеңіз.",
      ),
      T(
        "Откройте оба файла снова и проверьте внешний вид и состав.",
        "Reopen both and inspect appearance and contents.",
        "Екеуін қайта ашып, көрінісі мен құрамын тексеріңіз.",
      ),
    ],
    result: T(
      "Получателю понятно назначение каждого файла и номер версии.",
      "The recipient understands each file purpose and version.",
      "Қабылдаушы әр файл міндеті мен нұсқасын түсінеді.",
    ),
    practice: T(
      "Подготовьте комплект передачи своей предметной сцены.",
      "Prepare a handoff package for your product scene.",
      "Заттық сахнаңыздың тапсыру жинағын дайындаңыз.",
    ),
    actions: [
      T(
        "Выберите место использования и размеры изображения.",
        "Choose the destination and image dimensions.",
        "Қолдану орны мен сурет өлшемін таңдаңыз.",
      ),
      T(
        "Сохраните исходник, изображение и модель с одной версией в имени.",
        "Save source, image and model with one version label.",
        "Түпнұсқа, сурет пен модельді бір нұсқа атауымен сақтаңыз.",
      ),
      T(
        "Проверьте файлы вне редактора и перечислите различия.",
        "Inspect files outside the editor and list differences.",
        "Файлды редактордан тыс тексеріп, айырмашылықты жазыңыз.",
      ),
    ],
    deliverable: T(
      "JSON, PNG, GLB и заметка о размерах и проверке.",
      "JSON, PNG, GLB and a dimensions/verification note.",
      "JSON, PNG, GLB және өлшем мен тексеру жазбасы.",
    ),
    checks: [
      T(
        "Редактируемый исходник сохранён.",
        "Editable source is preserved.",
        "Өңделетін түпнұсқа сақталған.",
      ),
      T(
        "Экспорт заново открыт.",
        "Exports are reopened.",
        "Экспорт қайта ашылған.",
      ),
      T(
        "Названия и версии согласованы.",
        "Names and versions are consistent.",
        "Атау мен нұсқа бірізді.",
      ),
    ],
    questions: [
      Q(
        T(
          "Что сохраняет редактирование в этой студии?",
          "What retains editing in this studio?",
          "Осы студияда өңдеуді не сақтайды?",
        ),
        [
          T("Только PNG", "Only PNG", "Тек PNG"),
          T("Скриншот названия", "Screenshot of the name", "Атау скриншоты"),
          T("JSON проекта", "Project JSON", "Жоба JSON-ы"),
        ],
        2,
        T(
          "Изображение не хранит редактируемую структуру сцены.",
          "An image does not retain editable scene structure.",
          "Сурет өңделетін сахна құрылымын сақтамайды.",
        ),
      ),
      Q(
        T(
          "Что проверить после GLB-экспорта?",
          "What should be checked after GLB export?",
          "GLB экспортынан кейін нені тексереді?",
        ),
        [
          T(
            "Открытие в совместимой программе и состав модели",
            "Opening in a compatible app and model contents",
            "Үйлесімді бағдарламада ашылуы мен модель құрамы",
          ),
          T("Только цвет кнопки", "Only button color", "Тек батырма түсі"),
          T("Только дату аккаунта", "Only account date", "Тек аккаунт күні"),
        ],
        0,
        T(
          "Получатель может видеть свойства иначе; перенос нужно проверить.",
          "The receiving app may interpret properties differently; validate the transfer.",
          "Қабылдайтын бағдарлама қасиетті басқаша көрсетуі мүмкін; тасымалды тексеріңіз.",
        ),
      ),
      Q(
        T(
          "DPI без добавления пикселей…",
          "Changing DPI without adding pixels…",
          "Пиксель қоспай DPI өзгерту…",
        ),
        [
          T("Создаёт геометрию", "Creates geometry", "Геометрия жасайды"),
          T(
            "Не создаёт новой детализации",
            "Does not create detail",
            "Жаңа деталь жасамайды",
          ),
          T(
            "Исправляет композицию",
            "Fixes composition",
            "Композицияны түзетеді",
          ),
        ],
        1,
        T(
          "Экранная детализация зависит от числа пикселей и исходного качества.",
          "Screen detail depends on pixel count and source quality.",
          "Экран деталін пиксель саны мен бастапқы сапа анықтайды.",
        ),
      ),
    ],
    sources: [S.output, S.camera],
    minutes: 35,
  }),
  "mot-1": M({
    goal: T(
      "Связать ключевое значение, канал и момент времени.",
      "Connect a keyed value, channel and point in time.",
      "Кілт мәнін, арнасын және уақытын байланыстыру.",
    ),
    principle: T(
      "Ключ фиксирует значение конкретного свойства: например X=0 на кадре 1. Положение, угол, масштаб и прозрачность — отдельные каналы; ключ для X не записывает автоматически всё остальное. Между ключами редактор вычисляет значения. Две хорошие крайние позы не гарантируют хорошую середину: проверьте траекторию, пересечения и читаемость поворота.",
      "A key records one property, such as X=0 at frame 1. Position, angle, scale and opacity are separate channels; keying X does not automatically record everything else. The editor calculates values between keys. Two good extreme poses do not guarantee a good middle: check the path, intersections and readable turning.",
      "Кілт нақты қасиет мәнін бекітеді: мысалы 1-кадрда X=0. Орын, бұрыш, масштаб пен мөлдірлік — бөлек арналар; X кілті қалғанын автоматты жазбайды. Редактор кілттер арасын есептейді. Екі жақсы шеткі қалып ортасының жақсы болуын кепілдемейді: жол, қиылысу мен бұрылуды тексеріңіз.",
    ),
    method: T(
      "Constant удерживает значение до следующего ключа, linear изменяет его равномерно, Bézier позволяет управлять плавностью. Плавность не всегда нужна: переключатель может требовать ступеньку. Для настоящих ключей и кривых используйте редактор со шкалой, например Blender. В статической браузерной студии можно подготовить позы, но их набор ещё не анимационный рендер.",
      "Constant holds until the next key, linear changes uniformly and Bézier controls easing. Smoothness is not always required: a switch may need a step. Actual keys and curves require a timeline editor such as Blender. A static browser studio can prepare poses, but a set of poses is not an animated render.",
      "Constant мәнді келесі кілтке дейін ұстайды, linear бірқалыпты өзгертеді, Bézier жұмсақтықты басқарады. Жұмсақтық әрдайым қажет емес: ауыстырғышқа секіріс керек болуы мүмкін. Нақты кілт пен қисыққа Blender сияқты шкалалы редактор қажет. Статикалық браузер студиясында қалып дайындауға болады, бірақ қалыптар жинағы анимациялық рендер емес.",
    ),
    example: T(
      "Шар движется по X от 0 до 4.",
      "A sphere moves along X from 0 to 4.",
      "Шар X бойымен 0-ден 4-ке қозғалады.",
    ),
    steps: [
      T(
        "На кадре 1 задайте X=0, на 25 — X=4.",
        "Set X=0 at frame 1 and X=4 at frame 25.",
        "1-кадрға X=0, 25-ке X=4 қойыңыз.",
      ),
      T(
        "При linear проверьте кадр 13: X должен быть 2.",
        "With linear interpolation check frame 13: X should be 2.",
        "Linear кезінде 13-кадрды тексеріңіз: X=2 болуы керек.",
      ),
      T(
        "Сравните constant и easing при тех же двух ключах.",
        "Compare constant and eased interpolation with the same keys.",
        "Сол екі кілтпен constant пен easing салыстырыңыз.",
      ),
    ],
    result: T(
      "Поведение зависит от интерполяции, а не только от крайних поз.",
      "Behavior depends on interpolation, not only extreme poses.",
      "Қозғалыс тек шеткі қалыпқа емес, интерполяцияға тәуелді.",
    ),
    practice: T(
      "Сравните два движения с одинаковыми началом и концом.",
      "Compare two motions with identical start and end poses.",
      "Басы мен соңы бірдей екі қозғалысты салыстырыңыз.",
    ),
    actions: [
      T(
        "Запишите свойство, значения и номера ключей.",
        "Record property, values and keyframe numbers.",
        "Қасиет, мән және кілт нөмірін жазыңыз.",
      ),
      T(
        "Постройте пять промежуточных поз по таблице или в Blender.",
        "Construct five intermediate poses from a table or in Blender.",
        "Кестемен не Blender-де бес аралық қалып құрыңыз.",
      ),
      T(
        "Проверьте середину пути и изменённые каналы.",
        "Inspect the path middle and changed channels.",
        "Жол ортасы мен өзгерген арнаны тексеріңіз.",
      ),
    ],
    deliverable: T(
      "Таблица ключей, пять поз и объяснение типа интерполяции.",
      "Key table, five poses and an interpolation explanation.",
      "Кілт кестесі, бес қалып және интерполяция түсіндірмесі.",
    ),
    checks: [
      T(
        "Ключ записан для нужного канала.",
        "The correct channel is keyed.",
        "Кілт керекті арнаға қойылған.",
      ),
      T(
        "Середина движения проверена.",
        "The motion middle is checked.",
        "Қозғалыс ортасы тексерілген.",
      ),
      T(
        "Статические позы не названы готовой анимацией.",
        "Static poses are not called finished animation.",
        "Статикалық қалып дайын анимация деп аталмаған.",
      ),
    ],
    questions: [
      Q(
        T(
          "Что означает X=4 на кадре 25?",
          "What does X=4 at frame 25 specify?",
          "25-кадрда X=4 нені білдіреді?",
        ),
        [
          T(
            "Все свойства на всех кадрах",
            "Every property on every frame",
            "Барлық кадрдағы барлық қасиет",
          ),
          T(
            "Значение одного канала в этот момент",
            "One channel value at that time",
            "Сол уақыттағы бір арна мәні",
          ),
          T("Только цвет", "Only color", "Тек түс"),
        ],
        1,
        T(
          "Другие свойства могут иметь собственные ключи.",
          "Other properties may have their own keys.",
          "Басқа қасиеттің өз кілті болуы мүмкін.",
        ),
      ),
      Q(
        T(
          "Когда нужен constant?",
          "When is constant interpolation useful?",
          "Constant қашан қажет?",
        ),
        [
          T(
            "Удержание значения и резкое переключение",
            "A hold followed by a sharp switch",
            "Мәнді ұстап, күрт ауыстыру",
          ),
          T(
            "Всегда для плавного разгона",
            "Always for gradual acceleration",
            "Әрдайым жұмсақ үдеуге",
          ),
          T("Для повышения fps", "To raise fps", "Fps арттыруға"),
        ],
        0,
        T(
          "Constant не смешивает значения постепенно.",
          "Constant does not gradually blend values.",
          "Constant мәнді біртіндеп араластырмайды.",
        ),
      ),
      Q(
        T(
          "Linear: X=0 на кадре 1, X=4 на 25. X на 13?",
          "Linear: X=0 at frame 1, X=4 at 25. X at 13?",
          "Linear: 1-кадрда X=0, 25-те X=4. 13-те X қанша?",
        ),
        [T("4", "4", "4"), T("0", "0", "0"), T("2", "2", "2")],
        2,
        T(
          "Кадр 13 — середина интервала между 1 и 25.",
          "Frame 13 is halfway between 1 and 25.",
          "13-кадр 1 мен 25 аралығының ортасы.",
        ),
      ),
    ],
    sources: [S.keys, S.curves],
    minutes: 45,
  }),
  "mot-2": M({
    goal: T(
      "Рассчитывать длительность и отличать timing от spacing.",
      "Calculate duration and distinguish timing from spacing.",
      "Ұзақтықты есептеп, timing пен spacing ажырату.",
    ),
    principle: T(
      "Timing определяет длительность, spacing — расстояние между последовательными позами. Один путь за одно время можно пройти с равными или растущими промежутками. На графике значения от времени наклон связан со скоростью изменения: горизонтальный участок удерживает значение. График X(t) не является пространственной траекторией сверху.",
      "Timing sets duration; spacing is the distance between successive poses. The same path in the same time can use equal or increasing gaps. On a value-time graph, slope relates to rate of change: a horizontal section holds a value. An X(t) graph is not a top-view spatial path.",
      "Timing ұзақтықты, spacing кезекті қалып аралығын анықтайды. Бір жолды бір уақытта бірдей не өсетін аралықпен өтуге болады. Мән–уақыт графигінің көлбеуі өзгеріс жылдамдығына байланысты: көлденең бөлік мәнді ұстайды. X(t) графигі жоғарыдан кеңістіктік жол емес.",
    ),
    method: T(
      "При 24 fps между кадрами 1 и 25 находятся 24 интервала, то есть секунда: (25−1)/24. Последний номер сам по себе не равен времени. Не исправляйте торопливый жест случайным повышением fps: сначала задайте длительность, потом распределите позы. Вес и ритм проверяют проигрыванием в реальном времени, а ошибки — также покадрово.",
      "At 24 fps, frames 1 and 25 are 24 intervals apart: (25−1)/24 equals one second. The last frame label alone is not elapsed time. Do not fix rushed action by randomly raising fps: choose duration first, then distribute poses. Judge weight and rhythm in real time, and inspect errors frame by frame.",
      "24 fps кезінде 1 мен 25-кадр арасында 24 аралық бар: (25−1)/24 бір секунд. Соңғы нөмірдің өзі өткен уақыт емес. Асығыс қимылды fps-ті кездейсоқ арттырумен түзетпеңіз: алдымен ұзақтық, кейін қалып таралуын таңдаңыз. Салмақ пен ырғақты нақты уақытта, қатені кадрлап тексеріңіз.",
    ),
    example: T(
      "Единый путь 4 единицы с равномерным движением и разгоном.",
      "One four-unit path with uniform motion and acceleration.",
      "Төрт бірлік жолды бірқалыпты және үдеумен өту.",
    ),
    steps: [
      T(
        "Выберите равные моменты: 0%, 25%, 50%, 75%, 100%.",
        "Choose equal times: 0%, 25%, 50%, 75%, 100%.",
        "Бірдей уақыт нүктесін таңдаңыз: 0%, 25%, 50%, 75%, 100%.",
      ),
      T(
        "Запишите позиции 0,1,2,3,4 и второй ряд 0,0.25,1,2.25,4.",
        "Write positions 0,1,2,3,4 and a second row 0,0.25,1,2.25,4.",
        "0,1,2,3,4 орындарын және екінші қатарға 0,0.25,1,2.25,4 жазыңыз.",
      ),
      T(
        "Сравните расстояния: во втором случае они растут при тех же пути и времени.",
        "Compare gaps: the second grows despite the same path and duration.",
        "Аралықты салыстырыңыз: екіншісі бір жол мен уақытта өседі.",
      ),
    ],
    result: T(
      "Различие скорости видно по промежуткам, а не только по конечной точке.",
      "Speed differences read through gaps, not only the endpoint.",
      "Жылдамдық айырмасы тек соңғы нүктеден емес, аралықтан көрінеді.",
    ),
    practice: T(
      "Спланируйте вход карточки, паузу чтения и выход.",
      "Plan a card entrance, reading hold and exit.",
      "Карточканың келуі, оқу кідірісі мен кетуін жоспарлаңыз.",
    ),
    actions: [
      T(
        "Выберите fps и длительность каждого этапа.",
        "Choose fps and each phase duration.",
        "Fps пен әр кезең ұзақтығын таңдаңыз.",
      ),
      T(
        "Переведите секунды в интервалы кадров.",
        "Convert seconds to frame intervals.",
        "Секундты кадр аралығына айналдырыңыз.",
      ),
      T(
        "Сравните равномерный и замедляющийся вход по читаемости.",
        "Compare uniform and decelerating entrances for readability.",
        "Бірқалыпты және баяулайтын келудің оқылуын салыстырыңыз.",
      ),
    ],
    deliverable: T(
      "Таблица времени и две схемы spacing с выводом.",
      "Timing table and two spacing diagrams with a conclusion.",
      "Уақыт кестесі және қорытындысы бар екі spacing сызбасы.",
    ),
    checks: [
      T(
        "Учтена разность кадров, а не только последний номер.",
        "Frame difference, not only the last label, is used.",
        "Тек соңғы нөмір емес, кадр айырмасы қолданылған.",
      ),
      T(
        "Пауза позволяет прочитать текст.",
        "The hold allows reading.",
        "Кідіріс оқуға мүмкіндік береді.",
      ),
      T(
        "Варианты сравниваются при одном fps.",
        "Variants use the same fps.",
        "Нұсқалар бір fps-пен салыстырылады.",
      ),
    ],
    questions: [
      Q(
        T(
          "Кадры 1–25 при 24 fps — сколько времени?",
          "Frames 1–25 at 24 fps span how long?",
          "24 fps кезінде 1–25-кадр аралығы қанша?",
        ),
        [
          T("1 секунду", "1 second", "1 секунд"),
          T("25 секунд", "25 seconds", "25 секунд"),
          T("24 секунды", "24 seconds", "24 секунд"),
        ],
        0,
        T(
          "(25−1)/24 = 1. Считайте интервалы между метками.",
          "(25−1)/24 = 1. Count intervals between labels.",
          "(25−1)/24 = 1. Белгі арасындағы аралықты санаңыз.",
        ),
      ),
      Q(
        T(
          "При равном времени промежутки поз растут. Это…",
          "Pose gaps grow at equal time intervals. This is…",
          "Бірдей уақытта қалып аралығы өседі. Бұл…",
        ),
        [
          T("Постоянная скорость", "Constant speed", "Тұрақты жылдамдық"),
          T("Ускорение", "Acceleration", "Үдеу"),
          T(
            "Обязательно новый fps",
            "Necessarily a new fps",
            "Міндетті жаңа fps",
          ),
        ],
        1,
        T(
          "В каждом интервале проходит большее расстояние.",
          "More distance is traveled per interval.",
          "Әр аралықта көбірек қашықтық өтіледі.",
        ),
      ),
      Q(
        T(
          "Горизонтальный участок графика значения означает…",
          "A flat value-curve section means…",
          "Мән графигінің көлденең бөлігі…",
        ),
        [
          T(
            "Обязательное движение вверх",
            "Necessarily upward motion",
            "Міндетті жоғары қозғалыс",
          ),
          T("Исчезновение объекта", "Object disappearance", "Нысан жоғалуын"),
          T(
            "Удержание значения канала",
            "The channel value is held",
            "Арна мәнінің сақталуын",
          ),
        ],
        2,
        T(
          "В этом участке значение не меняется со временем.",
          "The value does not change with time there.",
          "Бұл бөлікте мән уақытпен өзгермейді.",
        ),
      ),
    ],
    sources: [S.curves, S.keys, S.animation],
    minutes: 45,
  }),
  "mot-3": M({
    goal: T(
      "Спроектировать запаздывание и затухание с понятной причиной.",
      "Plan lag and settling with a clear cause.",
      "Түсінікті себебі бар кешігу мен бәсеңдеуді жоспарлау.",
    ),
    principle: T(
      "Drag — отставание мягкой или свободно закреплённой части при начале движения основной массы. Follow-through — её продолжение после остановки массы. Settling — уменьшение последующих колебаний. Не давайте всем деталям одинаковые ключи или одинаковую задержку: сначала определите крепление, гибкость и причину реакции одной детали.",
      "Drag is a flexible or loosely attached part lagging as the main mass starts. Follow-through is its continuation after the mass stops. Settling is diminishing later oscillation. Do not give all parts identical keys or delays: first define attachment, flexibility and the cause of one part’s response.",
      "Drag — негізгі масса қозғалғанда жұмсақ не бос бекіген бөліктің кешігуі. Follow-through — масса тоқтағаннан кейінгі жалғасуы. Settling — кейінгі тербелістің азаюы. Барлық бөлікке бірдей кілт не кешігу бермеңіз: бір бөлшектің бекітілуі, икемділігі мен реакция себебін анықтаңыз.",
    ),
    method: T(
      "Тяжёлый корпус и лёгкий шарф реагируют по-разному. Выбирайте амплитуду и длительность по наблюдению и характеру, а не случайным шумом. При спокойном затухании последующие отклонения обычно уменьшаются; растущие означают добавление энергии. Вторичная деталь должна поддерживать жест, а не отвлекать от него.",
      "A heavy body and light scarf respond differently. Choose amplitude and duration from observation and character, not random noise. During calm settling, later deviations usually shrink; growing ones suggest added energy. Secondary motion should support the gesture rather than steal attention.",
      "Ауыр дене мен жеңіл шарф әртүрлі әрекет етеді. Амплитуда мен ұзақтықты кездейсоқ шудан емес, бақылау мен сипаттан таңдаңыз. Тыныш бәсеңдеуде ауытқу әдетте кішірейеді; өсуі энергия қосылғанын білдіреді. Қосымша қозғалыс қимылды қолдап, назарды тартып кетпеуі тиіс.",
    ),
    example: T(
      "Топсалы вывеска после остановки тележки.",
      "A hinged sign after a cart stops.",
      "Арба тоқтағаннан кейінгі топсалы маңдайша.",
    ),
    steps: [
      T(
        "Сначала задайте остановку корпуса тележки.",
        "Plan the cart body stop first.",
        "Алдымен арба денесінің тоқтауын қойыңыз.",
      ),
      T(
        "Оставьте вывеске небольшое движение вперёд и возврат.",
        "Let the sign continue forward slightly and return.",
        "Маңдайшаға сәл алға жалғасу мен қайту беріңіз.",
      ),
      T(
        "Сравните отклонения 12°, −7°, 3°, 0° и проверьте ось шарнира.",
        "Compare deviations 12°, −7°, 3°, 0° and check the hinge axis.",
        "12°, −7°, 3°, 0° ауытқуын салыстырып, топса осін тексеріңіз.",
      ),
    ],
    result: T(
      "Вывеска ощущается прикреплённой, но не жёстко слитой с корпусом.",
      "The sign feels attached without being rigidly fused to the body.",
      "Маңдайша денеге бекіген, бірақ қатты тұтаспағандай сезіледі.",
    ),
    practice: T(
      "Спланируйте остановку предмета с антенной, шарфом или вывеской.",
      "Plan a stop with an antenna, scarf or sign.",
      "Антеннасы, шарфы не маңдайшасы бар заттың тоқтауын жоспарлаңыз.",
    ),
    actions: [
      T(
        "Опишите массу, подвижную часть и крепление.",
        "Describe the mass, moving part and attachment.",
        "Масса, қозғалатын бөлік пен бекітуді сипаттаңыз.",
      ),
      T(
        "Сделайте 6–8 поз: остановка, продолжение, возврат, затухание.",
        "Make 6–8 poses: stop, continuation, return, settling.",
        "6–8 қалып жасаңыз: тоқтау, жалғасу, қайту, бәсеңдеу.",
      ),
      T(
        "Отметьте момент остановки каждой части.",
        "Mark when each part stops.",
        "Әр бөліктің тоқтау уақытын белгілеңіз.",
      ),
    ],
    deliverable: T(
      "Нумерованные позы с таймингом; при наличии Blender — анимационный предпросмотр.",
      "Numbered timed poses; an animated preview if using Blender.",
      "Уақыты бар нөмірленген қалыптар; Blender болса, анимация көрінісі.",
    ),
    checks: [
      T(
        "У задержки есть причина.",
        "The lag has a reason.",
        "Кешігудің себебі бар.",
      ),
      T(
        "Колебания уменьшаются при затухании.",
        "Oscillations diminish while settling.",
        "Бәсеңдеуде тербеліс азаяды.",
      ),
      T(
        "Главное действие не заслонено.",
        "Primary action remains clear.",
        "Негізгі әрекет жабылмаған.",
      ),
    ],
    questions: [
      Q(
        T(
          "Продолжение детали после остановки массы — это…",
          "A part continuing after the mass stops is…",
          "Масса тоқтаған соң бөлшектің жалғасуы…",
        ),
        [
          T("Follow-through", "Follow-through", "Follow-through"),
          T(
            "Экспорт разрешения",
            "Resolution export",
            "Ажыратымдылық экспорты",
          ),
          T("UV-развёртка", "UV unwrapping", "UV жаймасы"),
        ],
        0,
        T(
          "Это продолжение; drag обозначает отставание за ведущей массой.",
          "This is continuation; drag is lag behind the driving mass.",
          "Бұл жалғасу; drag жетекші массадан кешігуді білдіреді.",
        ),
      ),
      Q(
        T(
          "Какие отклонения похожи на затухание?",
          "Which deviations resemble settling?",
          "Қай ауытқу бәсеңдеуге ұқсайды?",
        ),
        [
          T("3°, −7°, 12°, −20°", "3°, −7°, 12°, −20°", "3°, −7°, 12°, −20°"),
          T("12°, −7°, 3°, 0°", "12°, −7°, 3°, 0°", "12°, −7°, 3°, 0°"),
          T("12°, 12°, 12°, 12°", "12°, 12°, 12°, 12°", "12°, 12°, 12°, 12°"),
        ],
        1,
        T(
          "Уменьшение амплитуды показывает приближение к покою.",
          "Shrinking amplitude suggests approaching rest.",
          "Кішірейген амплитуда тыныштыққа келуді көрсетеді.",
        ),
      ),
      Q(
        T(
          "Откуда начинать вторичное движение?",
          "Where should secondary motion start?",
          "Қосымша қозғалыс неден басталады?",
        ),
        [
          T(
            "Случайный шум на всех деталях",
            "Random noise on all parts",
            "Барлық бөлікке кездейсоқ шу",
          ),
          T(
            "Максимальная амплитуда",
            "Maximum amplitude",
            "Ең үлкен амплитуда",
          ),
          T(
            "Основное действие и причина отставания",
            "Primary action and reason for lag",
            "Негізгі әрекет пен кешігу себебі",
          ),
        ],
        2,
        T(
          "Деталь реагирует на действие, а не колеблется без причины.",
          "A part responds to action rather than oscillating without cause.",
          "Бөлшек себепсіз тербелмей, әрекетке жауап береді.",
        ),
      ),
    ],
    sources: [S.animation, S.curves],
    minutes: 50,
  }),
  "mot-4": M({
    goal: T(
      "Преобразовать идею в читаемые планы с действием и длительностью.",
      "Turn an idea into readable shots with action and duration.",
      "Идеяны әрекеті мен ұзақтығы бар түсінікті пландарға айналдыру.",
    ),
    principle: T(
      "Раскадровка проверяет историю до дорогой реализации. Панель отвечает на вопросы «что зритель видит?» и «что меняется?». Простая форма с ясной стрелкой полезнее красивого, но неоднозначного кадра. Разделяйте движение объекта и камеры; начало и конец сложного жеста показывайте разными панелями, чтобы исполнитель не угадывал.",
      "A storyboard tests a story before expensive production. A panel answers what viewers see and what changes. A simple form with a clear arrow is more useful than a polished but ambiguous image. Separate object and camera motion; show the start and end of complex gestures in separate panels rather than making an animator guess.",
      "Кадр жоспары қымбат іске асыруға дейін оқиғаны тексереді. Панель «көрермен не көреді?» және «не өзгереді?» дегенге жауап береді. Анық жебесі бар қарапайым пішін көмескі әдемі кадрдан пайдалы. Нысан мен камера қозғалысын бөліп, күрделі қимыл басы мен соңын бөлек панельде көрсетіңіз.",
    ),
    method: T(
      "Сохраняйте понятное направление между соседними планами. Объект, вышедший справа и появившийся слева, требует осмысленного перехода. Подпишите план, действие, время и звук. Сложите длительности и соберите черновой аниматик из неподвижных панелей. Он проверяет ритм, а не заменяет финальную анимацию; сначала просмотрите его без объяснений и музыки.",
      "Preserve understandable direction across neighboring shots. An object exiting right and appearing left requires an intentional transition. Label shot, action, duration and sound. Sum durations and assemble a rough animatic from still panels. It tests pacing rather than replacing final animation; watch without explanation or music first.",
      "Көршілес план арасында бағыт түсінікті болсын. Оңнан шығып, солдан пайда болған нысанға мағыналы өту қажет. План, әрекет, уақыт пен дыбысты белгілеңіз. Ұзақтықты қосып, қимылсыз панельден аниматик жинаңыз. Ол соңғы анимацияны алмастырмай, ырғақты тексереді; алдымен түсіндірусіз және музыкасыз көріңіз.",
    ),
    example: T(
      "Шесть панелей: фигуры раскрывают название школы.",
      "Six panels: shapes reveal a school title.",
      "Алты панель: пішіндер мектеп атауын ашады.",
    ),
    steps: [
      T(
        "Панели 1–2 задают пустоту и вход фигуры с направлением.",
        "Panels 1–2 show empty space and a shape entering with direction.",
        "1–2 панель бос орын мен пішіннің бағытпен келуін көрсетеді.",
      ),
      T(
        "Панели 3–4 показывают сборку и появление текста.",
        "Panels 3–4 show assembly and text reveal.",
        "3–4 панель жиналу мен мәтін шығуын көрсетеді.",
      ),
      T(
        "Панели 5–6 дают чтение и завершение; проверьте сумму времени.",
        "Panels 5–6 allow reading and closure; check total duration.",
        "5–6 панель оқуға және аяқтауға уақыт береді; жалпы уақытты тексеріңіз.",
      ),
    ],
    result: T(
      "Другой человек понимает действие и ритм без вашего устного рассказа.",
      "Another person understands action and pacing without your verbal explanation.",
      "Басқа адам ауызша түсіндірусіз әрекет пен ырғақты түсінеді.",
    ),
    practice: T(
      "Раскадруйте 6–8 секундный ролик о творческом событии.",
      "Storyboard a 6–8 second piece for a creative event.",
      "Шығармашылық іс-шараға 6–8 секундтық роликті жоспарлаңыз.",
    ),
    actions: [
      T(
        "Сформулируйте одну мысль и действие зрителя.",
        "Define one message and intended viewer action.",
        "Бір ой мен көрермен әрекетін анықтаңыз.",
      ),
      T(
        "Нарисуйте 6–8 панелей с временными подписями.",
        "Draw 6–8 panels with timing notes.",
        "Уақыты жазылған 6–8 панель салыңыз.",
      ),
      T(
        "Покажите план человеку без пояснений и исправьте непонятный переход.",
        "Show it without explanation and revise one unclear transition.",
        "Түсіндірусіз көрсетіп, түсініксіз өтуді түзетіңіз.",
      ),
    ],
    deliverable: T(
      "Нумерованная раскадровка и таблица длительностей.",
      "Numbered storyboard and duration table.",
      "Нөмірленген кадр жоспары мен ұзақтық кестесі.",
    ),
    checks: [
      T(
        "Камера и действие обозначены отдельно.",
        "Camera and subject action are distinct.",
        "Камера мен әрекет бөлек белгіленген.",
      ),
      T(
        "У каждого плана есть функция.",
        "Every shot has a purpose.",
        "Әр планның міндеті бар.",
      ),
      T(
        "Сумма времени соответствует заданию.",
        "Total time matches the brief.",
        "Жалпы уақыт тапсырмаға сай.",
      ),
    ],
    questions: [
      Q(
        T(
          "Главная задача раскадровки?",
          "The main purpose of storyboarding?",
          "Кадр жоспарының негізгі мақсаты?",
        ),
        [
          T(
            "Скрыть решения до рендера",
            "Hide decisions until rendering",
            "Шешімді рендерге дейін жасыру",
          ),
          T(
            "Проверить ход действия до производства",
            "Test action before production",
            "Өндіріске дейін әрекетті тексеру",
          ),
          T(
            "Заменить исходники логотипом",
            "Replace sources with a logo",
            "Түпнұсқаны логотиппен алмастыру",
          ),
        ],
        1,
        T(
          "Черновые планы позволяют проверить историю дёшево и заранее.",
          "Rough shots test a story early at lower cost.",
          "Бастапқы пландар оқиғаны ерте әрі аз шығынмен тексереді.",
        ),
      ),
      Q(
        T(
          "Чем аниматик отличается от финала?",
          "How does an animatic differ from a final?",
          "Аниматик соңғы нұсқадан несімен ерекшеленеді?",
        ),
        [
          T(
            "Проверяет ритм на черновых кадрах",
            "Tests pacing with rough frames",
            "Бастапқы кадрмен ырғақты тексереді",
          ),
          T(
            "Обязан иметь больше эффектов",
            "Must have more effects",
            "Әсері міндетті көп",
          ),
          T("Не имеет длительности", "Has no duration", "Ұзақтығы жоқ"),
        ],
        0,
        T(
          "Панели размещены во времени без требования законченной анимации.",
          "Panels are arranged in time without requiring finished animation.",
          "Дайын анимацияны талап етпей, панельдер уақытқа орналастырылады.",
        ),
      ),
      Q(
        T(
          "Зачем отдельно писать движение камеры?",
          "Why label camera movement separately?",
          "Камера қозғалысын неге бөлек жазады?",
        ),
        [
          T(
            "Для увеличения файла",
            "To increase file size",
            "Файлды үлкейтуге",
          ),
          T(
            "Чтобы не описывать действие",
            "To avoid describing action",
            "Әрекетті сипаттамауға",
          ),
          T(
            "Чтобы не спутать ракурс и движение предмета",
            "To distinguish viewpoint motion from subject motion",
            "Ракурс пен зат қозғалысын ажыратуға",
          ),
        ],
        2,
        T(
          "Камера и предмет независимо изменяют изображение.",
          "Camera and subject independently change the image.",
          "Камера мен зат суретті бөлек өзгертеді.",
        ),
      ),
    ],
    sources: [S.storyboard, S.animation],
    minutes: 50,
  }),
  "mot-5": M({
    goal: T(
      "Собрать заставку с одной идеей, временем чтения и проверенным экспортом.",
      "Build a title piece with one idea, reading time and verified delivery.",
      "Бір ойы, оқу уақыты және тексерілген экспорты бар кіріспе жасау.",
    ),
    principle: T(
      "Заставка — не демонстрация всех эффектов. Выберите одно сообщение: название события, настроение или идею бренда. Повторяйте направления, формы и интервалы, чтобы движение выглядело системой. Разделите вход, развитие, читаемую остановку и завершение. Непрерывно движущийся текст заставляет следить вместо чтения; проверяйте реальный перевод, потому что длина русского, английского и казахского текста различается.",
      "A title piece is not a demonstration of every effect. Choose one message: event name, mood or brand idea. Reuse directions, forms and intervals so motion feels systematic. Separate entrance, development, readable hold and ending. Constantly moving text demands tracking instead of reading; test real translations because Russian, English and Kazakh text lengths differ.",
      "Кіріспе барлық әсердің көрмесі емес. Бір хабарды таңдаңыз: іс-шара атауы, көңіл күйі не бренд идеясы. Бағыт, пішін мен аралықты қайталап, қозғалысты жүйелі етіңіз. Келу, даму, оқылатын тоқтау мен аяқталуды бөліңіз. Үнемі қозғалатын мәтін оқудан бұрын бақылауды талап етеді; орысша, ағылшынша және қазақша ұзақтығы әртүрлі болғандықтан нақты аударманы тексеріңіз.",
    ),
    method: T(
      "Просмотрите без звука: сообщение должно сохраняться. Затем добавьте звук, который поддерживает акценты и не маскирует неясный монтаж резкой громкостью. Проверьте первый/последний кадр, безопасные поля и весь скачанный файл. Браузерный монтаж собирает поддерживаемые клипы и титры; сложная анимация свойств требует отдельного редактора. Неподвижный титр — не полный моушн-пакет.",
      "Review without sound: the message should survive. Add audio that supports accents rather than concealing unclear editing with sudden loudness. Check first/last frames, safe margins and the entire downloaded file. Browser editing assembles supported clips and titles; complex property animation needs a dedicated editor. A static title is not a full motion package.",
      "Дыбыссыз көріңіз: хабар сақталсын. Түсініксіз монтажды қатты дыбыспен жасыру үшін емес, акцентті қолдау үшін дыбыс қосыңыз. Алғашқы/соңғы кадр, қауіпсіз жиек және жүктелген файлды толық тексеріңіз. Браузер монтажы қолдайтын клип пен титрді жинайды; күрделі қасиет анимациясына бөлек редактор қажет. Қимылсыз титр толық моушн-пакет емес.",
    ),
    example: T(
      "Шестисекундная заставка мастер-класса.",
      "A six-second workshop title piece.",
      "Шеберлік сабағының алты секундтық кіріспесі.",
    ),
    steps: [
      T(
        "0–1 с: форма; 1–2 с: появление названия; 2–5 с: чтение; 5–6 с: завершение.",
        "0–1 s: shape; 1–2 s: title reveal; 2–5 s: reading hold; 5–6 s: ending.",
        "0–1 с: пішін; 1–2 с: атау шығуы; 2–5 с: оқу; 5–6 с: аяқталу.",
      ),
      T(
        "В финале оставьте название, дату и одно действие.",
        "Keep title, date and one action in the final frame.",
        "Соңғы кадрға атау, күн және бір әрекет қалдырыңыз.",
      ),
      T(
        "Попросите зрителя повторить название и дату после одного просмотра на телефоне.",
        "Ask a viewer to repeat title and date after one phone viewing.",
        "Телефонда бір көрген соң көрерменнен атау мен күнді қайталауды сұраңыз.",
      ),
    ],
    result: T(
      "Проверяется переданное сообщение, а не только эффектность входа.",
      "The communicated message is tested, not merely an impressive entrance.",
      "Тек әсерлі келу емес, жеткізілген хабар тексеріледі.",
    ),
    practice: T(
      "Создайте 5–8 секундную заставку вымышленного творческого события.",
      "Create a 5–8 second title piece for a fictional creative event.",
      "Ойдан алынған шығармашылық іс-шараға 5–8 секундтық кіріспе жасаңыз.",
    ),
    actions: [
      T(
        "Определите сообщение и временной план до сборки.",
        "Define the message and timing before assembly.",
        "Жинаудан бұрын хабар мен уақытты анықтаңыз.",
      ),
      T(
        "Используйте собственные или разрешённые материалы.",
        "Use your own or licensed materials.",
        "Өз не рұқсатты материалыңызды қолданыңыз.",
      ),
      T(
        "Проверьте без звука, на телефоне и после экспорта; внесите одну правку по отзыву.",
        "Review silent, on a phone and after export; make one feedback-driven revision.",
        "Дыбыссыз, телефонда және экспорттан соң тексеріп, пікірге сай бір түзету жасаңыз.",
      ),
    ],
    deliverable: T(
      "Исходник, раскадровка, видео и заметка о правах на материалы.",
      "Source, storyboard, video and an asset-rights note.",
      "Түпнұсқа, кадр жоспары, бейне және материал құқығы жазбасы.",
    ),
    checks: [
      T(
        "Смысл понятен за один просмотр.",
        "The message reads in one viewing.",
        "Мағына бір қарағанда түсінікті.",
      ),
      T(
        "Есть стабильная пауза чтения.",
        "There is a stable reading hold.",
        "Оқуға тұрақты кідіріс бар.",
      ),
      T(
        "Экспорт просмотрен целиком.",
        "The full export was reviewed.",
        "Экспорт толық қаралған.",
      ),
    ],
    questions: [
      Q(
        T(
          "Зритель не успевает прочитать название. Что менять?",
          "Viewers cannot finish reading. What should change?",
          "Көрермен атауды оқып үлгермейді. Нені өзгерту керек?",
        ),
        [
          T(
            "Больше эффектов на буквах",
            "More letter effects",
            "Әріпке көп әсер",
          ),
          T(
            "Дольше читаемая пауза или короче текст",
            "Longer reading hold or shorter text",
            "Ұзағырақ оқу кідірісі не қысқа мәтін",
          ),
          T(
            "Только выше битрейт",
            "Only a higher bitrate",
            "Тек жоғары битрейт",
          ),
        ],
        1,
        T(
          "Проблема во времени и объёме информации, а не в кодировании.",
          "This is a timing and information-load problem, not encoding.",
          "Мәселе кодтауда емес, уақыт пен ақпарат көлемінде.",
        ),
      ),
      Q(
        T(
          "Зачем смотреть без звука?",
          "Why review without sound?",
          "Неге дыбыссыз қарайды?",
        ),
        [
          T(
            "Проверить самостоятельную ясность сообщения",
            "Test independent visual clarity",
            "Визуалды хабар айқындығын тексеру",
          ),
          T(
            "Навсегда удалить музыку",
            "Delete music forever",
            "Музыканы мәңгі жою",
          ),
          T(
            "Автоматически исправить цвет",
            "Automatically correct color",
            "Түсті автоматты түзету",
          ),
        ],
        0,
        T(
          "Звук усиливает ясное решение, но не должен скрывать путаницу.",
          "Audio strengthens clarity but should not hide confusion.",
          "Дыбыс айқындықты күшейтеді, бірақ шатасуды жасырмауы тиіс.",
        ),
      ),
      Q(
        T(
          "Что проверить после скачивания?",
          "What should be checked after download?",
          "Жүктегеннен соң нені тексеру керек?",
        ),
        [
          T("Только имя проекта", "Only the project name", "Тек жоба атауын"),
          T("Только первый кадр", "Only the first frame", "Тек алғашқы кадрды"),
          T(
            "Всё видео, звук, длительность и совместимость",
            "Whole video, audio, duration and compatibility",
            "Толық бейне, дыбыс, ұзақтық пен үйлесімділікті",
          ),
        ],
        2,
        T(
          "Предпросмотр не гарантирует корректность конечного файла.",
          "A preview does not prove the final file is correct.",
          "Алдын ала көрініс соңғы файл дұрыстығын кепілдемейді.",
        ),
      ),
    ],
    sources: [S.storyboard, S.output, S.animation],
    minutes: 55,
  }),
};
