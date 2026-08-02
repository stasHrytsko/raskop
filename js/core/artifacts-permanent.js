// ───────────────────────────────────────────────
//  Постоянные артефакты — слоты, цена активации, эффекты
//  Эпик: H (tasks.md) · Фаза 3 (урезано: 1 слот, 2 артефакта — см. content/artifacts-permanent.js)
//  Зависит от: config.js, content/artifacts-permanent.js, core/economy.js, core/tomb.js
//  Заменяет: — (новая сущность)
// ───────────────────────────────────────────────

// Сброс состояния артефакта для новой попытки уровня (вызывать из startLevel)
function initArtifactState(R){
  R.artifactUses = {};      // id → сколько раз применён в этом уровне
  R.artifactArmed = null;   // 'scarab', пока ждём тап по клетке-цели
  R.sealCharge = false;     // заряд Печати хранителя
}

// 1-е применение артефакта на уровне бесплатно, далее 5 → 12 → 25 (пересчёт баланса —
// concept.txt, «Активация»: лесенка под номинал монеты и квоту стандартного уровня,
// старая 1/2/4 была рассчитана под квоту 8). 5-е и далее использование концепт не
// оговаривает — продолжаем тем же темпом роста, что и на предыдущем шаге (×2).
const ARTIFACT_COST_LADDER = [0, 5, 12, 25];
function activationCost(useCount){
  if(useCount < ARTIFACT_COST_LADDER.length) return ARTIFACT_COST_LADDER[useCount];
  const overflow = useCount - ARTIFACT_COST_LADDER.length + 1;
  return ARTIFACT_COST_LADDER[ARTIFACT_COST_LADDER.length - 1] * Math.pow(2, overflow);
}

function canActivateArtifact(R){
  if(!R.live || R.inBonus || !wallet.artifact || R.artifactArmed) return false;
  if(wallet.artifact === 'seal' && R.sealCharge) return false; // уже заряжена
  const used = R.artifactUses[wallet.artifact] || 0;
  return R.gold >= activationCost(used);
}

function activateArtifact(R){
  if(!canActivateArtifact(R)) return;
  const id = wallet.artifact;
  const used = R.artifactUses[id] || 0;
  spendGold(R, activationCost(used));
  R.artifactUses[id] = used + 1;
  if(id === 'scarab') R.artifactArmed = 'scarab';
  else if(id === 'seal') R.sealCharge = true;
}

// Глаз скарабея: проверка клетки без вскрытия — вызывается вместо tap(i), пока armed
function checkScarab(R, i){
  const isTrap = curRoom().cells[i].type === 'trap';
  R.artifactArmed = null;
  return isTrap;
}

// Печать хранителя: перехват в onTrap — true, если ловушка нейтрализована (уровень
// продолжается вместо провала)
function tryGuardianSeal(R){
  if(!R.sealCharge) return false;
  R.sealCharge = false;
  spendGold(R, Math.ceil(R.gold * SEAL_GOLD_LOSS_RATIO));
  return true;
}
