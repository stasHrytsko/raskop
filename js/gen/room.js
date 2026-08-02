// ───────────────────────────────────────────────
//  Генератор одной комнаты — клетки, числовые подсказки
//  Эпик: C (tasks.md) · Фаза 1: newRoom() создаёт только 'gold'/'trap'
//  Эпик: E (Фаза 2) · placeKey() дозаписывает одну клетку как 'key' поверх готовой комнаты
//  Эпик: I (Фаза 4) · placeArtifact() — аналогично, клетка типа 'artifact'
//  (empty/hint — Эпики C-остаток/J, будущие фазы — генератор их пока не создаёт)
//  Зависит от: config.js, gen/rules.js
// ───────────────────────────────────────────────

// Сырая комната: `traps` ловушек вразброс, остальные клетки — золото. Номинал
// (`value`, 1–5) назначается всем клеткам сразу через randomCoinValue() — для клеток,
// которые ниже станут `trap`/`key`/`artifact`, он остаётся неиспользуемым (читается
// только для `type==='gold'` в `tap()`), проще, чем расставлять его отдельным проходом.
function makeRawRoom(size, traps){
  const cells = Array.from({length: size * size}, () => ({ type: 'gold', open: false, value: randomCoinValue() }));
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

// Спрятать ключ под случайной безопасной клеткой комнаты (Эпик E). Игрок заранее не
// знает, есть ли в комнате ключ (concept.txt, «Что известно игроку») — клетка визуально
// не отличается от золота до вскрытия, и после вскрытия по-прежнему показывает только
// цифру подсказки, как золото.
function placeKey(room){
  const safeIdx = room.cells.map((c, i) => i).filter(i => room.cells[i].type === 'gold');
  const i = safeIdx[Math.random() * safeIdx.length | 0];
  room.cells[i].type = 'key';
}

// Спрятать временный артефакт под случайной безопасной клеткой (Эпик I, Фаза 4) — как
// ключ, сюрприз при обычном тапе, клетка визуально не отличается от золота/ключа до
// вскрытия. Фильтр по 'gold' (не «!== trap»), чтобы не перезаписать уже занятую клетку
// с ключом, если placeKey и placeArtifact выбрали одну и ту же комнату.
function placeArtifact(room, id){
  const safeIdx = room.cells.map((c, i) => i).filter(i => room.cells[i].type === 'gold');
  if(!safeIdx.length) return;
  const i = safeIdx[Math.random() * safeIdx.length | 0];
  room.cells[i].type = 'artifact';
  room.cells[i].artifactId = id;
}
