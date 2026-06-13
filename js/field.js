// ───────────────────────────────────────────────
//  Поле: генерация, соседи, подсчёт ловушек, множитель
// ───────────────────────────────────────────────

// Генерирует новое поле: `traps` ловушек + добыча (6×🪙, 3×🧰, 1×💎 = 31)
function newField(traps){
  const cells = Array.from({length: SIZE * SIZE}, () => ({trap:false, val:0, open:false}));
  const idx = [...cells.keys()];
  shuffle(idx);
  let p = 0;
  for(let i = 0; i < traps; i++) cells[idx[p++]].trap = true;
  for(let i = 0; i < 6; i++) cells[idx[p++]].val = 2;
  for(let i = 0; i < 3; i++) cells[idx[p++]].val = 4;
  cells[idx[p++]].val = 7;
  return cells;
}

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

// Сколько ловушек среди соседей клетки i
function trapCount(i){
  return neigh(i).filter(j => S.field[j].trap).length;
}

// Текущий множитель жадности по числу вскрытий за заход
function mult(){
  return S.reveals >= TH3 ? 3 : S.reveals >= TH2 ? 2 : 1;
}
