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
export const locations: Location[] = [];

// Generate all Tumski locations based on available images
const tumskiLocationNames = {
  1: 'Тумский остров - Главный вход',
  2: 'Тумский остров - Площадь',
  3: 'Тумский остров - Прогулочная зона',
  4: 'Тумский остров - Вид на собор',
  5: 'Тумский остров - Садовая аллея',
  6: 'Тумский остров - Исторический центр',
  7: 'Тумский остров - Набережная',
  8: 'Тумский остров - Парковая зона',
  9: 'Тумский остров - Мемориальный комплекс',
  10: 'Тумский остров - Смотровая площадка',
  11: 'Тумский остров - Старинные здания',
  12: 'Тумский остров - Культурный центр',
  13: 'Тумский остров - Археологические раскопки',
  14: 'Тумский остров - Библиотечный сад',
  15: 'Тумский остров - Духовный центр',
  16: 'Тумский остров - Архитектурный ансамбль',
  17: 'Тумский остров - Историческая экспозиция',
  18: 'Тумский остров - Панорамный вид',
  19: 'Собор Святого Иоанна Крестителя',
  20: 'Тумский остров - Закатная панорама',
  22: 'Тумский остров - Северная часть',
  23: 'Тумский остров - Восточная набережная',
  24: 'Тумский остров - Южная площадь',
};

// Generate tumski locations
for (let i = 1; i <= 24; i++) {
  if (i === 21) continue; // Skip missing tumski_21.jpg

  const id = `tumski${i.toString().padStart(2, '0')}`;
  locations.push({
    id,
    name: tumskiLocationNames[i as keyof typeof tumskiLocationNames] || `Тумский остров ${i}`,
    coordinates: [20 + (i * 7) % 60, 20 + (i * 11) % 60],
    type: i === 19 ? 'cathedral' : 'main',
    audioTrack: i === 19 ? 'kostel' : (i === 21 ? 'hang' : 'town'),
    nextLocations: i === 1 ? ['tumski02', 'tumski03'] : i === 24 ? ['tumski23', 'tumski01'] : [`tumski${(i-1).toString().padStart(2, '0')}`, `tumski${(i+1).toString().padStart(2, '0')}`],
    hasQuest: [1, 19].includes(i),
  });
}

// Generate dwor locations (courtyards)
const dworNames = {
  1: 'Двор мастеров',
  2: 'Двор торговцев',
  3: 'Двор священников',
  4: 'Двор ремесленников',
  5: 'Двор стражников',
  6: 'Двор музыкантов',
  7: 'Двор писцов',
  8: 'Двор лекарей',
  9: 'Двор садоводов',
  10: 'Двор поваров',
  11: 'Двор строителей',
  12: 'Двор художников',
  13: 'Двор паломников',
};

for (let i = 1; i <= 13; i++) {
  const id = `dwor${i.toString().padStart(2, '0')}`;
  locations.push({
    id,
    name: dworNames[i as keyof typeof dworNames] || `Двор ${i}`,
    coordinates: [25 + (i * 6) % 50, 25 + (i * 8) % 50],
    type: 'dwor',
    audioTrack: 'town',
    nextLocations: ['tumski01'],
    hasQuest: false,
  });
}

// Generate ogrod locations (gardens)
const ogrodNames = {
  2: 'Сад роз',
  3: 'Сад трав',
  4: 'Сад фруктов',
  5: 'Сад цветов',
  6: 'Сад овощей',
  7: 'Сад лекарственных растений',
  8: 'Сад специй',
  9: 'Сад медитации',
  12: 'Сад воспоминаний',
  13: 'Сад молитв',
};

for (let i = 2; i <= 13; i++) {
  if (![2,3,4,5,6,7,8,9,12,13].includes(i)) continue; // Only available images

  const id = `ogrod${i.toString().padStart(2, '0')}`;
  locations.push({
    id,
    name: ogrodNames[i as keyof typeof ogrodNames] || `Сад ${i}`,
    coordinates: [30 + (i * 7) % 40, 35 + (i * 9) % 40],
    type: 'ogrod',
    audioTrack: 'birds',
    nextLocations: ['tumski01'],
    hasQuest: false,
  });
}

// Special location for hang music (tumski21 doesn't exist, but we can use a substitute)
locations.push({
  id: 'secret-place',
  name: 'Тайное место',
  coordinates: [90, 10],
  type: 'main',
  audioTrack: 'hang',
  nextLocations: ['tumski01'],
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