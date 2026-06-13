// ───────────────────────────────────────────────
//  Навигация между 3 страницами: rules → levels → game
// ───────────────────────────────────────────────

// Показать одну страницу (section.screen), спрятать остальные
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('screen-' + name).classList.add('active');
}

// Построить сетку 3×3 выбора уровня
function buildLevels(){
  const wrap = $('levels');
  wrap.innerHTML = '';
  LEVELS.forEach((cfg, i) => {
    const tier = i < 3 ? 'easy' : i < 6 ? 'med' : 'hard';
    const b = document.createElement('button');
    b.className = 'lv ' + tier;
    b.textContent = i + 1;
    b.onclick = () => { startLevel(i); showScreen('game'); };
    wrap.appendChild(b);
  });
}

// Привязка кнопок переходов (элементы статичны в index.html)
function initNav(){
  buildLevels();
  $('toLevels').onclick  = () => showScreen('levels');   // стр.1 → стр.2
  $('toRules').onclick   = () => showScreen('rules');     // стр.2 → стр.1
  $('toLevels2').onclick = () => showScreen('levels');    // стр.3 → стр.2
  showScreen('rules');
}
