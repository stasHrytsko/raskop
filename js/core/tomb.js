// ───────────────────────────────────────────────
//  Модель гробницы — Tomb: список комнат, текущая комната, переходы
//  Эпик: A (tasks.md) · Фаза 1: строго ПОСЛЕДОВАТЕЛЬНЫЕ комнаты, без веток/дверей
//  Эпик: E (Фаза 2) — keyRoomIndex/vaultRoomIndex; закрытая комната остаётся «карманом»
//  сбоку от основной комнаты, не веткой основного маршрута (см. core/keys.js)
//  Эпик: I (Фаза 4) — один временный артефакт на гробницу, спрятан как ключ
//  Эпик: L (Фаза 5) — число комнат/включённость ключа и временного артефакта берутся
//  из CAMPAIGN[n] (content/campaign.js), не константа/всегда-включено
//  Зависит от: config.js, content/campaign.js, gen/room.js, content/artifacts-temp.js
//  Заменяет: S.field из старого game.js
// ───────────────────────────────────────────────

// Новая гробница уровня n: CAMPAIGN[n].roomCount комнат по ROOM_SIZE/TRAPS_PER_ROOM.
// Ключ/сокровищница и временный артефакт — только если включены тиром уровня
// (CAMPAIGN[n].keysEnabled/tempArtifactsEnabled); на ранних тирах их в гробнице нет
// вовсе, а не «есть, но недоступны» — индексы остаются -1, тот же приём, каким UI уже
// прячет баннер/панель при R.hasKey===false / R.tempArtifact===null.
// keyRoomIndex — случайная комната до последней (ключ должен быть найден раньше
// сокровищницы, иначе бесполезен — комнаты необратимо схлопываются). vaultRoomIndex —
// всегда последняя комната уровня. Временный артефакт (Эпик I) — тоже случайная
// комната до последней, независимо от keyRoomIndex (может совпасть — placeArtifact
// фильтрует только свободные 'gold'-клетки, коллизии с ключом не будет).
function newTomb(n){
  const entry = CAMPAIGN[n];
  const count = entry.roomCount;
  const rooms = Array.from({ length: count }, () => newRoom(ROOM_SIZE, TRAPS_PER_ROOM));

  let keyRoomIndex = -1;
  let vaultRoomIndex = -1;
  if(entry.keysEnabled){
    keyRoomIndex = Math.floor(Math.random() * (count - 1)); // 0..count-2
    placeKey(rooms[keyRoomIndex]);
    vaultRoomIndex = count - 1;
  }

  if(entry.tempArtifactsEnabled){
    const artifactRoomIndex = Math.floor(Math.random() * (count - 1)); // 0..count-2
    const artifactId = ARTIFACTS_TEMP[Math.random() * ARTIFACTS_TEMP.length | 0].id;
    placeArtifact(rooms[artifactRoomIndex], artifactId);
  }

  return { rooms, currentRoomIndex: 0, keyRoomIndex, vaultRoomIndex };
}
