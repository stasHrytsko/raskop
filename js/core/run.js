// ───────────────────────────────────────────────
//  Попытка уровня — тап по клетке, переход между комнатами, победа/провал
//  Эпик: O (базовый цикл) · G/H (Фаза 3) — начисление в кошелёк при победе, активация
//  постоянного артефакта перехватывает tap()/onTrap()
//  Эпик: E (Фаза 2) — ключ спрятан под случайной клеткой; тап маршрутизируется в
//  бонусную комнату, пока R.inBonus
//  Эпик: I (Фаза 4) — временный артефакт подбирается тапом как ключ; double_coin
//  перехватывает начисление золота через goldWithTempBonus()
//  Эпик: L (Фаза 5) — квота уровня берётся из CAMPAIGN[n].quota, не quotaFor(n)
//  Пересчёт баланса (Эпик C) — золотая клетка даёт cell.value (номинал 1–5), не
//  флет 1; и в основной комнате (tap()), и в бонусной (tapBonus())
//  Зависит от: config.js, content/campaign.js, gen/rules.js, gen/room.js, core/tomb.js,
//  core/economy.js, core/keys.js, core/wallet.js, core/artifacts-permanent.js,
//  core/artifacts-temp.js
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
  R = { level: n, quota: CAMPAIGN[n].quota, gold: 0, tomb: newTomb(n), live: true };
  initKeyState(R);
  initArtifactState(R);
  initTempArtifactState(R);
  renderRoom();
}

// ─── тап по закрытой клетке: основная комната, либо бонусная (R.inBonus),
//      либо прицеливание Глаза скарабея (R.artifactArmed) ───
function tap(i){
  if(!R.live) return;
  if(R.inBonus) return tapBonus(i);
  if(R.artifactArmed === 'scarab') return tapScarab(i);

  const rm = curRoom();
  const cell = rm.cells[i];
  if(cell.open) return;

  // Первый тап в комнате — честный старт (0 ловушек среди соседей)
  if(!rm.firstTapDone){ clearStart(rm.cells, i, rm.size); rm.firstTapDone = true; }
  cell.open = true;

  if(cell.type === 'trap') return onTrap(i);

  rm.openedSafe++;
  if(cell.type === 'key'){
    R.hasKey = true;
    flyText(i, '🗝️ Ключ!');
  } else if(cell.type === 'artifact'){
    pickupTempArtifact(R, cell.artifactId);
    const def = ARTIFACTS_TEMP.find(a => a.id === cell.artifactId);
    flyText(i, `${def.icon} ${def.name}!`);
  } else {
    const base = cell.value;
    const amount = goldWithTempBonus(R, base);
    addGold(R, amount);
    flyText(i, amount > base ? `+${amount} 🪙 ×2!` : `+${amount} 🪙`);
  }
  renderRoom();

  // Все безопасные клетки комнаты открыты — комната исчерпана. Таймер даёт игроку
  // увидеть последнюю открытую клетку перед авто-переходом/провалом; если игрок сам
  // успевает нажать «Дальше →» раньше (кнопка кликабельна всё это время — комната
  // не последняя, значит квота ещё не обязана быть набрана), rm перестаёт быть
  // текущей комнатой — сверка по ссылке гасит устаревший таймер, не даёт ему
  // ошибочно применить onRoomCleared() к уже другой (следующей) комнате.
  if(rm.openedSafe >= rm.size * rm.size - rm.traps){
    setTimeout(() => { if(curRoom() === rm) onRoomCleared(); }, 300);
  }
}

// ─── тап в бонусной комнате (сокровищница): без ловушек, без честного старта, без ключей ───
function tapBonus(i){
  const rm = R.bonusRoom;
  const cell = rm.cells[i];
  if(cell.open) return;
  cell.open = true;
  rm.openedSafe++;
  addGold(R, cell.value);
  flyText(i, `+${cell.value} 🪙`);
  renderRoom();
}

// ─── тап-цель Глаза скарабея: проверка без вскрытия, клетка остаётся закрытой ───
function tapScarab(i){
  const rm = curRoom();
  if(rm.cells[i].open) return;
  const isTrap = checkScarab(R, i);
  flyText(i, isTrap ? '💀 Ловушка!' : '✅ Безопасно');
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

// ─── ловушка: Печать хранителя может нейтрализовать (уровень продолжается), иначе —
//      провал уровня, комната вскрывается полностью для показа ───
function onTrap(i){
  if(tryGuardianSeal(R)){
    curRoom().cells[i].neutralized = true;
    renderRoom();
    return;
  }
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
  const award = awardLevelGold(R.level, R.gold);
  renderRoom();

  if(R.level >= LEVELS_COUNT - 1) return showCampaignWin(award);

  // После уровня 3 — разовый выбор бесплатного постоянного артефакта (Эпик H)
  const level = R.level;
  const needsPick = level === 2 && !wallet.artifact;
  const proceed = () => needsPick
    ? showArtifactPick(() => startLevel(level + 1))
    : startLevel(level + 1);
  showLevelWin(level, award, proceed);
}
