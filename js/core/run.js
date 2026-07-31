// ───────────────────────────────────────────────
//  Попытка уровня — тап по клетке, переход между комнатами, победа/провал
//  Эпик: O (базовый цикл; кошелёк/перенос золота в метавалюту — Эпик G, Фаза 3)
//  Эпик: E (Фаза 2) — ключ спрятан под случайной клеткой; тап маршрутизируется в
//  бонусную комнату, пока R.inBonus
//  Зависит от: config.js, gen/rules.js, gen/room.js, core/tomb.js, core/economy.js,
//  core/keys.js
//  Заменяет: startLevel/nextDive/tap/onTrap/endDive/clearLevel/runOver из старого game.js
// ───────────────────────────────────────────────
let progress = { current: 0, cleared: 0 };  // прогресс кампании (localStorage)
let R = null;                                // текущая попытка уровня (гробница)

// ─── прогресс кампании ───
function loadProgress(){
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    if(raw && typeof raw.current === 'number') progress = raw;
  } catch(e){}
}
function saveProgress(){ try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch(e){} }
function resetProgress(){ progress = { current: 0, cleared: 0 }; saveProgress(); R = null; }

// ─── текущая комната попытки ───
function curRoom(){ return R.tomb.rooms[R.tomb.currentRoomIndex]; }
function isLastRoom(){ return R.tomb.currentRoomIndex >= R.tomb.rooms.length - 1; }

// ─── старт уровня n (0-индекс): новая гробница с нуля ───
function startLevel(n){
  progress.current = n;
  saveProgress();
  R = { level: n, quota: quotaFor(n), gold: 0, tomb: newTomb(n), live: true };
  initKeyState(R);
  renderRoom();
}

// ─── тап по закрытой клетке: основная комната, либо бонусная (R.inBonus) ───
function tap(i){
  if(!R.live) return;
  if(R.inBonus) return tapBonus(i);

  const rm = curRoom();
  const cell = rm.cells[i];
  if(cell.open) return;

  // Первый тап в комнате — честный старт (0 ловушек среди соседей)
  if(!rm.firstTapDone){ clearStart(rm.cells, i, rm.size); rm.firstTapDone = true; }
  cell.open = true;

  if(cell.type === 'trap') return onTrap();

  rm.openedSafe++;
  if(cell.type === 'key'){
    R.hasKey = true;
    flyText(i, '🗝️ Ключ!');
  } else {
    addGold(R, 1);
    flyText(i, '+1 🪙');
  }
  renderRoom();

  // Все безопасные клетки комнаты открыты — комната исчерпана
  if(rm.openedSafe >= rm.size * rm.size - rm.traps) setTimeout(onRoomCleared, 300);
}

// ─── тап в бонусной комнате (сокровищница): без ловушек, без честного старта, без ключей ───
function tapBonus(i){
  const rm = R.bonusRoom;
  const cell = rm.cells[i];
  if(cell.open) return;
  cell.open = true;
  rm.openedSafe++;
  addGold(R, 1);
  flyText(i, '+1 🪙');
  renderRoom();
}

// ─── комната исчерпана: авто-переход дальше, либо провал в последней без квоты ───
function onRoomCleared(){
  if(!R.live) return;
  if(!isLastRoom()) return advanceRoom();
  if(!quotaMet(R)) return fail('gold');
  renderRoom();
}

// ─── «Дальше →»: доступна в любой не последней комнате в любой момент, даже без тапов ───
function goNext(){
  if(!R.live || R.inBonus || isLastRoom()) return;
  advanceRoom();
}

function advanceRoom(){
  curRoom().collapsed = true;
  R.tomb.currentRoomIndex++;
  renderRoom();
}

// ─── «К выходу →»: доступна из любой комнаты, как только квота набрана ───
function goExit(){
  if(!R.live || R.inBonus || !quotaMet(R)) return;
  win();
}

// ─── «Открыть дверь в сокровищницу →» / «Продолжить →» из бонусной комнаты ───
function goOpenVault(){
  if(!R.live || R.inBonus) return;
  openVault(R);
  renderRoom();
}

function goLeaveVault(){
  if(!R.live || !R.inBonus) return;
  leaveVault(R);
  renderRoom();
}

// ─── ловушка: провал уровня, комната вскрывается полностью для показа ───
function onTrap(){
  R.live = false;
  curRoom().cells.forEach(c => c.open = true);
  navigator.vibrate && navigator.vibrate([60, 40, 120]);
  renderRoom();
  setTimeout(() => showLevelFail('trap'), 750);
}

// ─── провал без ловушки: комнаты кончились, а квота не набрана ───
function fail(reason){
  R.live = false;
  renderRoom();
  showLevelFail(reason);
}

// ─── победа уровня: квота набрана и подтверждён выход ───
function win(){
  R.live = false;
  progress.cleared = Math.max(progress.cleared, R.level + 1);
  saveProgress();
  renderRoom();
  if(R.level >= LEVELS_COUNT - 1) return showCampaignWin();
  showLevelWin(R.level);
}
