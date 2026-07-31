// ───────────────────────────────────────────────
//  Роутинг между экранами (правила / карта кампании / игра)
//  Фаза 1 · Зависит от: config.js, core/run.js
//  Заменяет: js/nav.js (showScreen/buildMap/gotoMap/initNav)
// ───────────────────────────────────────────────

// Показать одну страницу (section.screen), спрятать остальные
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('screen-' + name).classList.add('active');
}

// Построить карту кампании (9 уровней, интерим до Эпика L) + прогресс + кнопки действий.
// Карта не кликабельна — прогресс линейный, действия только через кнопки ниже.
function buildMap(){
  $('record').textContent = progress.cleared > 0
    ? `Пройдено уровней: ${progress.cleared} / ${LEVELS_COUNT}`
    : 'Прогресс: пока нет';

  const wrap = $('levels');
  wrap.innerHTML = '';
  for(let i = 0; i < LEVELS_COUNT; i++){
    const state = i < progress.cleared ? 'done' : (i === progress.current ? 'current' : 'lock');
    const d = document.createElement('div');
    d.className = 'lv ' + tierFor(i) + ' ' + state;
    d.textContent = state === 'done' ? '✓' : (i + 1);
    wrap.appendChild(d);
  }

  const act = $('mapActions');
  const hasProgress = R || progress.current > 0 || progress.cleared > 0;
  if(hasProgress){
    const n = (R ? R.level : progress.current) + 1;
    act.innerHTML =
      `<button class="btn btn-go" id="resume">Продолжить · уровень ${n}</button>
       <button class="btn btn-ghost" id="restart">Начать заново</button>`;
    $('resume').onclick = () => {
      if(!R) startLevel(progress.current);
      showScreen('game');
    };
    $('restart').onclick = () => { resetProgress(); startLevel(0); showScreen('game'); };
  } else {
    act.innerHTML = `<button class="btn btn-go" id="startRun">Начать</button>`;
    $('startRun').onclick = () => { startLevel(0); showScreen('game'); };
  }
}

// Перейти на карту кампании, перестроив её под актуальный прогресс
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
