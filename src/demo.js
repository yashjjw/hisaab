import { html, render } from '../vendor/htm-preact.mjs';
import { Main } from './app.js';

render(html`<div class="phone-shell"><${Main} /></div>`, document.getElementById('app'));
