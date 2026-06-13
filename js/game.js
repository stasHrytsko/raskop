// ───────────────────────────────────────────────
//  Состояние и игровой цикл
// ───────────────────────────────────────────────
let S = null;

// Новая игра с первого уровня
function start(){
  S = {
    level: 1, quota: QUOTA0, prog: 0, dives: DIVES, banked: 0,
    field: newField(), pack: 0, reveals: 0, live: true, firstTap: true,
  };
  render();
  renderGrid();
}

// Новый заход на том же уровне (свежее поле, сброс рюкзака)
function nextDive(){
  S.field = newField();
  S.pack = 0;
  S.reveals = 0;
  S.live = true;
  S.firstTap = true;
  render();
  renderGrid();
}

// Тап по клетке
function tap(i){
  if(!S.live) return;
  const cell = S.field[i];
  if(cell.open) return;

  // Первое вскрытие захода всегда безопасно
  if(S.firstTap && cell.trap){
    const free = S.field.findIndex(c => !c.trap && !c.open && !c.val);
    cell.trap = false;
    S.field[free === -1 ? 0 : free].trap = true;
  }
  S.firstTap = false;
  cell.open = true;

  if(cell.trap){
    S.live = false;
    navigator.vibrate && navigator.vibrate([60, 40, 120]);
    renderGrid();
    render();
    setTimeout(() => endDive(true), 650);
    return;
  }

  S.reveals++;
  if(cell.val){
    S.pack += cell.val;
    flyCoin(i, cell.val);
  }
  renderGrid();
  render();

  // Все безопасные клетки вскрыты — автоматический выход
  if(S.field.every(c => c.trap || c.open)) setTimeout(() => leave(), 350);
}

// Добровольный выход — добыча × множитель уходит в прогресс
function leave(){
  if(!S.live || (S.pack === 0 && S.reveals === 0)) return;
  S.live = false;
  const gain = S.pack * mult();
  S.prog += gain;
  S.banked += gain;
  render();
  setTimeout(() => endDive(false, gain), 250);
}

// Итог захода: уровень закрыт? заходы кончились? иначе — следующий заход
function endDive(died, gain){
  S.dives--;
  if(S.prog >= S.quota){ return showLevelUp(); }
  if(S.dives <= 0){ return showGameOver(); }
  showDiveEnd(died, gain);
}

// Старт
start();
showIntro();
