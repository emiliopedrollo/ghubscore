import { transform } from './app';
// CSS modules
import css from './style.css';

document.head.append(<style>{css}</style>);

const kanban = document.querySelector('.js-project-container');

VM.observe(kanban, () => {
  transform(kanban);
});
