import { beforeEach, describe, expect, it, vi } from 'vitest';

import PythonQuestionShowWhen from '../src/scripts/pythonquestion-show-when.js';

class FakeFieldInstance {
  constructor(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;
    this.appendToCalls = [];
    this.validate = vi.fn(() => true);
  }

  appendTo($wrapper) {
    this.appendToCalls.push($wrapper);
  }
}

function selectTargetField(value) {
  return { field: { type: 'select' }, value, changes: [] };
}

function booleanTargetField(value) {
  return { field: { type: 'boolean' }, value, changes: [] };
}

function buildField(showWhen, overrides = {}) {
  return {
    type: 'text',
    showWhen,
    ...overrides,
  };
}

beforeEach(() => {
  globalThis.H5PEditor.widgets.text = FakeFieldInstance;
});

describe('PythonQuestionShowWhen setup', () => {
  it('throws when showWhen is not configured', () => {
    expect(() => new PythonQuestionShowWhen(null, { type: 'text' }, '', vi.fn()))
      .toThrow(/showWhen/);
  });

  it('instantiates the wrapped field widget and appends it into the internal wrapper', () => {
    globalThis.H5PEditor.findField.mockReturnValue(selectTargetField('a'));
    const field = buildField({ rules: [{ field: 'mode', equals: 'a' }] });

    const instance = new PythonQuestionShowWhen(null, field, 'params', vi.fn());

    expect(instance.appendTo).toBeTypeOf('function');
  });
});

describe('PythonQuestionShowWhen visibility rules (OR, default)', () => {
  it('is visible when a select rule matches one value in an array of equals', () => {
    globalThis.H5PEditor.findField.mockReturnValue(selectTargetField('blocks'));
    const field = buildField({ rules: [{ field: 'editorMode', equals: ['blocks', 'both'] }] });

    const instance = new PythonQuestionShowWhen(null, field, '', vi.fn());
    const container = document.createElement('div');
    instance.appendTo(globalThis.H5PEditor.$(container));

    const wrapperEl = container.querySelector('.h5peditor-pythonquestion-show-when');
    expect(wrapperEl.classList.contains('hidden')).toBe(false);
  });

  it('stays hidden when no rule matches', () => {
    globalThis.H5PEditor.findField.mockReturnValue(selectTargetField('text'));
    const field = buildField({ rules: [{ field: 'editorMode', equals: ['blocks', 'both'] }] });

    const instance = new PythonQuestionShowWhen(null, field, '', vi.fn());
    const container = document.createElement('div');
    instance.appendTo(globalThis.H5PEditor.$(container));

    const wrapperEl = container.querySelector('.h5peditor-pythonquestion-show-when');
    expect(wrapperEl.classList.contains('hidden')).toBe(true);
  });

  it('becomes visible reactively once a registered target field changes', () => {
    const target = selectTargetField('text');
    globalThis.H5PEditor.findField.mockReturnValue(target);
    const field = buildField({ rules: [{ field: 'editorMode', equals: 'blocks' }] });

    const instance = new PythonQuestionShowWhen(null, field, '', vi.fn());
    const container = document.createElement('div');
    instance.appendTo(globalThis.H5PEditor.$(container));
    const wrapperEl = container.querySelector('.h5peditor-pythonquestion-show-when');
    expect(wrapperEl.classList.contains('hidden')).toBe(true);

    target.value = 'blocks';
    target.changes.forEach((handler) => handler());

    expect(wrapperEl.classList.contains('hidden')).toBe(false);
  });
});

describe('PythonQuestionShowWhen visibility rules (AND)', () => {
  it('requires every rule to be satisfied', () => {
    const selectField = selectTargetField('ide_only');
    const booleanField = booleanTargetField(false);
    globalThis.H5PEditor.findField.mockImplementation((path) => (
      path === 'contentType' ? selectField : booleanField
    ));

    const field = buildField({
      type: 'and',
      rules: [
        { field: 'contentType', equals: ['ide_only', 'text_and_ide'] },
        { field: 'enabled', equals: true },
      ],
    });

    const instance = new PythonQuestionShowWhen(null, field, '', vi.fn());
    const container = document.createElement('div');
    instance.appendTo(globalThis.H5PEditor.$(container));
    const wrapperEl = container.querySelector('.h5peditor-pythonquestion-show-when');

    expect(wrapperEl.classList.contains('hidden')).toBe(true);

    booleanField.value = true;
    booleanField.changes.forEach((handler) => handler());

    expect(wrapperEl.classList.contains('hidden')).toBe(false);
  });
});

describe('PythonQuestionShowWhen nullWhenHidden', () => {
  it('clears the value once the field becomes hidden', () => {
    const target = selectTargetField('blocks');
    globalThis.H5PEditor.findField.mockReturnValue(target);
    const field = buildField({
      rules: [{ field: 'editorMode', equals: 'blocks' }],
      nullWhenHidden: true,
    });
    const setValue = vi.fn();

    const instance = new PythonQuestionShowWhen(null, field, 'value', setValue);
    const container = document.createElement('div');
    instance.appendTo(globalThis.H5PEditor.$(container));

    expect(setValue).not.toHaveBeenCalled();

    target.value = 'text';
    target.changes.forEach((handler) => handler());

    expect(setValue).toHaveBeenCalledWith(field, undefined);
  });
});

describe('PythonQuestionShowWhen detach mode', () => {
  it('only attaches the wrapper to the DOM while the rule is satisfied', () => {
    const target = selectTargetField('text');
    globalThis.H5PEditor.findField.mockReturnValue(target);
    const field = buildField({
      rules: [{ field: 'editorMode', equals: 'blocks' }],
      detach: true,
    });

    const instance = new PythonQuestionShowWhen(null, field, '', vi.fn());
    const container = document.createElement('div');
    instance.appendTo(globalThis.H5PEditor.$(container));

    expect(container.querySelector('.h5peditor-pythonquestion-show-when')).toBeNull();

    target.value = 'blocks';
    target.changes.forEach((handler) => handler());

    expect(container.querySelector('.h5peditor-pythonquestion-show-when')).not.toBeNull();

    target.value = 'text';
    target.changes.forEach((handler) => handler());

    expect(container.querySelector('.h5peditor-pythonquestion-show-when')).toBeNull();
  });
});

describe('PythonQuestionShowWhen#validate', () => {
  it('returns true while hidden, without asking the wrapped field to validate', () => {
    const target = selectTargetField('text');
    globalThis.H5PEditor.findField.mockReturnValue(target);
    const field = buildField({ rules: [{ field: 'editorMode', equals: 'blocks' }] });

    let createdInstance;
    globalThis.H5PEditor.widgets.text = class extends FakeFieldInstance {
      constructor(...args) {
        super(...args);
        createdInstance = this;
      }
    };

    const instance = new PythonQuestionShowWhen(null, field, '', vi.fn());
    const container = document.createElement('div');
    instance.appendTo(globalThis.H5PEditor.$(container));

    expect(instance.validate()).toBe(true);
    expect(createdInstance.validate).not.toHaveBeenCalled();
  });

  it('delegates to the wrapped field instance validate() once visible', () => {
    const target = selectTargetField('blocks');
    globalThis.H5PEditor.findField.mockReturnValue(target);
    const field = buildField({ rules: [{ field: 'editorMode', equals: 'blocks' }] });

    let createdInstance;
    globalThis.H5PEditor.widgets.text = class extends FakeFieldInstance {
      constructor(...args) {
        super(...args);
        createdInstance = this;
      }
    };

    const instance = new PythonQuestionShowWhen(null, field, '', vi.fn());
    const container = document.createElement('div');
    instance.appendTo(globalThis.H5PEditor.$(container));

    createdInstance.validate.mockReturnValue(false);

    expect(instance.validate()).toBe(false);
    expect(createdInstance.validate).toHaveBeenCalled();
  });
});

describe('PythonQuestionShowWhen#change delegation', () => {
  it('exposes change() when the wrapped field instance supports it', () => {
    globalThis.H5PEditor.findField.mockReturnValue(selectTargetField('a'));
    globalThis.H5PEditor.widgets.text = class extends FakeFieldInstance {
      constructor(...args) {
        super(...args);
        this.change = vi.fn();
      }
    };
    const field = buildField({ rules: [{ field: 'mode', equals: 'a' }] });

    const instance = new PythonQuestionShowWhen(null, field, '', vi.fn());

    expect(typeof instance.change).toBe('function');
  });

  it('does not expose change() when the wrapped field instance lacks it', () => {
    globalThis.H5PEditor.findField.mockReturnValue(selectTargetField('a'));
    const field = buildField({ rules: [{ field: 'mode', equals: 'a' }] });

    const instance = new PythonQuestionShowWhen(null, field, '', vi.fn());

    expect(instance.change).toBeUndefined();
  });
});

describe('PythonQuestionShowWhen rule registration retries', () => {
  it('keeps retrying until the target field becomes available', () => {
    vi.useFakeTimers();
    const target = selectTargetField('blocks');
    let attempts = 0;
    globalThis.H5PEditor.findField.mockImplementation(() => {
      attempts += 1;
      return attempts < 3 ? undefined : target;
    });
    const field = buildField({ rules: [{ field: 'editorMode', equals: 'blocks' }] });

    const instance = new PythonQuestionShowWhen(null, field, '', vi.fn());
    const container = document.createElement('div');
    instance.appendTo(globalThis.H5PEditor.$(container));

    vi.runAllTimers();

    const wrapperEl = container.querySelector('.h5peditor-pythonquestion-show-when');
    expect(wrapperEl.classList.contains('hidden')).toBe(false);
    expect(attempts).toBe(3);
  });

  it('gives up after 25 attempts without throwing', () => {
    vi.useFakeTimers();
    globalThis.H5PEditor.findField.mockReturnValue(undefined);
    const field = buildField({ rules: [{ field: 'missingField', equals: 'a' }] });

    expect(() => new PythonQuestionShowWhen(null, field, '', vi.fn())).not.toThrow();
    expect(() => vi.runAllTimers()).not.toThrow();
    expect(globalThis.H5PEditor.findField.mock.calls.length).toBe(26);
  });
});
