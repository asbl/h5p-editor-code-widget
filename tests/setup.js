import { afterEach, vi } from 'vitest';

/**
 * Minimal jQuery-like wrapper covering only what pythonquestion-show-when.js
 * uses (H5PEditor.$ is real jQuery in production).
 * @param {*} elements Single DOM element or array of DOM elements.
 * @returns {object} Chainable wrapper.
 */
function wrap(elements) {
  const els = Array.isArray(elements) ? elements.filter(Boolean) : [elements].filter(Boolean);

  return {
    length: els.length,
    get: (index) => els[index],
    appendTo(target) {
      const targetEl = target?.get ? target.get(0) : target;
      if (targetEl) {
        els.forEach((el) => targetEl.appendChild(el));
      }
      return this;
    },
    detach() {
      els.forEach((el) => el.parentNode?.removeChild(el));
      return this;
    },
    parent() {
      return wrap(els[0]?.parentNode ? [els[0].parentNode] : []);
    },
    toggleClass(className, force) {
      els.forEach((el) => el.classList.toggle(className, force));
      return this;
    },
    hasClass(className) {
      return els[0]?.classList.contains(className) ?? false;
    },
    closest(selector) {
      const found = els[0]?.closest(selector) ?? null;
      return wrap(found ? [found] : []);
    },
    find(selector) {
      const found = els[0] ? Array.from(els[0].querySelectorAll(selector)) : [];
      return wrap(found);
    },
  };
}

function h5pEditorJQuery(htmlOrElement, attributes) {
  if (typeof htmlOrElement === 'string' && htmlOrElement.trim().startsWith('<')) {
    const tagName = htmlOrElement.replace(/[<>/]/g, '').trim();
    const element = document.createElement(tagName || 'div');
    if (attributes?.class) {
      element.className = attributes.class;
    }
    return wrap(element);
  }

  return wrap(htmlOrElement);
}

const missingTranslation = (library, key) => `[Missing translation ${library}:${key}]`;

globalThis.H5P = {
  t: vi.fn((key, _params, library) => missingTranslation(library, key)),
  createUUID: vi.fn(() => `uuid-${Math.random().toString(36).slice(2)}`),
  CodeContainer: class CodeContainer {
    constructor(parent, options) {
      this.parent = parent;
      this.options = options;
    }
  },
};

globalThis.H5PEditor = {
  t: vi.fn((library, key) => missingTranslation(library, key)),
  $: h5pEditorJQuery,
  findField: vi.fn(),
  widgets: {},
};

afterEach(() => {
  vi.useRealTimers();
  globalThis.H5P.t.mockReset();
  globalThis.H5P.t.mockImplementation((key, _params, library) => missingTranslation(library, key));
  globalThis.H5P.createUUID.mockClear();
  globalThis.H5PEditor.t.mockReset();
  globalThis.H5PEditor.t.mockImplementation((library, key) => missingTranslation(library, key));
  globalThis.H5PEditor.findField.mockReset();
  globalThis.H5PEditor.widgets = {};
});
