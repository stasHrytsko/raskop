// ───────────────────────────────────────────────
//  Состояние и игровой цикл
// ───────────────────────────────────────────────
let S = null;

// Запуск выбранного уровня n (0-индекс в LEVELS)
function startLevel(n){
  const cfg = LEVELS[n];
  S = {
    level: n, quota: cfg.quota, traps: cfg.traps,
    divesMax: cfg.dives, dives: cfg.dives, prog: 0,
    field: newField(cfg.traps), pack: 0, reveals: 0, live: true, firstTap: true,
  };
  render();
  renderGrid();
}

// Новый заход на том же уровне (свежее поле, сброс рюкзака)
function nextDive(){
  S.field = newField(S.traps);
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

// Добровольный выход — добыча × множитель уходит в прогресс уровня
function leave(){
  if(!S.live || (S.pack === 0 && S.reveals === 0)) return;
  S.live = false;
  const gain = S.pack * mult();
  S.prog += gain;
  render();
  setTimeout(() => endDive(false, gain), 250);
}

// Итог захода: уровень взят? заходы кончились? иначе — следующий заход
function endDive(died, gain){
  S.dives--;
  if(S.prog >= S.quota){ return showWin(); }
  if(S.dives <= 0){ return showLose(died); }
  showDiveEnd(died, gain);
}

// Старт приложения: навигация на странице правил
initNav();
