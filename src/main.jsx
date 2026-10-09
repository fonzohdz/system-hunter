import { render } from 'preact';
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import './theme.css';
import { Window } from './ui/Window.jsx';

function App() {
  return (
    <main class="screen no-tabs">
      <Window label="System">
        <div class="eyebrow">SYSTEM</div>
        <p>Initializing…</p>
      </Window>
    </main>
  );
}

render(<App />, document.getElementById('app'));
