// ───────────────────────────────────────────────
//  Поле: генерация (с балансом), соседи, множитель
// ───────────────────────────────────────────────

// Перемешивание Фишера–Йетса
function shuffle(a){
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.random() * (i + 1) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
}

// Индексы 8 соседей клетки i (с диагоналями)
function neigh(i){
  const r = i / SIZE | 0, c = i % SIZE, out = [];
  for(let dr = -1; dr <= 1; dr++) for(let dc = -1; dc <= 1; dc++){
    if(!dr && !dc) continue;
    const nr = r + dr, nc = c + dc;
    if(nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) out.push(nr * SIZE + nc);
  }
  return out;
}

// Сколько ловушек среди соседей клетки i в произвольном поле
function countTraps(cells, i){
  return neigh(i).filter(j => cells[j].trap).length;
}

// Сырое поле: COINS монет + `traps` ловушек, остальное пусто
function makeRaw(traps){
  const cells = Array.from({length: SIZE * SIZE}, () => ({trap:false, coin:false, open:false}));
  const idx = [...cells.keys()];
  shuffle(idx);
  let p = 0;
  for(let i = 0; i < traps; i++) cells[idx[p++]].trap = true;
  for(let i = 0; i < COINS; i++) cells[idx[p++]].coin = true;
  return cells;
}

// Подсказки только 1..MAX_CLUE: ни одна безопасная клетка не касается >MAX_CLUE ловушек
function safeNumbersOK(cells){
  for(let i = 0; i < cells.length; i++)
    if(!cells[i].trap && countTraps(cells, i) > MAX_CLUE) return false;
  return true;
}

// Желательная раскладка: минимум 2 монеты с нулевым риском (0 ловушек рядом)
function coinSpreadOK(cells){
  let lowRisk = 0;
  cells.forEach((c, i) => { if(c.coin && countTraps(cells, i) === 0) lowRisk++; });
  return lowRisk >= 2;
}

// Генерирует сбалансированное поле с `traps` ловушками;
// мягко деградирует, если идеал не найден
function newField(traps){
  let last = makeRaw(traps);
  for(let a = 0; a < 600; a++){
    const c = makeRaw(traps);
    last = c;
    if(safeNumbersOK(c) && coinSpreadOK(c)) return c;
  }
  for(let a = 0; a < 600; a++){          // ослабляем: только ограничение цифр ≤3
    const c = makeRaw(traps);
    last = c;
    if(safeNumbersOK(c)) return c;
  }
  return last;
}

// Ловушки вокруг клетки i в текущем поле (для отрисовки)
function trapCount(i){ return countTraps(S.field, i); }

// FIRST_TAP_BLANK: гарантия честного старта — у клетки i 0 ловушек среди соседей.
// Любые ловушки в зоне старта (сама клетка + 8 соседей) переносятся на случайные
// свободные клетки вне этой зоны.
function clearStart(i){
  if(!FIRST_TAP_BLANK) return;
  const zone = new Set([i, ...neigh(i)]);
  const free = [];
  S.field.forEach((c, j) => { if(!zone.has(j) && !c.trap && !c.coin) free.push(j); });
  shuffle(free);
  let f = 0;
  zone.forEach(j => {
    if(S.field[j].trap && f < free.length){
      S.field[j].trap = false;
      S.field[free[f++]].trap = true;
    }
  });
}

// Текущий множитель жадности по числу безопасных вскрытий за заход
function mult(){
  return S.reveals >= TH4 ? 4 : S.reveals >= TH3 ? 3 : S.reveals >= TH2 ? 2 : 1;
}
