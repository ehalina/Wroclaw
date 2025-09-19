export interface QuestTask {
  id: number;
  title: string;
  description: string;
  image: string;
  backImage: string;
  backText: string;
  expectationText?: string;
  realityText?: string;
  isCompleted: boolean;
  locationId: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  intro: string;
  tasks: QuestTask[];
  backgroundImage: string;
  audioTrack: string;
}

export const quests: Quest[] = [
  {
    id: 'tumski_secrets',
    title: 'Квест 1: Найди все тайны Тумского острова',
    description: 'Откройте все секреты древнего острова',
    intro: 'Водяные краски были обнаружены на чердаке заброшенного дома. Несколько десятков. Листы пыльные, местами изъеденные временем или мышами (не знаю, кто из них был аккуратнее), но краски всё ещё живы — такие, что от запаха дождя на тёплом камне першит в горле, если смотреть слишком долго.\n\nАвтор? Неизвестен. Подпись неразборчива. Может быть, это имя. А может быть — координаты другой реальности.\n\nНа картинах — места. Улицы, люди, окна. Одинокий фонарщик у колонны. Башня с птицами на крыше. Всё странно знакомо. Как будто уже существовало где-то. Во сне? В книге? В той жизни, о которой мне забыли рассказать?\n\nНо теперь мне как-то нужно их найти. Все. Увидеть в реальности.\n\nХотя кто знает, что вообще реально?',
    backgroundImage: '/images/quests/quest.jpg',
    audioTrack: 'quest',
    tasks: [
      {
        id: 1,
        title: 'Загадочный лев',
        description: 'Найдите каменного льва у входа в собор',
        image: '/images/quests/watercolor/lev_02.jpg',
        backImage: '/images/quests/watercolor/lev.jpg',
        backText: 'В самом укромном уголке Тумского острова скрывается сад, где время течёт не по часам, а по дыханию воды и шороху листьев. Это не просто уголок природы — это место, где история и вера обретают форму в зелёных изгибах и старинных камнях. Этот тихий уголок — живой памятник, хранящий в себе дыхание веков и тишину молитвы.',
        expectationText: 'Ожидание:',
        realityText: 'Реальность:',
        isCompleted: false,
        locationId: 'tumski18'
      },
      {
        id: 2,
        title: 'Святой Ян Непомуцкий',
        description: 'Найдите статую святого у моста',
        image: '/images/quests/watercolor/3.jpg',
        backImage: '/images/quests/watercolor/oldcard.jpg',
        backText: 'История у сада длинная и многослойная. Когда-то здесь был строгий монастырский порядок: клумбы по линейке, кусты по уставу. Но годы прошли, и сад стал мудрее. Теперь он не возражает против лёгкого хаоса: травинки растут там, где им нравится, птицы устраивают концерты без расписания. И всё это — куда честнее, чем любая симфония по нотам.',
        isCompleted: false,
        locationId: 'tumski17'
      },
      {
        id: 3,
        title: 'Богоматерь с младенцем',
        description: 'Найдите скульптуру Богоматери',
        image: '/images/quests/watercolor/42.jpg',
        backImage: '/images/quests/watercolor/oldcard.jpg',
        backText: 'История у музея непростая: пережил войны, смену властей, перемены эпох. Он помнит, как его пытались разрушить, и как его снова поднимали. Это закалило его характер: теперь он смотрит на все человеческие страсти с мягкой иронией. «Ах, вы опять спорите о политике? Ну-ну. Давайте-ка лучше полюбуемся на гобелен XVII века, он всё равно умнее ваших дебатов».',
        isCompleted: false,
        locationId: 'tumski22'
      },
      {
        id: 4,
        title: 'Фонарщик',
        description: 'Найдите фонарщика на мосту',
        image: '/images/quests/watercolor/82.jpg',
        backImage: '/images/quests/watercolor/oldcard.jpg',
        backText: 'История? О, да! Она у нас общая и длинная. Викинги ходили по её волнам, торговцы тянулись караванами, короли и герцоги строили мосты, чтобы доказать: «Вот, мы сильнее стихии». Ха! Одра позволяла им так думать, но время от времени показывала зубы — чтобы не забывали, кто тут хозяйка.',
        isCompleted: false,
        locationId: 'tumski22'
      },
      {
        id: 5,
        title: 'Снаряд Второй мировой',
        description: 'Найдите следы войны в камнях',
        image: '/images/quests/watercolor/62.jpg',
        backImage: '/images/quests/watercolor/oldcard.jpg',
        backText: 'История у сада длинная и многослойная. Когда-то здесь был строгий монастырский порядок: клумбы по линейке, кусты по уставу. Но годы прошли, и сад стал мудрее. Теперь он не возражает против лёгкого хаоса: травинки растут там, где им нравится, птицы устраивают концерты без расписания. И всё это — куда честнее, чем любая симфония по нотам.',
        isCompleted: false,
        locationId: 'tumski13'
      },
      {
        id: 6,
        title: 'Камень Генрика',
        description: 'Найдите памятный камень',
        image: '/images/quests/watercolor/72.jpg',
        backImage: '/images/quests/watercolor/oldcard.jpg',
        backText: 'История у музея непростая: пережил войны, смену властей, перемены эпох. Он помнит, как его пытались разрушить, и как его снова поднимали. Это закалило его характер: теперь он смотрит на все человеческие страсти с мягкой иронией. «Ах, вы опять спорите о политике? Ну-ну. Давайте-ка лучше полюбуемся на гобелен XVII века, он всё равно умнее ваших дебатов».',
        isCompleted: false,
        locationId: 'tumski12'
      },
      {
        id: 7,
        title: 'Платан',
        description: 'Найдите древнее дерево',
        image: '/images/quests/watercolor/132.jpg',
        backImage: '/images/quests/watercolor/oldcard.jpg',
        backText: 'История? О, да! Она у нас общая и длинная. Викинги ходили по её волнам, торговцы тянулись караванами, короли и герцоги строили мосты, чтобы доказать: «Вот, мы сильнее стихии». Ха! Одра позволяла им так думать, но время от времени показывала зубы — чтобы не забывали, кто тут хозяйка.',
        isCompleted: false,
        locationId: 'tumski08'
      }
    ]
  }
];

export const getQuestById = (id: string): Quest | undefined => {
  return quests.find(quest => quest.id === id);
};

export const getQuestTasksByLocation = (locationId: string): QuestTask[] => {
  const quest = quests[0]; // Пока только один квест
  return quest.tasks.filter(task => task.locationId === locationId);
};
