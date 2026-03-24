function SelectHandler(field, equals) {
  this.satisfied = function () {
    if (Array.isArray(equals)) {
      return equals.includes(field.value);
    }

    return field.value === equals;
  };
}

function LibraryHandler(field, equals) {
  this.satisfied = function () {
    let value;

    if (field.currentLibrary !== undefined && field.params.library) {
      value = field.currentLibrary.split(' ')[0];
    }

    if (Array.isArray(equals)) {
      return equals.includes(value);
    }

    return value === equals;
  };
}

function BooleanHandler(field, equals) {
  this.satisfied = function () {
    return field.value === equals;
  };
}

function createFieldHandler(field, equals) {
  if (!field?.field?.type) {
    return undefined;
  }

  if (field.field.type === 'library') {
    return new LibraryHandler(field, equals);
  }

  if (field.field.type === 'select') {
    return new SelectHandler(field, equals);
  }

  if (field.field.type === 'boolean') {
    return new BooleanHandler(field, equals);
  }

  return undefined;
}

function RuleHandler(type) {
  const TYPE_AND = 'and';
  const TYPE_OR = 'or';
  const handlers = [];

  type = type || TYPE_OR;

  this.add = function (handler) {
    handlers.push(handler);
  };

  this.rulesSatisfied = function () {
    for (let index = 0; index < handlers.length; index += 1) {
      const ruleHit = handlers[index].satisfied();

      if (ruleHit && type === TYPE_OR) {
        return true;
      }

      if (type === TYPE_AND && !ruleHit) {
        return false;
      }
    }

    return type === TYPE_AND;
  };
}

export default function PythonQuestionShowWhen(parent, field, params, setValue) {
  const self = this;

  self.field = field;
  self.passReadies = true;
  self.value = params;

  const $wrapper = H5PEditor.$('<div>', {
    class: 'field h5peditor-pythonquestion-show-when hidden'
  });
  let showing = false;
  const config = self.field.showWhen;

  if (config === undefined) {
    throw new Error('You need to set the showWhen property in semantics.json when using the pythonQuestionShowWhen widget');
  }

  const ruleHandler = new RuleHandler(config.type);

  const updateVisibility = () => {
    const rulesSatisfied = ruleHandler.rulesSatisfied();
    showing = rulesSatisfied;

    if (config.detach) {
      if (!self.$container) {
        return;
      }

      if (rulesSatisfied) {
        if (!$wrapper.parent().length) {
          $wrapper.appendTo(self.$container);
        }
      }
      else {
        $wrapper.detach();
      }
    }
    else {
      $wrapper.toggleClass('hidden', !rulesSatisfied);
    }

    if (config.nullWhenHidden && !rulesSatisfied) {
      setValue(self.field, undefined);
    }
  };

  for (let index = 0; index < config.rules.length; index += 1) {
    const rule = config.rules[index];
    const targetField = H5PEditor.findField(rule.field, parent);
    const handler = createFieldHandler(targetField, rule.equals);

    if (handler !== undefined) {
      ruleHandler.add(handler);
      H5PEditor.followField(parent, rule.field, updateVisibility);
    }
  }

  const widgetName = config.widget || field.type;
  const fieldInstance = new H5PEditor.widgets[widgetName](parent, field, params, setValue);
  fieldInstance.appendTo($wrapper);

  if (typeof fieldInstance.change === 'function') {
    self.change = function (callback) {
      fieldInstance.change(callback);
    };
  }

  self.appendTo = function ($container) {
    self.$container = $container;

    if (!config.detach || showing) {
      $wrapper.appendTo($container);
    }

    updateVisibility();
  };

  self.validate = function () {
    return showing ? fieldInstance.validate() : true;
  };

  self.remove = function () {};
}