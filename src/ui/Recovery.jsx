import { useState } from 'preact/hooks';
import { Window } from './Window.jsx';
import { Typed } from './motion.jsx';

/**
 * Shown instead of the app when a save exists but can't be read (it would
 * otherwise crash to a blank screen). "Start over" backs the damaged save up
 * under its own key first, so it can still be recovered later.
 */
export function Recovery({ onRecover }) {
  const [failed, setFailed] = useState(false);
  return (
    <main class="screen no-tabs onboard">
      <h1 class="px wordmark">LIMIT BREAK</h1>
      <Window label="System error" class="system-intro danger-win">
        <div class="eyebrow danger">SYSTEM ERROR</div>
        <p class="intro-text"><Typed text="The System couldn't read your save." /></p>
        <p class="small">The progress data on this device is damaged. Starting over keeps a backup copy of it here, so it can still be recovered later.</p>
        {failed && (
          <p class="small" role="alert"><span class="danger">The backup couldn't be made, so nothing was deleted. Free up storage on this device and try again.</span></p>
        )}
      </Window>
      <button class="cta danger" onClick={() => { if (!onRecover()) setFailed(true); }}>START OVER</button>
      <button class="btn" data-sfx="back" onClick={() => location.reload()}>Try again</button>
    </main>
  );
}
