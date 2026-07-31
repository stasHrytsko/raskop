// ───────────────────────────────────────────────
//  Генератор одной комнаты — клетки, числовые подсказки
//  Эпик: C (tasks.md) · Фаза 1: только типы 'gold'/'trap' (empty/key/hint/artifact —
//  Эпики C-остаток/E/H/I/J, будущие фазы — генератор их пока не создаёт)
//  Зависит от: config.js, gen/rules.js
// ───────────────────────────────────────────────

// Сырая комната: `traps` ловушек вразброс, остальные клетки — золото
function makeRawRoom(size, traps){
  const cells = Array.from({length: size * size}, () => ({ type: 'gold', open: false }));
  const idx = [...cells.keys()];
  shuffle(idx);
  for(let i = 0; i < traps; i++) cells[idx[i]].type = 'trap';
  return cells;
}

// Комната size×size с `traps` ловушками, подсказки только 1..MAX_CLUE;
// мягко деградирует, если идеал не найден за 600 попыток (как раньше в field.js)
function newRoom(size, traps){
  let last = makeRawRoom(size, traps);
  for(let a = 0; a < 600; a++){
    const c = makeRawRoom(size, traps);
    last = c;
    if(safeNumbersOK(c, size)) break;
  }
  return { size, traps, cells: last, openedSafe: 0, firstTapDone: false, collapsed: false };
}

// Число ловушек вокруг клетки i в комнате (для отрисовки подсказки)
function clueAt(room, i){
  return countTraps(room.cells, i, room.size);
}
