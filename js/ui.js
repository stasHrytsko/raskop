// ───────────────────────────────────────────────
//  Попапы (оверлеи поверх игровой страницы)
// ───────────────────────────────────────────────
const ovl = $('ovl');

function show(html){ ovl.innerHTML = `<div class="ovl"><div class="card">${html}</div></div>`; }
function hide(){ ovl.innerHTML = ''; }

// Конец захода: уровень ещё не закрыт и заходы остались
function showDiveEnd(died, gain){
  const left = S.quota - S.prog;
  show(died
    ? `<h2>💀 Ловушка!</h2>
       <div class="big bad">−${S.pack}</div>
       <p>Рюкзак сгорел. До цели ещё <b>${left} 💰</b>, осталось заходов: <b>${S.dives}</b>.</p>
       <button class="btn btn-go" id="go">Новый заход</button>`
    : `<h2>Ушёл вовремя</h2>
       <div class="big ok">+${gain}</div>
       <p>До цели ещё <b>${left} 💰</b>, осталось заходов: <b>${S.dives}</b>.</p>
       <button class="btn btn-go" id="go">Новый заход</button>`);
  $('go').onclick = () => { hide(); nextDive(); };
}

// ПОБЕДА — цель уровня взята
function showWin(){
  const last = S.level >= LEVELS.length - 1;
  show(`<h2>🏆 Поздравляю, прошёл!</h2>
    <div class="big ok">${S.prog} / ${S.quota} 💰</div>
    <p>Уровень <b>${S.level + 1}</b> ${last ? '— последний, ты прошёл всю экспедицию!' : 'закрыт.'}</p>
    ${last ? '' : `<button class="btn btn-go" id="next">Уровень ${S.level + 2} →</button>`}
    <button class="btn btn-ghost" id="retry">Ещё раз</button>
    <button class="btn btn-ghost" id="toLv">К уровням</button>`);
  if(!last) $('next').onclick = () => { hide(); startLevel(S.level + 1); };
  $('retry').onclick = () => { hide(); startLevel(S.level); };
  $('toLv').onclick  = () => { hide(); showScreen('levels'); };
}

// ПОРАЖЕНИЕ — заходы кончились, цель не взята
function showLose(died){
  show(`<h2>${died ? '💀 Рюкзак сгорел' : '⏳ Заходы кончились'}</h2>
    <p>${died
        ? 'Последний заход подорвался на ловушке.'
        : `Не хватило <b>${S.quota - S.prog} 💰</b> до цели.`}
       <br>Собрано: <b>${S.prog} / ${S.quota} 💰</b></p>
    <button class="btn btn-go" id="retry">Попробовать снова</button>
    <button class="btn btn-ghost" id="toLv">К уровням</button>`);
  $('retry').onclick = () => { hide(); startLevel(S.level); };
  $('toLv').onclick  = () => { hide(); showScreen('levels'); };
}
