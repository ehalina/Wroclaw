// Логика для отображения курсора mapmark.png на карте map.jpg
// Координаты точек указаны в процентах относительно размеров карты

const mapPoints = {
  1: { 
    desktop: { x: 9, y: 52 },
    mobile: { x: 7, y: 51 }
  },
  2: { 
    desktop: { x: 12, y: 62 },
    mobile: { x: 10, y: 61 }
  },
  3: { 
    desktop: { x: 18, y: 54 },
    mobile: { x: 16, y: 53 }
  },
  4: { 
    desktop: { x: 21, y: 55 },
    mobile: { x: 19, y: 54 }
  },
  5: { 
    desktop: { x: 29, y: 62 },
    mobile: { x: 27, y: 61 }
  },
  6: { 
    desktop: { x: 42, y: 69 },
    mobile: { x: 40, y: 68 }
  },
  7: { 
    desktop: { x: 48, y: 66 },
    mobile: { x: 46, y: 65 }
  },
  8: { 
    desktop: { x: 60, y: 66 },
    mobile: { x: 58, y: 65 }
  },
  9: { 
    desktop: { x: 74, y: 62 },
    mobile: { x: 72, y: 61 }
  },
  10: { 
    desktop: { x: 72, y: 50 },
    mobile: { x: 70, y: 49 }
  },
  11: { 
    desktop: { x: 46, y: 73 },
    mobile: { x: 44, y: 72 }
  },
  12: { 
    desktop: { x: 56, y: 46 },
    mobile: { x: 54, y: 45 }
  },
  13: { 
    desktop: { x: 54, y: 60 },
    mobile: { x: 52, y: 59 }
  },
  14: { 
    desktop: { x: 68, y: 38 },
    mobile: { x: 66, y: 37 }
  },
  15: { 
    desktop: { x: 46, y: 77 },
    mobile: { x: 44, y: 76 }
  },
  16: { 
    desktop: { x: 58, y: 36 },
    mobile: { x: 56, y: 35 }
  },
  17: { 
    desktop: { x: 28, y: 55 },
    mobile: { x: 26, y: 54 }
  },
  18: { 
    desktop: { x: 48, y: 70 },
    mobile: { x: 46, y: 69 }
  },
  19: { 
    desktop: { x: 52, y: 70 },
    mobile: { x: 50, y: 69 }
  },
  20: { 
    desktop: { x: 28, y: 40 },
    mobile: { x: 26, y: 39 }
  },
  21: { 
    desktop: { x: 45, y: 82 },
    mobile: { x: 43, y: 81 }
  },
  22: { 
    desktop: { x: 45, y: 86 },
    mobile: { x: 43, y: 85 }
  },
  23: { 
    desktop: { x: 42, y: 86 },
    mobile: { x: 40, y: 85 }
  },
  24: { 
    desktop: { x: 40, y: 90 },
    mobile: { x: 38, y: 89 }
  },
  25: { 
    desktop: { x: 38, y: 95 },
    mobile: { x: 36, y: 94 }
  },
  26: { 
    desktop: { x: 37, y: 92 },
    mobile: { x: 35, y: 91 }
  },
  27: { 
    desktop: { x: 41, y: 94 },
    mobile: { x: 39, y: 93 }
  },
  28: { 
    desktop: { x: 53, y: 75 },
    mobile: { x: 51, y: 74 }
  },
  29: { 
    desktop: { x: 73, y: 75 },
    mobile: { x: 71, y: 74 }
  },
  30: { 
    desktop: { x: 48, y: 65 },
    mobile: { x: 46, y: 64 }
  },
  31: { 
    desktop: { x: 55, y: 60 },
    mobile: { x: 53, y: 59 }
  },
  32: { 
    desktop: { x: 61, y: 59 },
    mobile: { x: 59, y: 58 }
  },
  33: { 
    desktop: { x: 61, y: 74 },
    mobile: { x: 59, y: 73 }
  },
  34: { 
    desktop: { x: 59, y: 58 },
    mobile: { x: 57, y: 57 }
  },
  35: { 
    desktop: { x: 52, y: 53 },
    mobile: { x: 50, y: 52 }
  },
  36: { 
    desktop: { x: 52, y: 41 },
    mobile: { x: 50, y: 40 }
  },
  37: { 
    desktop: { x: 57, y: 40 },
    mobile: { x: 55, y: 39 }
  },
  38: { 
    desktop: { x: 58, y: 47 },
    mobile: { x: 56, y: 46 }
  },
  39: { 
    desktop: { x: 59, y: 55 },
    mobile: { x: 57, y: 54 }
  },
  40: { 
    desktop: { x: 59, y: 59 },
    mobile: { x: 57, y: 58 }
  },
};

// Координаты для всплывающих подсказок на карте
export const tooltipPoints = {
  tumskiBridge: { 
    desktop: { x: 14, y: 56 },
    tablet: { x: 14, y: 56 },
    mobile: { x: 16, y: 58 }
  },
  katedra: { 
    desktop: { x: 53, y: 72 },
    tablet: { x: 53, y: 72 },
    mobile: { x: 53, y: 72 }
  },
  matka: { 
    desktop: { x: 48, y: 72 },
    tablet: { x: 48, y: 72 },
    mobile: { x: 48, y: 72 }
  },
  sobor: { 
    desktop: { x: 30, y: 52 },
    tablet: { x: 30, y: 52 },
    mobile: { x: 30, y: 52 }
  },
  jan: { 
    desktop: { x: 25, y: 57 },
    tablet: { x: 25, y: 57 },
    mobile: { x: 25, y: 57 }
  },
  kostel: { 
    desktop: { x: 8, y: 65 },
    tablet: { x: 8, y: 65 },
    mobile: { x: 8, y: 65 }
  },
  platan: { 
    desktop: { x: 68, y: 69 },
    tablet: { x: 68, y: 69 },
    mobile: { x: 68, y: 69 }
  },
  ogrod: { 
    desktop: { x: 45, y: 90 },
    tablet: { x: 45, y: 90 },
    mobile: { x: 40, y: 90 }
  },
  ogrodbot1: { 
    desktop: { x: 55, y: 23 },
    tablet: { x: 55, y: 23 },
    mobile: { x: 55, y: 23 }
  },
  plackat: { 
    desktop: { x: 45, y: 72 },
    tablet: { x: 45, y: 72 },
    mobile: { x: 55, y: 70 }
  },
  odra2: { 
    desktop: { x: 12, y: 40 },
    tablet: { x: 12, y: 40 },
    mobile: { x: 10, y: 44 }
  },
  mlynski: { 
    desktop: { x: 5, y: 25 },
    tablet: { x: 5, y: 25 },
    mobile: { x: 5, y: 32 }
  },
  panny: { 
    desktop: { x: 9, y: 56 },
    tablet: { x: 9, y: 56 },
    mobile: { x: 9, y: 60 }
  },
  piasek: { 
    desktop: { x: 10, y: 76 },
    tablet: { x: 10, y: 76 },
    mobile: { x: 10, y: 79 }
  },
  katedralna1: { 
    desktop: { x: 32, y: 70 },
    tablet: { x: 32, y: 70 },
    mobile: { x: 32, y: 70 }
  },
  brama: { 
    desktop: { x: 60, y: 57 },
    tablet: { x: 60, y: 62 },
    mobile: { x: 60, y: 62 }
  },
  kanonia: { 
    desktop: { x: 60, y: 45 },
    tablet: { x: 60, y: 45 },
    mobile: { x: 55, y: 45 }
  },
  bramabot: { 
    desktop: { x: 55, y: 45 },
    tablet: { x: 55, y: 45 },
    mobile: { x: 51, y: 45 }
  },
  kapitulna: { 
    desktop: { x: 50, y: 50 },
    tablet: { x: 50, y: 50 },
    mobile: { x: 50, y: 55 }
  },
};


/**
 * Получить координаты точки по номеру
 * @param {number} pointNumber - номер точки (1-20)
 * @returns {{x: number, y: number} | null}
 */
export function getMapPointCoords(pointNumber) {
  const point = mapPoints[pointNumber];
  if (!point) return null;
  
  // Определяем тип устройства
  const isMobile = window.innerWidth <= 768;
  
  // Возвращаем соответствующие координаты
  return isMobile ? point.mobile : point.desktop;
}

/**
 * Проверить, находится ли курсор в зоне всплывающей подсказки
 * @param {number} x - координата X курсора в процентах
 * @param {number} y - координата Y курсора в процентах
 * @returns {string | null} - ключ подсказки или null
 */
export function checkTooltipArea(x, y) {
  const tolerance = 5; // Допустимое отклонение в процентах
  
  // Определяем тип устройства
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.matchMedia('(hover: none) and (pointer: coarse) and (min-width: 768px)').matches;
  
  let deviceType;
  if (isMobile) {
    deviceType = 'mobile';
  } else if (isTablet) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }
  
  for (const [key, coords] of Object.entries(tooltipPoints)) {
    const deviceCoords = coords[deviceType] || coords.desktop; // fallback к desktop
    if (
      Math.abs(x - deviceCoords.x) <= tolerance &&
      Math.abs(y - deviceCoords.y) <= tolerance
    ) {
      return key;
    }
  }
  
  return null;
}

// Пример использования:
// const coords = getMapPointCoords(5); // { x: 36, y: 46 } 