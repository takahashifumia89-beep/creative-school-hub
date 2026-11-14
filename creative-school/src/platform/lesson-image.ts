import type { LessonMaterial } from "./lesson-types";
import { M, T, Q, sources as S } from "./lesson-builder";
export const imageLessons: Record<string, LessonMaterial> = {
  "img-1": M({
    goal: T(
      "Организовать обработку так, чтобы сохранялся путь к оригиналу.",
      "Organize editing so the original remains recoverable.",
      "Өңдеуде түпнұсқаға қайту жолын сақтау.",
    ),
    principle: T(
      "Неразрушающий подход хранит исходник отдельно от решения об обработке. Настройки можно менять, а экспорт — производная копия. Отмена последнего шага полезна, но не заменяет сохранённый оригинал: история может исчезнуть после закрытия приложения. Файл проекта без доступного исходного изображения также не гарантирует восстановление.",
      "A non-destructive workflow separates the source from editing decisions. Settings remain adjustable and an export is a derived copy. Undo helps but does not replace the original: history may disappear after closing an app. A settings file without its source image also does not guarantee recovery.",
      "Бұзбай өңдеу түпнұсқаны өңдеу шешімінен бөлек сақтайды. Баптауды өзгертуге болады, экспорт — туынды көшірме. Болдырмау пайдалы, бірақ түпнұсқаны алмастырмайды: қолданба жабылса тарих жоғалуы мүмкін. Бастапқы суретсіз баптау файлы да қалпына келуді кепілдемейді.",
    ),
    method: T(
      "Сделайте рабочую копию, задайте понятное имя и сохраните источник отдельно. Сначала исправляйте кадр и общий тон, затем стилизацию. Периодически сравнивайте с исходником и проверяйте итог в фактическом размере. Браузерные данные могут очищаться: для переноса между устройствами сохраняйте исходник, настройки и экспорт вместе.",
      "Make a working copy, name it clearly and keep the source separately. Correct framing and overall tone before styling. Compare with the original and review at delivery size. Browser storage can be cleared: for transfer keep source, settings and export together.",
      "Жұмыс көшірмесін жасап, анық атау беріп, түпнұсқаны бөлек сақтаңыз. Стильге дейін кадр мен жалпы реңкті түзетіңіз. Бастапқымен салыстырып, нақты өлшемде тексеріңіз. Браузер жады тазалануы мүмкін: құрылғы ауыстыруға түпнұсқа, баптау мен экспортты бірге сақтаңыз.",
    ),
    example: T(
      "Фотография изделия готовится для каталога и социальных сетей.",
      "A product photograph is prepared for a catalog and social post.",
      "Бұйым суреті каталог пен әлеуметтік желіге дайындалады.",
    ),
    steps: [
      T(
        "Сохраните original.jpg и создайте отдельный рабочий проект.",
        "Keep original.jpg and create a separate working project.",
        "original.jpg сақтап, бөлек жұмыс жобасын жасаңыз.",
      ),
      T(
        "Сделайте нейтральную коррекцию, затем отдельную стилизованную версию.",
        "Create a neutral correction, then a separate stylized version.",
        "Бейтарап түзету, кейін бөлек стильді нұсқа жасаңыз.",
      ),
      T(
        "Экспортируйте версии с разными именами и откройте проект повторно.",
        "Export with distinct names and reopen the project.",
        "Бөлек атаумен экспорттап, жобаны қайта ашыңыз.",
      ),
    ],
    result: T(
      "Можно изменить стиль без поиска утраченного оригинала; повторное открытие проверяет реальную сохранность.",
      "Styling can be changed without recovering a lost source; reopening tests actual persistence.",
      "Жоғалған түпнұсқаны іздемей стильді өзгертуге болады; қайта ашу сақталуды тексереді.",
    ),
    practice: T(
      "Подготовьте нейтральную и творческую версии одного собственного снимка.",
      "Prepare neutral and creative versions of one owned photograph.",
      "Өз суретіңіздің бейтарап және шығармашылық нұсқасын жасаңыз.",
    ),
    actions: [
      T(
        "Создайте папку источника, проекта и экспортов.",
        "Create source, project and export folders.",
        "Түпнұсқа, жоба және экспорт бумаларын жасаңыз.",
      ),
      T(
        "Запишите порядок коррекций и сравните с оригиналом.",
        "Record adjustment order and compare with the original.",
        "Түзету ретін жазып, түпнұсқамен салыстырыңыз.",
      ),
      T(
        "Закройте и откройте проект, проверив наличие исходника.",
        "Reopen the project and check source availability.",
        "Жобаны қайта ашып, түпнұсқа барын тексеріңіз.",
      ),
    ],
    deliverable: T(
      "Оригинал, настройки, две версии PNG и заметка о восстановлении.",
      "Original, settings, two PNG versions and recovery notes.",
      "Түпнұсқа, баптау, екі PNG және қалпына келу жазбасы.",
    ),
    checks: [
      T(
        "Экспорт не перезаписывает единственный исходник.",
        "Export does not overwrite the only original.",
        "Экспорт жалғыз түпнұсқаны қайта жазбайды.",
      ),
      T(
        "Повторное открытие проверено.",
        "Reopening has been tested.",
        "Қайта ашу тексерілген.",
      ),
    ],
    questions: [
      Q(
        T(
          "Что является надёжным комплектом для переноса проекта?",
          "What is a reliable transfer package?",
          "Жобаны тасымалдауға қай жинақ сенімді?",
        ),
        [
          T(
            "Только скриншот ползунков",
            "Only a slider screenshot",
            "Тек жүгірткі суреті",
          ),
          T(
            "Только история Undo в открытой вкладке",
            "Only Undo history in an open tab",
            "Тек ашық терезедегі Undo тарихы",
          ),
          T(
            "Исходник, настройки и экспорт",
            "Source, settings and export",
            "Түпнұсқа, баптау және экспорт",
          ),
        ],
        2,
        T(
          "Настройкам нужен доступный источник, а экспорт показывает итоговую версию.",
          "Settings need their source; export records the delivered result.",
          "Баптауға түпнұсқа қажет, экспорт соңғы нәтижені көрсетеді.",
        ),
      ),
      Q(
        T(
          "Почему Undo не заменяет резервную копию?",
          "Why is Undo not a backup?",
          "Undo неге резервтік көшірме емес?",
        ),
        [
          T(
            "История может не сохраниться после закрытия",
            "History may not survive closing",
            "Жабылған соң тарих сақталмауы мүмкін",
          ),
          T(
            "Undo всегда ухудшает качество",
            "Undo always reduces quality",
            "Undo әрқашан сапаны түсіреді",
          ),
          T(
            "Undo меняет лицензию",
            "Undo changes the license",
            "Undo лицензияны өзгертеді",
          ),
        ],
        0,
        T(
          "История действий и долговременное хранение — разные механизмы.",
          "Action history and durable storage are different mechanisms.",
          "Әрекет тарихы мен ұзақ сақтау — бөлек механизм.",
        ),
      ),
      Q(
        T(
          "Что обычно делать раньше стилизации?",
          "What usually comes before styling?",
          "Стильден бұрын әдетте не жасалады?",
        ),
        [
          T("Удалить оригинал", "Delete the original", "Түпнұсқаны жою"),
          T(
            "Исправить кадр и общий тон",
            "Correct framing and overall tone",
            "Кадр мен жалпы реңкті түзету",
          ),
          T(
            "Случайно усилить все эффекты",
            "Maximize random effects",
            "Кездейсоқ әсерді күшейту",
          ),
        ],
        1,
        T(
          "Базовая коррекция создаёт проверяемую отправную точку.",
          "Basic correction creates a testable starting point.",
          "Негізгі түзету тексерілетін бастапқы нүкте жасайды.",
        ),
      ),
    ],
    sources: [S.color, S.crop],
    minutes: 45,
  }),
  "img-2": M({
    goal: T(
      "Выбрать кадр и размер без растяжения и потери смысла.",
      "Choose framing and dimensions without stretching or losing meaning.",
      "Созбай және мағынасын жоғалтпай кадр мен өлшем таңдау.",
    ),
    principle: T(
      "Кадрирование меняет видимую область, масштабирование — число выходных пикселей. Соотношение сторон определяет форму, а не разрешение: 1600×900 и 1280×720 имеют одинаковые 16:9. Увеличение маленького изображения не создаёт отсутствующих деталей. Выбирайте область под сюжет и место публикации.",
      "Cropping changes the visible area; resizing changes output pixels. Aspect ratio defines shape, not resolution: 1600×900 and 1280×720 are both 16:9. Enlarging a small image does not create missing detail. Choose framing for the subject and destination.",
      "Қию көрінетін аймақты, өлшем өзгерту шығатын пиксель санын өзгертеді. Арақатынас ажыратымдылық емес, пішінді анықтайды: 1600×900 және 1280×720 екеуі де 16:9. Кішкентай суретті үлкейту жоқ детальды жасамайды. Кадрды сюжет пен жариялау орнына сай таңдаңыз.",
    ),
    method: T(
      "Сначала выберите соотношение сторон, затем расположение предмета и свободное пространство. Проверьте края кадра: случайно обрезанный смысловой объект может изменить сообщение. Только после этого задавайте выходной размер с сохранением пропорций. Просматривайте экспорт в реальном размере, особенно мелкие детали и текст.",
      "Choose aspect ratio, subject placement and negative space first. Inspect edges: cutting a meaningful object can change the message. Then set output size while preserving proportions. Review the export at actual size, especially small details and text.",
      "Алдымен арақатынас, нысан орны мен бос кеңістікті таңдаңыз. Кадр жиегін тексеріңіз: маңызды нысанды кездейсоқ қию хабарды өзгертеді. Кейін пропорцияны сақтап шығыс өлшемін беріңіз. Экспортты, әсіресе ұсақ деталь мен мәтінді нақты өлшемде қараңыз.",
    ),
    example: T(
      "Из снимка 4000×3000 нужна обложка 1600×900.",
      "A 4000×3000 image must become a 1600×900 cover.",
      "4000×3000 суреттен 1600×900 мұқаба керек.",
    ),
    steps: [
      T(
        "Выберите область 16:9, сохранив главный объект.",
        "Choose a 16:9 area preserving the subject.",
        "Негізгі нысанды сақтап, 16:9 аймақ таңдаңыз.",
      ),
      T(
        "Уменьшите выбранный кадр до ширины 1600 и высоты 900.",
        "Resize the crop to 1600 wide and 900 high.",
        "Қиылған кадрды 1600 ені мен 900 биіктігіне азайтыңыз.",
      ),
      T(
        "Проверьте края и читаемость при масштабе 100%.",
        "Check edges and readability at 100%.",
        "Жиек пен оқылуды 100% масштабта тексеріңіз.",
      ),
    ],
    result: T(
      "Получен нужный формат без деформации предмета.",
      "The required format is delivered without distorting the subject.",
      "Нысанды бұзбай қажет пішім алынады.",
    ),
    practice: T(
      "Подготовьте один снимок для квадрата 1:1 и обложки 16:9.",
      "Prepare one image as a 1:1 square and 16:9 cover.",
      "Бір суретті 1:1 шаршы және 16:9 мұқаба етіп дайындаңыз.",
    ),
    actions: [
      T(
        "Определите, какую деталь нельзя потерять.",
        "Identify the detail that must remain.",
        "Жоғалмауы тиіс детальды анықтаңыз.",
      ),
      T(
        "Сделайте разные кадры, не растягивая изображение.",
        "Create separate crops without stretching.",
        "Суретті созбай бөлек кадр жасаңыз.",
      ),
      T(
        "Запишите выходные размеры и сравните экспорты.",
        "Record output dimensions and compare exports.",
        "Шығыс өлшемдерін жазып, экспорттарды салыстырыңыз.",
      ),
    ],
    deliverable: T(
      "Два PNG с размерами и краткое обоснование кадра.",
      "Two dimensioned PNGs and framing rationale.",
      "Өлшемі жазылған екі PNG және кадр негіздемесі.",
    ),
    checks: [
      T(
        "Пропорции предмета сохранены.",
        "Subject proportions are preserved.",
        "Нысан пропорциясы сақталған.",
      ),
      T(
        "Смысловая деталь не обрезана.",
        "The meaningful detail is not cropped out.",
        "Мағыналы деталь қиылмаған.",
      ),
    ],
    questions: [
      Q(
        T(
          "Что меняет кадрирование?",
          "What does cropping change?",
          "Қию нені өзгертеді?",
        ),
        [
          T(
            "Видимую область изображения",
            "The visible image area",
            "Көрінетін сурет аймағын",
          ),
          T("Авторское право", "Copyright ownership", "Авторлық құқықты"),
          T("Частоту кадров", "Frame rate", "Кадр жиілігін"),
        ],
        0,
        T(
          "Кадрирование выбирает часть изображения; размер экспорта задаётся отдельно.",
          "Cropping selects an area; output size is a separate decision.",
          "Қию аймақты таңдайды; экспорт өлшемі бөлек шешіледі.",
        ),
      ),
      Q(
        T(
          "Какая высота нужна при ширине 1600 для 16:9?",
          "What height matches 1600 width at 16:9?",
          "16:9 үшін ені 1600 болса биіктігі қандай?",
        ),
        [
          T("1600", "1600", "1600"),
          T("900", "900", "900"),
          T("3000", "3000", "3000"),
        ],
        1,
        T(
          "Высота = ширина ÷ 16 × 9: 1600 ÷ 16 × 9 = 900 пикселей. Так сохраняется соотношение сторон 16:9.",
          "Height = width ÷ 16 × 9: 1600 ÷ 16 × 9 = 900 pixels. This preserves the 16:9 aspect ratio.",
          "Биіктік = ен ÷ 16 × 9: 1600 ÷ 16 × 9 = 900 пиксель. Осылайша 16:9 арақатынасы сақталады.",
        ),
      ),
      Q(
        T(
          "Что даёт увеличение маленького растра?",
          "What does enlarging a small raster do?",
          "Кішкентай растрды үлкейту не істейді?",
        ),
        [
          T(
            "Всегда восстанавливает реальные детали",
            "Always restores real detail",
            "Нақты детальды әрқашан қайтарады",
          ),
          T(
            "Снимает ограничения лицензии",
            "Removes license limits",
            "Лицензия шегін жояды",
          ),
          T(
            "Увеличивает размер, но не гарантирует новую детализацию",
            "Increases size without guaranteeing new detail",
            "Өлшемді арттырады, жаңа детальды кепілдемейді",
          ),
        ],
        2,
        T(
          "Интерполяция не равна восстановлению информации, которой в исходнике нет.",
          "Interpolation is not recovery of information absent from the source.",
          "Интерполяция түпнұсқада жоқ ақпаратты қалпына келтіру емес.",
        ),
      ),
    ],
    sources: [S.crop],
    minutes: 45,
  }),
  "img-3": M({
    goal: T(
      "Различать яркость, контраст и насыщенность и проверять потери деталей.",
      "Distinguish brightness, contrast and saturation and inspect lost detail.",
      "Жарықтық, контраст пен қанықтықты ажыратып, деталь жоғалуын тексеру.",
    ),
    principle: T(
      "Яркость сдвигает воспринимаемую светлоту, контраст усиливает различия тонов, насыщенность меняет интенсивность цвета. Эти ручки не взаимозаменяемы. Сильная коррекция может превратить светлую фактуру в сплошное белое пятно, а тени — в чёрное. Приятная миниатюра ещё не означает качественный экспорт.",
      "Brightness changes perceived lightness, contrast separates tones and saturation changes color intensity. They are not interchangeable. Strong adjustments can turn highlight texture into solid white and shadows into black. An attractive thumbnail is not proof of a good export.",
      "Жарықтық ашықтықты, контраст реңк айырмасын, қанықтық түс қарқынын өзгертеді. Олар бірін-бірі алмастырмайды. Күшті түзету ашық текстураны ақ даққа, көлеңкені қараға айналдырады. Әдемі кіші көрініс сапалы экспортты дәлелдемейді.",
    ),
    method: T(
      "Меняйте один параметр за раз и сравнивайте с оригиналом. Следите за нейтральными участками, кожей и деталями в светах/тенях. Глобальные яркость и контраст грубее Levels/Curves в полноценных редакторах, которые позволяют отдельно управлять диапазонами. Не обещайте восстановление данных, уже отсутствующих в JPEG.",
      "Change one parameter at a time and compare with the original. Inspect neutral areas, skin and highlight/shadow detail. Global brightness and contrast are less selective than Levels/Curves in full editors. Do not promise to recover data already absent from a JPEG.",
      "Бір уақытта бір параметрді өзгертіп, түпнұсқамен салыстырыңыз. Бейтарап аймақ, тері және жарық/көлеңке деталін бақылаңыз. Жалпы жарықтық пен контраст толық редактордағы диапазонды бөлек басқаратын Levels/Curves-тен дөрекі. JPEG-де жоқ деректі қалпына келтіруді уәде етпеңіз.",
    ),
    example: T(
      "Снимок светлой керамики выглядит плоским.",
      "A photograph of light ceramic looks flat.",
      "Ашық керамика суреті жалпақ көрінеді.",
    ),
    steps: [
      T(
        "Немного увеличьте контраст, наблюдая светлую фактуру.",
        "Increase contrast slightly while watching highlight texture.",
        "Ашық текстураны бақылай отырып контрастты аздап арттырыңыз.",
      ),
      T(
        "Если фактура исчезла, уменьшите коррекцию, а не добавляйте насыщенность.",
        "If texture disappears, reduce the adjustment rather than adding saturation.",
        "Текстура жоғалса қанықтық қоспай, түзетуді азайтыңыз.",
      ),
      T(
        "Сравните нейтральную и стилизованную версии в одинаковом размере.",
        "Compare neutral and styled versions at the same size.",
        "Бейтарап және стильді нұсқаны бір өлшемде салыстырыңыз.",
      ),
    ],
    result: T(
      "Предмет выразительнее, но его материал и детали остаются различимы.",
      "The subject gains definition while material and detail remain visible.",
      "Нысан айқындалады, бірақ материал мен деталь ажыратылады.",
    ),
    practice: T(
      "Сделайте три умеренных варианта коррекции одного снимка и выберите один.",
      "Make three restrained corrections of one image and choose one.",
      "Бір суреттің үш ұстамды түзетуін жасап, біреуін таңдаңыз.",
    ),
    actions: [
      T(
        "В каждом варианте измените только один основной параметр.",
        "Change one main parameter per version.",
        "Әр нұсқада бір негізгі параметрді өзгертіңіз.",
      ),
      T(
        "Проверьте светлую и тёмную фактуру при 100%.",
        "Inspect highlight and shadow texture at 100%.",
        "Ашық және қараңғы текстураны 100% тексеріңіз.",
      ),
      T(
        "Запишите, что улучшилось и что потеряно.",
        "Record improvements and losses.",
        "Жақсарғаны мен жоғалғанын жазыңыз.",
      ),
    ],
    deliverable: T(
      "Три варианта, оригинал и таблица сравнения.",
      "Three variants, original and comparison table.",
      "Үш нұсқа, түпнұсқа және салыстыру кестесі.",
    ),
    checks: [
      T(
        "Основные детали сохранились в светах и тенях.",
        "Important highlight and shadow details remain.",
        "Маңызды жарық пен көлеңке деталі сақталған.",
      ),
      T(
        "Цвет не усилен без связи с задачей.",
        "Color intensity supports the goal.",
        "Түс қарқыны міндетке сай.",
      ),
    ],
    questions: [
      Q(
        T(
          "Что меняет насыщенность?",
          "What does saturation change?",
          "Қанықтық нені өзгертеді?",
        ),
        [
          T("Размер в пикселях", "Pixel dimensions", "Пиксель өлшемін"),
          T("Интенсивность цвета", "Color intensity", "Түс қарқындылығын"),
          T("Соотношение сторон", "Aspect ratio", "Жақтар арақатынасын"),
        ],
        1,
        T(
          "Насыщенность относится к цвету, не геометрии изображения.",
          "Saturation concerns color rather than image geometry.",
          "Қанықтық сурет геометриясына емес, түсіне қатысты.",
        ),
      ),
      Q(
        T(
          "После сильного контраста пропала светлая фактура. Что сделать первым?",
          "Highlight texture vanished after strong contrast. What comes first?",
          "Күшті контрасттан ашық текстура жоғалды. Алдымен не істеу керек?",
        ),
        [
          T(
            "Добавить ещё насыщенности",
            "Add more saturation",
            "Қанықтықты тағы арттыру",
          ),
          T("Удалить оригинал", "Delete the original", "Түпнұсқаны жою"),
          T(
            "Ослабить коррекцию и сравнить с исходником",
            "Reduce adjustment and compare with the source",
            "Түзетуді азайтып, түпнұсқамен салыстыру",
          ),
        ],
        2,
        T(
          "Первым проверяют, не вызвана ли потеря деталей самой обработкой.",
          "First determine whether the adjustment caused the loss.",
          "Алдымен жоғалуға түзетудің өзі себеп болғанын тексеріңіз.",
        ),
      ),
      Q(
        T(
          "Зачем менять один параметр за раз?",
          "Why adjust one parameter at a time?",
          "Параметрді неге бір-бірден өзгертеді?",
        ),
        [
          T(
            "Чтобы понять причину изменения",
            "To understand cause and effect",
            "Өзгеріс себебін түсіну үшін",
          ),
          T(
            "Чтобы отключить сохранение",
            "To disable saving",
            "Сақтауды өшіру үшін",
          ),
          T(
            "Чтобы любая фотография стала чёрно-белой",
            "To make every image grayscale",
            "Барлық фотоны ақ-қара ету үшін",
          ),
        ],
        0,
        T(
          "Так легче отличить полезную коррекцию от побочного эффекта.",
          "This separates useful correction from side effects.",
          "Бұл пайдалы түзетуді жанама әсерден ажыратады.",
        ),
      ),
    ],
    sources: [S.brightness, S.color],
    minutes: 50,
  }),
};
