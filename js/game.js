// ───────────────────────────────────────────────
//  Состояние, забег и игровой цикл
// ───────────────────────────────────────────────
let best = 0;      // лучший рекорд (до какого уровня дошёл), 1..9
let run  = null;   // текущий забег: {level} или null
let S    = null;   // состояние текущего уровня/захода

// ─── рекорд ───
function loadBest(){ best = parseInt(localStorage.getItem(REC_KEY) || '0', 10) || 0; }
function saveBest(){ try { localStorage.setItem(REC_KEY, String(best)); } catch(e){} }
function bumpBest(reached){ if(reached > best){ best = reached; saveBest(); } }

// ─── забег ───
function startRun(){
  run = {level: 0};
  startLevel(0);
  showScreen('game');
}

// Запуск уровня n (0-индекс) внутри забега
function startLevel(n){
  run.level = n;
  bumpBest(n + 1);                 // «дошёл до уровня n+1»
  S = {
    quota: quotaFor(n), traps: trapsFor(n), divesMax: DIVES, dives: DIVES, prog: 0,
    field: newField(trapsFor(n)), pack: 0, reveals: 0, live: true, firstTap: true,
  };
  render();
  renderGrid();
}

// Новый заход на том же уровне (свежее поле, рюкзак и множитель с нуля)
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
    const free = S.field.findIndex(c => !c.trap && !c.open && !c.coin);
    cell.trap = false;
    S.field[free === -1 ? 0 : free].trap = true;
  }
  S.firstTap = false;
  cell.open = true;

  if(cell.trap) return onTrap();

  S.reveals++;
  if(cell.coin){ S.pack++; flyCoin(i); }
  renderGrid();
  render();

  // Все монеты собраны — заход завершается автоматически (безопасно)
  if(S.pack >= COINS) setTimeout(() => endDiveSafe(), 350);
}

// Ловушка: весь прогресс уровня сгорает, поле раскрывается
function onTrap(){
  S.live = false;
  S.prog = 0;
  S.field.forEach(c => c.open = true);
  navigator.vibrate && navigator.vibrate([60, 40, 120]);
  renderGrid();
  render();
  setTimeout(() => endDive(true, 0), 750);
}

// Ручной выход по кнопке «Уйти»
function leave(){
  if(!S.live || S.pack === 0) return;
  endDiveSafe();
}

// Безопасное завершение захода: рюкзак × множитель → прогресс уровня
function endDiveSafe(){
  if(!S.live) return;
  S.live = false;
  const gain = S.pack * mult();
  S.prog += gain;
  render();
  setTimeout(() => endDive(false, gain), 250);
}

// Итог захода: квота взята? заходы кончились? иначе — следующий заход
function endDive(died, gain){
  S.dives--;
  if(S.prog >= S.quota) return clearLevel();
  if(S.dives <= 0) return runOver(died ? 'trap' : 'coins');
  showDiveEnd(died, gain);
}

// Уровень закрыт
function clearLevel(){
  const n = run.level;
  if(n >= LEVELS_COUNT - 1){ bumpBest(LEVELS_COUNT); return showRunWin(); }
  showLevelClear(n);
}

// Забег окончен (reason: 'trap' | 'coins')
function runOver(reason){ showRunOver(reason); }

// ─── старт приложения ───
loadBest();
initNav();
