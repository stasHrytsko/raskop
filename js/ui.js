// ───────────────────────────────────────────────
//  Попапы (оверлеи поверх игровой страницы)
// ───────────────────────────────────────────────
const ovl = $('ovl');

function show(html){ ovl.innerHTML = `<div class="ovl"><div class="card">${html}</div></div>`; }
function hide(){ ovl.innerHTML = ''; }

// Конец захода: уровень ещё не закрыт и заходы остались
function showDiveEnd(died, gain){
  show(died
    ? `<h2>💀 Ловушка!</h2>
       <p>Весь прогресс уровня сгорел. Осталось заходов: <b>${S.dives}</b>.<br>
          Цель уровня <b>${S.quota} 🪙</b> придётся набрать заново.</p>
       <button class="btn btn-go" id="go">Новый заход</button>`
    : `<h2>Ушёл вовремя</h2>
       <div class="big ok">+${gain} 🪙</div>
       <p>Прогресс уровня: <b>${S.prog} / ${S.quota} 🪙</b>. Осталось заходов: <b>${S.dives}</b>.</p>
       <button class="btn btn-go" id="go">Новый заход</button>`);
  $('go').onclick = () => { hide(); nextDive(); };
}

// Уровень пройден — переход к следующему
function showLevelClear(n){
  show(`<h2>✨ Уровень ${n + 1} пройден</h2>
    <div class="big ok">${S.prog} / ${S.quota} 🪙</div>
    <p>Квота закрыта. Дальше сложнее.</p>
    <button class="btn btn-go" id="next">Уровень ${n + 2} →</button>`);
  $('next').onclick = () => { hide(); startLevel(n + 1); };
}

// ПОБЕДА — пройдены все 9 уровней забега
function showRunWin(){
  show(`<h2>🏆 Забег пройден!</h2>
    <div class="big ok">9 / 9</div>
    <p>Ты прошёл всю экспедицию. Рекорд: уровень <b>${best}</b>.</p>
    <button class="btn btn-go" id="again">Сыграть заново</button>
    <button class="btn btn-ghost" id="toMap">К забегу</button>`);
  $('again').onclick = () => { hide(); startRun(); };
  $('toMap').onclick = () => { hide(); run = null; gotoMap(); };
}

// ПОРАЖЕНИЕ — забег окончен (reason: 'trap' | 'coins')
function showRunOver(reason){
  const reached = run.level + 1;
  const why = reason === 'trap'
    ? 'ловушка сожгла прогресс уровня'
    : 'не хватило монет за 3 захода';
  show(`<h2>Забег окончен</h2>
    <div class="big amb">Уровень ${reached}</div>
    <p>Лучший рекорд: уровень <b>${best}</b>.<br>Причина: <b>${why}</b>.</p>
    <button class="btn btn-go" id="again">Начать заново</button>
    <button class="btn btn-ghost" id="toMap">К забегу</button>`);
  $('again').onclick = () => { hide(); startRun(); };
  $('toMap').onclick = () => { hide(); run = null; gotoMap(); };
}
