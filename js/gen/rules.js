// ───────────────────────────────────────────────
//  Правила генератора — честный старт, ограничение подсказки, ретраи
//  Эпик: N (база — честный старт/MAX_CLUE перенесены из старого field.js уже в Фазе 1;
//  остальные анти-доминирующие правила — Фаза 6)
//  Зависит от: config.js
// ───────────────────────────────────────────────

// Номинал золотой монеты 1–5 по весам (пересчёт баланса — concept.txt, «Золото и
// баланс уровня» → «Номинал монеты»): среднее ≈2,0 (точно 2,03 при этих весах).
const COIN_WEIGHTS = [40, 30, 20, 7, 3]; // вес номиналов 1..5, сумма 100
function randomCoinValue(){
  let r = Math.random() * 100;
  for(let v = 0; v < COIN_WEIGHTS.length; v++){
    if(r < COIN_WEIGHTS[v]) return v + 1;
    r -= COIN_WEIGHTS[v];
  }
  return COIN_WEIGHTS.length; // защита от погрешности округления
}

// Перемешивание Фишера–Йетса
function shuffle(a){
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.random() * (i + 1) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
}

// Индексы 8 соседей клетки i (с диагоналями) на поле size × size
function neigh(i, size){
  const r = i / size | 0, c = i % size, out = [];
  for(let dr = -1; dr <= 1; dr++) for(let dc = -1; dc <= 1; dc++){
    if(!dr && !dc) continue;
    const nr = r + dr, nc = c + dc;
    if(nr >= 0 && nr < size && nc >= 0 && nc < size) out.push(nr * size + nc);
  }
  return out;
}

// Сколько ловушек среди соседей клетки i в произвольном массиве клеток
function countTraps(cells, i, size){
  return neigh(i, size).filter(j => cells[j].type === 'trap').length;
}

// Подсказки только 1..MAX_CLUE: ни одна безопасная клетка не касается >MAX_CLUE ловушек
function safeNumbersOK(cells, size){
  for(let i = 0; i < cells.length; i++)
    if(cells[i].type !== 'trap' && countTraps(cells, i, size) > MAX_CLUE) return false;
  return true;
}

// FIRST_TAP_BLANK: честный старт — у клетки i 0 ловушек среди соседей.
// Любые ловушки в зоне старта (сама клетка + 8 соседей) переносятся на случайные
// свободные клетки вне этой зоны. Вызывается при первом тапе в каждой комнате.
// Цель переноса — строго `type==='gold'` (не «не ловушка»): `key`/`artifact` — тоже
// не ловушка, но перенос ловушки НА такую клетку молча затирал бы находку без следа
// (баг, найденный при регрессии пересчёта баланса — 5% прогонов теряли ключ).
function clearStart(cells, i, size){
  if(!FIRST_TAP_BLANK) return;
  const zone = new Set([i, ...neigh(i, size)]);
  const free = [];
  cells.forEach((c, j) => { if(!zone.has(j) && c.type === 'gold') free.push(j); });
  shuffle(free);
  let f = 0;
  zone.forEach(j => {
    if(cells[j].type === 'trap' && f < free.length){
      cells[j].type = 'gold';
      cells[free[f++]].type = 'trap';
    }
  });
}
