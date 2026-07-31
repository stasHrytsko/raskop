// ───────────────────────────────────────────────
//  Модель гробницы — Tomb: список комнат, текущая комната, переходы
//  Эпик: A (tasks.md) · Фаза 1: строго ПОСЛЕДОВАТЕЛЬНЫЕ комнаты, без веток/дверей
//  Эпик: E (Фаза 2) — keyRoomIndex/vaultRoomIndex; закрытая комната остаётся «карманом»
//  сбоку от основной комнаты, не веткой основного маршрута (см. core/keys.js)
//  Зависит от: config.js, gen/room.js
//  Заменяет: S.field из старого game.js
// ───────────────────────────────────────────────

// Новая гробница уровня n: roomsFor(n) комнат по ROOM_SIZE/TRAPS_PER_ROOM.
// keyRoomIndex — случайная комната до последней (ключ должен быть найден раньше
// сокровищницы, иначе бесполезен — комнаты необратимо схлопываются). vaultRoomIndex —
// всегда последняя комната уровня.
function newTomb(n){
  const count = roomsFor(n);
  const rooms = Array.from({ length: count }, () => newRoom(ROOM_SIZE, TRAPS_PER_ROOM));
  const keyRoomIndex = Math.floor(Math.random() * (count - 1)); // 0..count-2
  return { rooms, currentRoomIndex: 0, keyRoomIndex, vaultRoomIndex: count - 1 };
}
