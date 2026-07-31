// ───────────────────────────────────────────────
//  Постоянное золото — метавалюта между уровнями кампании
//  Эпик: G (tasks.md) · Фаза 3
//  Зависит от: config.js
//  Заменяет: — (новая сущность, отдельная от progress/raskop_progress)
// ───────────────────────────────────────────────
//
// Отдельная персистентность от прогресса кампании: не трогается resetProgress() —
// золото и выбранный артефакт постоянны и переживают ручной сброс кампании (concept.txt:
// «постоянные артефакты остаются в коллекции навсегда»).
let wallet = { gold: 0, everCleared: [], artifact: null };

function loadWallet(){
  try {
    const raw = JSON.parse(localStorage.getItem(WALLET_KEY));
    if(raw && typeof raw.gold === 'number') wallet = raw;
  } catch(e){}
}
function saveWallet(){ try { localStorage.setItem(WALLET_KEY, JSON.stringify(wallet)); } catch(e){} }

// Начисление в кошелёк при победе на уровне n: 100% золота при первом прохождении,
// REPLAY_GOLD_RATIO при повторном (everCleared растёт один раз на уровень, не сбрасывается
// сбросом кампании — анти-фарм).
function awardLevelGold(n, goldRemaining){
  const firstClear = !wallet.everCleared.includes(n);
  if(firstClear) wallet.everCleared.push(n);
  const amount = Math.round(goldRemaining * (firstClear ? 1 : REPLAY_GOLD_RATIO));
  wallet.gold += amount;
  saveWallet();
  return { amount, firstClear };
}

// Единая точка расхода кошелька — пока без вызовов (нет магазина/доп. слотов в Фазе 3)
function spendWallet(amount){
  wallet.gold = Math.max(0, wallet.gold - amount);
  saveWallet();
}
