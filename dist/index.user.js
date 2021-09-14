
// ==UserScript==
// @name        GitHub Projects Story Points
// @namespace   emiliopedrollo
// @description Use Story Points in GitHub Projects.
// @match       https://github.com/*/projects/*
// @run-at      document-end
// @version     0.1.0
// @author      Emilio B. Pedrollo
// @website     https://github.com/emiliopedrollo/ghubscore/
// @require     https://cdn.jsdelivr.net/combine/npm/@violentmonkey/dom@1,npm/@violentmonkey/ui@0.5
// @grant       GM_addStyle
// ==/UserScript==

(function () {
'use strict';

const getColumns = kanban => {
  return [...kanban.querySelectorAll('.project-column')].map(column => {
    const cards = getCards(column);
    const estimate = cards.map(card => card.points).reduce((a, b) => a + b, 0);
    const title = column.querySelector('.details-container .js-project-column-name');

    if (!column.dataset.original) {
      column.dataset.original = title.innerHTML;
    }

    if (column.dataset.estimate !== estimate.toString() || !column.dataset.touched) {
      column.dataset.estimate = estimate.toString();
      column.dataset.touched = true;
      title.innerHTML = `${column.dataset.original} <span class="ghp-estimate ghp-column-estimate">${estimate}</span>`;
    }

    const type = column.querySelector('.js-project-column-automation-summary').innerText.trim();
    return {
      node: column,
      title: title.innerText,
      points: estimate,
      cards,
      type
    };
  });
};

const getCards = column => {
  return [...column.querySelectorAll('article.project-card')].map(card => {
    const note = card.querySelector('.js-task-list-container .js-comment-body p');
    const issue = card.querySelector('.js-project-card-issue-link');
    return {
      node: card,
      points: getEstimateFromNode(note || issue)
    };
  });
};

const getEstimateFromNode = node => {
  const match = node.innerText.match(/^\[(\d+)]/);

  if (match) {
    const estimate = parseInt(match[1], 10) || 0;

    if (node.dataset.estimate !== estimate.toString(10)) {
      node.dataset.estimate = estimate.toString(10);
      const content = node.innerHTML.replace(/^\[\d+]\s+/, '');
      node.innerHTML = `<span class="ghp-estimate ghp-card-estimate">${estimate}</span> ${content}`;
    }

    return estimate;
  }

  return parseInt(node.dataset.estimate, 10) || 0;
};

const transform = kanban => {
  const columns = getColumns(kanban);
  const estimate = columns.map(column => column.points).reduce((a, b) => a + b, 0);
  const project = kanban.querySelector('.js-project-name-label');

  if (!project.dataset.name) {
    project.dataset.name = project.innerText;
  }

  if (project.dataset.estimate !== estimate.toString() || !project.dataset.touched) {
    project.dataset.estimate = estimate.toString();
    project.dataset.touched = true;
    project.innerHTML = `${project.dataset.name} <span class="ghp-estimate ghp-project-estimate">${estimate}</span>`;
  }
};

var css_248z = ".ghp-estimate{border:2px solid var(--color-border-tertiary);padding:3px .3em 0;border-radius:40% 0/15% 15%;position:relative;display:inline-block;text-align:center;line-height:1.1em;font-size:.9em;font-weight:700}.ghp-card-estimate{color:var(--color-fg-muted)}.js-project-card-issue-link .ghp-card-estimate{margin-top:-2px}.ghp-column-estimate{color:var(--color-fg-default)}";

document.head.append(VM.createElement("style", null, css_248z));
const kanban = document.querySelector('.js-project-container');
VM.observe(kanban, () => {
  transform(kanban);
});

}());
