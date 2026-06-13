// ───────────────────────────────────────────────
//  Навигация: rules → levels(карта забега) → game
// ───────────────────────────────────────────────

// Показать одну страницу (section.screen), спрятать остальные
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('screen-' + name).classList.add('active');
}

// Построить карту забега 3×3 + рекорд + кнопки действий
function buildMap(){
  $('record').textContent = best > 0 ? `Рекорд: уровень ${best}` : 'Рекорд: пока нет';

  const wrap = $('levels');
  wrap.innerHTML = '';
  for(let i = 0; i < LEVELS_COUNT; i++){
    const state = (run && run.level === i) ? 'current' : ((i + 1) <= best ? 'done' : 'lock');
    const d = document.createElement('div');
    d.className = 'lv ' + tierFor(i) + ' ' + state;
    d.textContent = state === 'done' ? '✓' : (i + 1);
    wrap.appendChild(d);
  }

  const act = $('mapActions');
  if(run){
    act.innerHTML =
      `<button class="btn btn-go" id="resume">Продолжить · уровень ${run.level + 1}</button>
       <button class="btn btn-ghost" id="restart">Начать заново</button>`;
    $('resume').onclick  = () => showScreen('game');
    $('restart').onclick = () => startRun();
  } else {
    act.innerHTML = `<button class="btn btn-go" id="startRun">Начать забег</button>`;
    $('startRun').onclick = () => startRun();
  }
}

// Перейти на карту забега, перестроив её под актуальное состояние
function gotoMap(){
  buildMap();
  showScreen('levels');
}

// Привязка кнопок переходов (элементы статичны в index.html)
function initNav(){
  $('toLevels').onclick  = gotoMap;                       // стр.1 → карта
  $('toRules').onclick   = () => showScreen('rules');     // карта → стр.1
  $('toLevels2').onclick = gotoMap;                       // игра → карта
  buildMap();
  showScreen('rules');
}
