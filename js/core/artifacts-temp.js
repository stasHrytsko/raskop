// ───────────────────────────────────────────────
//  Временные артефакты — слот, эффекты, активация
//  Эпик: I (tasks.md) · Фаза 4 (урезано: 2 из 5 примеров concept.txt)
//  Зависит от: config.js, content/artifacts-temp.js, core/economy.js, core/run.js (curRoom)
//  Заменяет: — (новая сущность)
// ───────────────────────────────────────────────
//
// Один слот R.tempArtifact (id | null), не пересекается с постоянным слотом
// (core/artifacts-permanent.js). Находка — тип клетки 'artifact' (gen/room.js:
// placeArtifact), подбирается тапом как ключ (core/run.js: tap()). Действует только
// текущую попытку уровня — startLevel() каждый раз пересоздаёт R целиком, отдельной
// очистки на смерть/выход не требуется (см. raskop/CLAUDE.md, по аналогии с ключом).

// Сброс слота для новой попытки уровня (вызывать из startLevel)
function initTempArtifactState(R){
  R.tempArtifact = null;
}

function pickupTempArtifact(R, id){
  R.tempArtifact = id;
}

function tempArtifactDef(R){
  return R.tempArtifact ? ARTIFACTS_TEMP.find(a => a.id === R.tempArtifact) : null;
}

// double_coin: следующая найденная монета — ×2 золота; вызывается из core/run.js:tap()
// на каждой находке gold-клетки, эффект расходуется сразу при срабатывании
function goldWithTempBonus(R, amount){
  if(R.tempArtifact !== 'double_coin') return amount;
  R.tempArtifact = null;
  return amount * 2;
}

// manual-артефакты (сейчас только reveal_safe) активируются кнопкой в HUD, могут стоить золото
function canActivateTempArtifact(R){
  const def = tempArtifactDef(R);
  if(!R.live || R.inBonus || !def || def.trigger !== 'manual') return false;
  return R.gold >= def.cost;
}

function activateTempArtifact(R){
  const def = tempArtifactDef(R);
  if(!canActivateTempArtifact(R)) return;
  spendGold(R, def.cost);
  if(def.id === 'reveal_safe') revealSafeCell();
  R.tempArtifact = null;
}

// reveal_safe: подсвечивает случайную ЗАКРЫТУЮ безопасную клетку текущей комнаты —
// клетка остаётся закрытой (это подсказка, не автовскрытие)
function revealSafeCell(){
  const rm = curRoom();
  const idx = rm.cells.map((c, i) => i).filter(i => !rm.cells[i].open && rm.cells[i].type !== 'trap');
  if(!idx.length) return;
  const i = idx[Math.random() * idx.length | 0];
  rm.cells[i].revealed = true;
}
