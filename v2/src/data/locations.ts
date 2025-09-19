// Location data for Tumski Island Virtual Tour

export interface Location {
  id: string;
  name: string;
  coordinates: [number, number]; // [x, y] relative to panorama image
  type: 'main' | 'cathedral' | 'dwor' | 'ogrod';
  audioTrack?: string;
  nextLocations?: string[];
  hasQuest?: boolean;
}

export interface LocationContent {
  [key: string]: {
    title: string;
    zones: {
      [key: string]: {
        title: string;
        text: string;
        audioUrl?: string;
      };
    };
  };
}

// Main locations on Tumski Island
export const locations: Location[] = [
  {
    id: 'tumski',
    name: 'Тумский остров',
    coordinates: [50, 50],
    type: 'main',
    audioTrack: 'town',
    nextLocations: ['cathedral-john', 'cathedral-cross', 'tumski-bridge'],
    hasQuest: false,
  },
  {
    id: 'cathedral-john',
    name: 'Собор Святого Иоанна Крестителя',
    coordinates: [35, 40],
    type: 'cathedral',
    audioTrack: 'kostel',
    nextLocations: ['tumski', 'cathedral-cross'],
    hasQuest: true,
  },
  {
    id: 'cathedral-cross',
    name: 'Соборная церковь Святого Креста',
    coordinates: [65, 35],
    type: 'cathedral',
    audioTrack: 'kostel',
    nextLocations: ['tumski', 'cathedral-john'],
    hasQuest: false,
  },
  {
    id: 'tumski-bridge',
    name: 'Тумский мост',
    coordinates: [20, 70],
    type: 'main',
    audioTrack: 'town',
    nextLocations: ['tumski'],
    hasQuest: false,
  },
  {
    id: 'jadwiga',
    name: 'Святая Ядвига',
    coordinates: [80, 60],
    type: 'main',
    audioTrack: 'quest',
    nextLocations: ['tumski'],
    hasQuest: true,
  },
];

// Generate dwor locations (courtyards)
for (let i = 1; i <= 13; i++) {
  const id = `dwor${i.toString().padStart(2, '0')}`;
  locations.push({
    id,
    name: `Двор ${i}`,
    coordinates: [20 + (i * 5) % 80, 30 + (i * 7) % 60],
    type: 'dwor',
    audioTrack: 'town',
    nextLocations: ['tumski'],
    hasQuest: false,
  });
}

// Generate ogrod locations (gardens)
for (let i = 2; i <= 13; i++) {
  const id = `ogrod${i.toString().padStart(2, '0')}`;
  locations.push({
    id,
    name: `Сад ${i}`,
    coordinates: [30 + (i * 6) % 70, 40 + (i * 8) % 50],
    type: 'ogrod',
    audioTrack: 'birds',
    nextLocations: ['tumski'],
    hasQuest: false,
  });
}

// Special location for hang music
locations.push({
  id: 'tumski21',
  name: 'Тайное место',
  coordinates: [90, 10],
  type: 'main',
  audioTrack: 'hang',
  nextLocations: ['tumski'],
  hasQuest: true,
});

// Content for locations (Russian as default)
export const locationContent: LocationContent = {
  tumski: {
    title: 'Тумский остров',
    zones: {
      zone1: {
        title: 'Сердце Вроцлава',
        text: 'Остров Тумский — это не просто место на карте, это живая история, которая дышит в каждом камне, в каждой арке соборов. Здесь, где Одра делает свой изящный поворот, зародился современный Вроцлав.',
      },
      zone2: {
        title: 'Первые поселения',
        text: 'В X веке здесь уже стояла деревянная крепость, защищавшая переправу через реку. Камни помнят топот копыт воинов, звон мечей и молитвы первых христиан.',
      },
    },
  },
  'cathedral-john': {
    title: 'Собор Святого Иоанна Крестителя',
    zones: {
      zone1: {
        title: 'Готическое величие',
        text: 'Собор св. Иоанна Крестителя возвышается над островом как каменный корабль, плывущий сквозь века. Его шпили пронзают небо, словно молитвы, превращённые в камень.',
      },
      zone2: {
        title: 'Николай Коперник',
        text: 'Здесь служил каноником великий Николай Коперник — человек, который остановил Солнце и сдвинул Землю. В этих стенах он не только молился, но и наблюдал за звёздами.',
      },
    },
  },
  'cathedral-cross': {
    title: 'Соборная церковь Святого Креста',
    zones: {
      zone1: {
        title: 'Двухэтажное чудо',
        text: 'Уникальная двухэтажная церковь: внизу — для простого народа, вверху — для знати. Архитектурное решение, которое отражало социальную структуру средневекового общества.',
      },
      zone2: {
        title: 'Святая Ядвига',
        text: 'Здесь покоятся мощи святой Ядвиги Силезской — покровительницы Силезии, женщины, которая посвятила свою жизнь служению Богу и людям.',
      },
    },
  },
  'tumski-bridge': {
    title: 'Тумский мост',
    zones: {
      zone1: {
        title: 'Мост влюблённых',
        text: 'Тумский мост — это не просто переправа, это символ соединения сердец. Тысячи замочков любви украшают его перила, каждый — обещание вечной верности.',
      },
    },
  },
  jadwiga: {
    title: 'Святая Ядвига',
    zones: {
      zone1: {
        title: 'Покровительница Силезии',
        text: 'Святая Ядвига Силезская — герцогиня, которая после смерти мужа посвятила жизнь служению бедным и обездоленным. Её статуя напоминает о том, что истинное величие — в служении другим.',
      },
    },
  },
};

// Audio tracks mapping
export const audioTracks = {
  town: '/audio/town.mp3',
  kostel: '/audio/kostel.mp3',
  birds: '/audio/birds.mp3',
  hang: '/audio/hang.mp3',
  quest: '/audio/quest.mp3',
} as const;

// Sound effects
export const soundEffects = {
  openBook: '/audio/opening-a-book.wav',
  step: '/audio/step.wav',
} as const;

export const getLocationById = (id: string): Location | undefined => {
  return locations.find(location => location.id === id);
};

export const getLocationContent = (id: string, language = 'ru') => {
  // For now, only Russian content is available
  // TODO: Add other languages
  return locationContent[id];
};