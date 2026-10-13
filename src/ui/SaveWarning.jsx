import { Window } from './Window.jsx';

/** The System's warning when progress can't be written to this device. */
export function SaveWarning({ game }) {
  if (!game.saveWarn) return null;
  return (
    <Window label="Save warning" class="system-line danger-win save-warn">
      <p class="sys-text danger" role="alert">
        <span class="px sys-tag">SYSTEM</span> WARNING. Progress can't be saved on this device. It will be lost when the app closes. Free up storage or leave private browsing.
      </p>
      <button class="btn" data-sfx="back" onClick={game.dismissSaveWarn}>Got it</button>
    </Window>
  );
}
