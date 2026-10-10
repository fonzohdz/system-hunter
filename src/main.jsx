import { render } from 'preact';
import { useState } from 'preact/hooks';
import '@fontsource/jersey-10/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import './theme.css';
import { useGame } from './ui/useGame.js';
import { Onboarding } from './ui/Onboarding.jsx';
import { QuestTab } from './ui/QuestTab.jsx';
import { StatusTab } from './ui/StatusTab.jsx';
import { SettingsTab } from './ui/SettingsTab.jsx';
import { TabBar } from './ui/TabBar.jsx';
import { todayMode } from './game/quest.js';
import { installTapFeedback } from './ui/sfx.js';

function App() {
  const game = useGame();
  const [tab, setTab] = useState('quest');

  if (!game.state) {
    return <Onboarding onFinish={(_answers, fresh) => { setTab('quest'); game.start(fresh); }} />;
  }

  const mode = todayMode(game.state, game.today);
  const pick = (t) => {
    setTab(t);
    window.scrollTo(0, 0);
  };
  return (
    <>
      {tab === 'quest' && <QuestTab game={game} />}
      {tab === 'status' && <StatusTab game={game} />}
      {tab === 'settings' && <SettingsTab game={game} />}
      <TabBar tab={tab} setTab={pick} alert={tab !== 'quest' && (mode === 'training' || mode === 'penalty')} />
    </>
  );
}

installTapFeedback();
render(<App />, document.getElementById('app'));
