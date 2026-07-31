// ───────────────────────────────────────────────
//  Ключ и закрытая комната-«карман»
//  Эпик: E, F (tasks.md) · Фаза 2
//  Зависит от: config.js, gen/room.js, core/tomb.js
//  Заменяет: — (новая сущность)
// ───────────────────────────────────────────────
//
// Один ключ на уровень, найденный через видимую близкую награду (Эпик F): счётчик
// безопасных вскрытий именно в `tomb.keyRoomIndex`. Закрытая комната (Эпик E) — не
// ветка основного маршрута, а «карман» сбоку от `tomb.vaultRoomIndex` (последняя
// комната): открыл ключом — сходил в бонусную комнату без ловушек, вернулся туда же.

// Сброс состояния ключа/сокровищницы для новой попытки уровня (вызывать из startLevel)
function initKeyState(R){
  R.hasKey = false;
  R.vaultOpened = false;
  R.inBonus = false;
  R.bonusRoom = null;
  R.objective = { target: KEY_OBJECTIVE_TARGET, current: 0, done: false };
}

// Вызывать после каждого безопасного вскрытия клетки в ОСНОВНОЙ комнате (не в бонусной).
// Двигает счётчик, только если игрок сейчас в keyRoomIndex и ключ ещё не найден.
function noteSafeOpen(R){
  if(R.objective.done || R.tomb.currentRoomIndex !== R.tomb.keyRoomIndex) return;
  R.objective.current++;
  if(R.objective.current >= R.objective.target){
    R.objective.done = true;
    R.hasKey = true;
  }
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
