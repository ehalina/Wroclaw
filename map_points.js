// Логика для отображения курсора mapmark.png на карте map.jpg
// Координаты точек указаны в процентах относительно размеров карты

const mapPoints = {
  1: { x: 19, y: 32 },
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

/**
 * Получить координаты точки по номеру
 * @param {number} pointNumber - номер точки (1-20)
 * @returns {{x: number, y: number} | null}
 */
export function getMapPointCoords(pointNumber) {
  return mapPoints[pointNumber] || null;
}

// Пример использования:
// const coords = getMapPointCoords(5); // { x: 36, y: 46 } 