// ───────────────────────────────────────────────
//  Ключ и закрытая комната-«карман»
//  Эпик: E (tasks.md) · Фаза 2
//  Зависит от: config.js, gen/room.js, core/tomb.js
//  Заменяет: — (новая сущность)
// ───────────────────────────────────────────────
//
// Ключ спрятан под случайной безопасной клеткой в `tomb.keyRoomIndex` (см.
// `gen/room.js: placeKey`) — игрок заранее не знает, есть ли в комнате ключ
// (concept.txt, «Что известно игроку»), находка — сюрприз при обычном тапе, не
// гарантированная награда за счётчик. Закрытая комната (Эпик E) — не ветка основного
// маршрута, а «карман» сбоку от `tomb.vaultRoomIndex` (последняя комната): открыл
// ключом — сходил в бонусную комнату без ловушек, вернулся туда же.

// Сброс состояния ключа/сокровищницы для новой попытки уровня (вызывать из startLevel)
function initKeyState(R){
  R.hasKey = false;
  R.vaultOpened = false;
  R.inBonus = false;
  R.bonusRoom = null;
}

// Открыть дверь сокровищницы (кнопка-баннер в vaultRoomIndex): нужен ключ, дверь ещё
// не открывалась, игрок физически в этой комнате
function openVault(R){
  if(!R.hasKey || R.vaultOpened || R.tomb.currentRoomIndex !== R.tomb.vaultRoomIndex) return;
  R.vaultOpened = true;
  R.inBonus = true;
  R.bonusRoom = newRoom(VAULT_SIZE, 0);
}

// Вернуться из бонусной комнаты в основную (та же комната, состояние сохранено)
function leaveVault(R){
  R.inBonus = false;
}
