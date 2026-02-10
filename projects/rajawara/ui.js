(() => {
  const showToast = (msg, danger = false) => {
    const toast = Game.dom.toast;
    toast.textContent = msg;
    toast.style.background = danger ? 'rgba(140, 32, 32, 0.8)' : 'rgba(0,0,0,0.55)';
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  const showExpPop = (amount) => {
    if (!amount) return;
    const expPop = Game.dom.expPop;
    expPop.textContent = `+${amount} EXP`;
    expPop.classList.add('show');
    clearTimeout(showExpPop._t);
    showExpPop._t = setTimeout(() => expPop.classList.remove('show'), 900);
  };

  const updateHUD = () => {
    const { state } = Game;
    Game.dom.levelEl.textContent = state.level;
    Game.dom.ageEl.textContent = Game.utils.ageLabel(state.level);

    const needed = Game.utils.expNeeded(state.level);
    const expPct = Game.utils.clamp((state.exp / needed) * 100, 0, 100);
    Game.dom.expFill.style.width = `${expPct}%`;
    Game.dom.expText.textContent = `Exp ${Math.floor(state.exp)}/${needed} · Sisa ${Math.max(0, needed - Math.floor(state.exp))}`;

    const updateStat = (stat, value) => {
      stat.ring.style.setProperty('--pct', `${value}%`);
      stat.value.textContent = `${Math.round(value)}%`;
    };

    updateStat(Game.dom.stats.hunger, state.hunger);
    updateStat(Game.dom.stats.thirst, state.thirst);
    updateStat(Game.dom.stats.boredom, state.boredom);
    updateStat(Game.dom.stats.fatigue, state.fatigue);
  };

  const updateInteractionButtons = () => {
    const { btnEat, btnDrink, btnSleep, btnHunt, buttonsWrap } = Game.dom;
    const actions = Game.actions.getAvailableActions();
    const setVisible = (btn, show) => {
      btn.classList.toggle('hidden', !show);
    };

    setVisible(btnDrink, actions.drink);
    setVisible(btnSleep, actions.sleep);
    setVisible(btnEat, actions.hunt);

    const primaryAction = actions.hunt ? 'hunt' : (actions.drink ? 'drink' : (actions.sleep ? 'sleep' : null));
    btnHunt.textContent = primaryAction === 'hunt' ? 'Berburu' : 'Interaksi';
    btnHunt.dataset.action = primaryAction || '';
    btnHunt.classList.toggle('dim', !primaryAction);
    setVisible(btnHunt, true);

    const anyVisible = actions.drink || actions.sleep || actions.hunt || true;
    buttonsWrap.classList.toggle('hidden', !anyVisible);
  };

  Game.ui = {
    showToast,
    showExpPop,
    updateHUD,
    updateInteractionButtons
  };
})();
