import { beforeEach, describe, expect, it, vi } from 'vitest';

import CodeWidget from '../src/scripts/h5peditor-code-widget.js';

let constructorCalls;

beforeEach(() => {
  constructorCalls = [];

  globalThis.H5PEditor.CodeWidgetContainer = class {
    constructor(wrapper, options) {
      this.wrapper = wrapper;
      this.options = options;
      this.setup = vi.fn();
      constructorCalls.push(this);
    }
  };
});

function buildField(overrides = {}) {
  return {
    label: 'Code',
    description: 'Enter your code',
    optional: false,
    options: [{}],
    ...overrides,
  };
}

describe('CodeWidget construction', () => {
  it('builds the label and wrapper DOM', () => {
    const field = buildField();
    const widget = new CodeWidget(null, field, 'print(1)', vi.fn());

    expect(widget.header.textContent).toBe('Code');
    expect(widget.wrapper.className).toBe('ace_editor_wrapper');
    expect(widget.parentDiv.classList.contains('h5peditor-codewidget-field')).toBe(true);
  });

  it('defaults language to python and theme to light', () => {
    new CodeWidget(null, buildField(), '', vi.fn());

    expect(constructorCalls[0].options).toMatchObject({
      codingLanguage: 'python',
      theme: 'light',
      hasButtons: false,
      hasConsole: false,
    });
  });

  it('passes language, showAlways and theme from field options through', () => {
    const field = buildField({ options: [{ language: 'sql', showAlways: true, theme: 'dark' }] });
    new CodeWidget(null, field, '', vi.fn());

    expect(constructorCalls[0].options).toMatchObject({
      codingLanguage: 'sql',
      showAlways: true,
      theme: 'dark',
    });
  });

  it('passes the initial params as code', () => {
    new CodeWidget(null, buildField(), 'initial code', vi.fn());

    expect(constructorCalls[0].options.code).toBe('initial code');
  });
});

describe('CodeWidget onChangeCallback', () => {
  it('updates params and forwards the value to setValue', () => {
    const setValue = vi.fn();
    const field = buildField();
    const widget = new CodeWidget(null, field, '', setValue);

    constructorCalls[0].options.onChangeCallback('new code');

    expect(widget.params).toBe('new code');
    expect(setValue).toHaveBeenCalledWith(field, 'new code');
  });
});

describe('CodeWidget optional show/hide toggle', () => {
  it('renders a translated "show editor" button and hides the wrapper when optional and not shown always', () => {
    const field = buildField({ optional: true, options: [{}] });
    const widget = new CodeWidget(null, field, '', vi.fn());

    expect(globalThis.H5PEditor.t).toHaveBeenCalledWith('H5PEditor.CodeWidget', 'showEditor');
    const button = widget.parentDiv.querySelector('.show-widget-button');
    expect(button).not.toBeNull();
    expect(widget.wrapper.style.display).toBe('none');
  });

  it('reveals the wrapper and hides the button on click', () => {
    const field = buildField({ optional: true, options: [{}] });
    const widget = new CodeWidget(null, field, '', vi.fn());
    const button = widget.parentDiv.querySelector('.show-widget-button');

    button.click();

    expect(widget.wrapper.style.display).toBe('block');
    expect(button.style.display).toBe('none');
  });

  it('does not render a button when the field is optional but showAlways is set', () => {
    const field = buildField({ optional: true, options: [{ showAlways: true }] });
    const widget = new CodeWidget(null, field, '', vi.fn());

    expect(widget.parentDiv.querySelector('.show-widget-button')).toBeNull();
    expect(widget.wrapper.style.display).not.toBe('none');
  });

  it('does not render a button when the field is required', () => {
    const field = buildField({ optional: false, options: [{}] });
    const widget = new CodeWidget(null, field, '', vi.fn());

    expect(widget.parentDiv.querySelector('.show-widget-button')).toBeNull();
  });
});

describe('CodeWidget#validate', () => {
  it('rejects an empty value on a required field', () => {
    const widget = new CodeWidget(null, buildField({ optional: false }), '', vi.fn());

    expect(widget.validate()).toBe(false);
  });

  it('accepts a non-empty value on a required field', () => {
    const widget = new CodeWidget(null, buildField({ optional: false }), 'print(1)', vi.fn());

    expect(widget.validate()).toBe(true);
  });

  it('accepts an empty value on an optional field', () => {
    const widget = new CodeWidget(null, buildField({ optional: true }), '', vi.fn());

    expect(widget.validate()).toBe(true);
  });

  it('reflects values written through onChangeCallback', () => {
    const widget = new CodeWidget(null, buildField({ optional: false }), '', vi.fn());

    constructorCalls[0].options.onChangeCallback('print(1)');

    expect(widget.validate()).toBe(true);
  });
});

describe('CodeWidget#appendTo', () => {
  it('appends the field and description to the wrapper, and sets up the editor asynchronously', () => {
    vi.useFakeTimers();
    const widget = new CodeWidget(null, buildField(), '', vi.fn());
    const container = document.createElement('div');
    const $wrapper = { get: () => container };

    widget.appendTo($wrapper);

    expect(container.contains(widget.parentDiv)).toBe(true);
    expect(widget.parentDiv.querySelector('.description').textContent).toBe('Enter your code');
    expect(constructorCalls[0].setup).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(constructorCalls[0].setup).toHaveBeenCalledTimes(1);
  });
});

describe('CodeWidget#remove', () => {
  it('removes the field from the DOM', () => {
    const widget = new CodeWidget(null, buildField(), '', vi.fn());
    const container = document.createElement('div');
    container.appendChild(widget.parentDiv);

    widget.remove();

    expect(container.contains(widget.parentDiv)).toBe(false);
  });
});
