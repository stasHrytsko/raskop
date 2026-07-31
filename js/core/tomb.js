// ───────────────────────────────────────────────
//  Модель гробницы — Tomb: список комнат, текущая комната, переходы
//  Эпик: A (tasks.md) · Фаза 1: строго ПОСЛЕДОВАТЕЛЬНЫЕ комнаты, без веток/дверей
//  (ветвление и ключи — Эпик E, Фаза 2)
//  Зависит от: config.js, gen/room.js
//  Заменяет: S.field из старого game.js
// ───────────────────────────────────────────────

// Новая гробница уровня n: roomsFor(n) комнат по ROOM_SIZE/TRAPS_PER_ROOM
function newTomb(n){
  const count = roomsFor(n);
  const rooms = Array.from({ length: count }, () => newRoom(ROOM_SIZE, TRAPS_PER_ROOM));
  return { rooms, currentRoomIndex: 0 };
}
