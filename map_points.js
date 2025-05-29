// Логика для отображения курсора mapmark.png на карте map.jpg
// Координаты точек указаны в процентах относительно размеров карты

const mapPoints = {
  1: { x: 9, y: 52},
  2: { x: 13, y: 44 },
  3: { x: 25, y: 34 },
  4: { x: 32, y: 36 },
  5: { x: 36, y: 46 },
  6: { x: 44, y: 56 },
  7: { x: 48, y: 66 },
  8: { x: 60, y: 66 },
  9: { x: 74, y: 62 },
  10: { x: 72, y: 50 },
  11: { x: 66, y: 46 },
  12: { x: 56, y: 46 },
  13: { x: 54, y: 60 },
  14: { x: 68, y: 38 },
  15: { x: 62, y: 30 },
  16: { x: 58, y: 36 },
  17: { x: 82, y: 18 },
  18: { x: 38, y: 86 },
  19: { x: 32, y: 88 },
  20: { x: 28, y: 40 },
};

// Координаты для всплывающих подсказок на карте
const tooltipPoints = {
  tumskiBridge: { x: 14, y: 56 },
  katedra: { x: 53, y: 72 },
  matka: { x: 48, y: 72 },
  sobor: { x: 30, y: 52 },
  jan: { x: 25, y: 57 },
  kostel: { x: 8, y: 65 },
  platan: { x: 68, y: 69 },
  ogrod: { x: 45, y: 90 },
  ogrodbot1: { x: 55, y: 23 },
  ogrodbot2: { x: 75, y: 23 },
  ogrodbot3: { x: 37, y: 41 },
  ogrodbot4: { x: 55, y: 30 },
  plackat: { x: 45, y: 72 },
  odra1: { x: 2, y: 10 },
  odra2: { x: 12, y: 40 },
  odra3: { x: 22, y: 90 },
  mlynski: { x: 5, y: 25 },
  panny: { x: 9, y: 56 },
  piasek: { x: 10, y: 76 },
  katedralna1: { x: 32, y: 70 },
  katedralna2: { x: 50, y: 76 },
  katedralna3: { x: 52, y: 64 },
  katedralna4: { x: 68, y: 64 },
  katedralna5: { x: 68, y: 74 },
  brama: { x: 60, y: 57 },
  kanonia: { x: 60, y: 45 },
  bramabot: { x: 55, y: 45 },
  kapitulna: { x: 50, y: 50 },
};


/**
 * Получить координаты точки по номеру
 * @param {number} pointNumber - номер точки (1-20)
 * @returns {{x: number, y: number} | null}
 */
export function getMapPointCoords(pointNumber) {
  return mapPoints[pointNumber] || null;
}

/**
 * Проверить, находится ли курсор в зоне всплывающей подсказки
 * @param {number} x - координата X курсора в процентах
 * @param {number} y - координата Y курсора в процентах
 * @returns {string | null} - ключ подсказки или null
 */
export function checkTooltipArea(x, y) {
  const tolerance = 5; // Допустимое отклонение в процентах
  
  for (const [key, coords] of Object.entries(tooltipPoints)) {
    if (
      Math.abs(x - coords.x) <= tolerance &&
      Math.abs(y - coords.y) <= tolerance
    ) {
      return key;
    }
  }
  
  return null;
}

// Пример использования:
// const coords = getMapPointCoords(5); // { x: 36, y: 46 } 