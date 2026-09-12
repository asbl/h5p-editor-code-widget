import { describe, expect, it } from 'vitest';

import CodeWidgetContainer from '../src/scripts/codewidget-container.js';

describe('CodeWidgetContainer construction', () => {
  it('stores the coding language and forwards parent/options to the base container', () => {
    const parent = document.createElement('div');
    const container = new CodeWidgetContainer(parent, { codingLanguage: 'python' });

    expect(container.codingLanguage).toBe('python');
    expect(container.parent).toBe(parent);
  });

  it('disables line numbers for markdown fields', () => {
    const container = new CodeWidgetContainer(document.createElement('div'), {
      codingLanguage: 'markdown',
    });

    expect(container.showLineNumbers).toBe(false);
  });

  it('leaves line numbers untouched for non-markdown languages', () => {
    const container = new CodeWidgetContainer(document.createElement('div'), {
      codingLanguage: 'python',
    });

    expect(container.showLineNumbers).toBeUndefined();
  });
});

describe('CodeWidgetContainer regression: no dead base-class overrides', () => {
  // getPagemanager/getButtonManager/getMode/onChange/setCode were removed because
  // they were unreachable (wrong method name or never invoked by the base class)
  // or referenced state (`this.question`) that this class never sets. Re-adding
  // any of them without wiring them up properly would silently do nothing again,
  // or throw when the base class actually calls them.
  it('does not define getPagemanager (only the correctly-cased getPageManager exists on the base class)', () => {
    const container = new CodeWidgetContainer(document.createElement('div'), {});

    expect(typeof container.getPagemanager).toBe('undefined');
  });

  it('does not override getButtonManager, getMode, onChange or setCode', () => {
    const ownMethods = Object.getOwnPropertyNames(CodeWidgetContainer.prototype);

    expect(ownMethods).toEqual(['constructor']);
  });
});
