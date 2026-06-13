// ───────────────────────────────────────────────
//  Отрисовка поля и HUD (страница 3)
// ───────────────────────────────────────────────
const grid = $('grid');

// Вылетающая «+1 🪙» при подборе монеты
function flyCoin(i){
  const el = grid.children[i].getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'fly';
  f.textContent = '+1 🪙';
  f.style.left = (el.left + el.width / 2 - 18) + 'px';
  f.style.top = (el.top - 4) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 700);
}

// Перерисовка игрового поля
function renderGrid(){
  grid.innerHTML = '';
  S.field.forEach((c, i) => {
    const d = document.createElement('div');
    d.className = 'c' + (c.open ? ' open' : '');
    if(c.open){
      if(c.trap){
        d.classList.add('trap');
        d.textContent = '💀';
      } else {
        const n = trapCount(i);
        if(c.coin){
          d.innerHTML = `<div class="loot"><span class="ic">🪙</span><span class="v">${n || ''}</span></div>`;
        } else if(n){
          d.innerHTML = `<span class="num ${n >= 3 ? 'hot' : n === 2 ? 'warm' : ''}">${n}</span>`;
        } else {
          d.classList.add('n0');
          d.textContent = '·';
        }
      }
    }
    d.onclick = () => tap(i);
    grid.appendChild(d);
  });
}

// Перерисовка HUD: уровень, заход, прогресс, рюкзак, множитель, кнопка
function render(){
  $('lvl').textContent = run.level + 1;
  $('dives').textContent = `Заход ${S.divesMax - S.dives + 1}/${S.divesMax}`;
  $('quota').textContent = S.quota;
  $('prog').textContent = S.prog;
  $('qbar').style.width = Math.min(100, S.prog / S.quota * 100) + '%';
  $('pack').textContent = S.pack;

  const m = mult();
  $('multTxt').textContent = m;
  $('total').textContent = S.pack * m;
  const me = $('mult');
  me.textContent = '×' + m;
  me.className = 'mult' + (m === 3 ? ' x3' : m === 2 ? ' x2' : '');

  $('fuse').style.width = Math.min(100, S.reveals / TH3 * 100) + '%';
  $('fuseHint').innerHTML = m === 3 ? '<b>Максимальная жадность ×3</b>'
    : m === 2 ? `Ещё <b>${TH3 - S.reveals}</b> клеток до <b>×3</b>`
    : `Ещё <b>${TH2 - S.reveals}</b> клеток до <b>×2</b>`;

  const btn = $('leaveBtn');
  btn.disabled = !S.live || S.pack === 0;
  btn.textContent = S.pack ? `Уйти: +${S.pack * m} 🪙` : 'Рюкзак пуст';
  btn.onclick = leave;
}
