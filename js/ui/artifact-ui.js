// ───────────────────────────────────────────────
//  UI постоянного артефакта — кнопка в HUD игрового экрана
//  Эпик: H (tasks.md) · Фаза 3
//  Зависит от: config.js, content/artifacts-permanent.js, core/artifacts-permanent.js,
//  core/run.js
//  Заменяет: — (новая сущность)
// ───────────────────────────────────────────────

// Кнопка экипированного артефакта: иконка/имя/цена, «заряжена» (Печать), «выбери
// клетку…» (Скарабей в режиме прицеливания). Скрыта, если артефакт ещё не выбран.
function renderArtifactBar(){
  const el = $('artifactBar');
  if(!wallet.artifact || R.inBonus){
    el.style.display = 'none';
    return;
  }
  const def = ARTIFACTS_PERMANENT.find(a => a.id === wallet.artifact);
  const used = R.artifactUses[wallet.artifact] || 0;
  const cost = activationCost(used);

  el.style.display = '';
  el.onclick = () => { activateArtifact(R); renderRoom(); };

  if(R.artifactArmed === wallet.artifact){
    el.textContent = `${def.icon} Выбери клетку для проверки…`;
    el.disabled = true;
  } else if(wallet.artifact === 'seal' && R.sealCharge){
    el.textContent = `${def.icon} ${def.name} — заряжена`;
    el.disabled = true;
  } else {
    el.textContent = `${def.icon} ${def.name} — ${cost === 0 ? 'бесплатно' : cost + ' 🪙'}`;
    el.disabled = !canActivateArtifact(R);
  }
}
