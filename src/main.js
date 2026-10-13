import { html, render } from '../vendor/htm-preact.mjs';
import { Guide } from './guide.js';

render(html`<${Guide} />`, document.getElementById('app'));
