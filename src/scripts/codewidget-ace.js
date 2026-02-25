export default class CodeWidgetAce extends H5P.AceEditor {
  constructor(parent, codingLanguage, question, options) {
    super(parent, options);
    this.codingLanguage = codingLanguage;
    this.question = question;
  }

  getPages() {
    return [];
  }

  getMode() {
    return `ace/mode/${this.language}`;
  }

  getButtons() {
    return [];
  }

  onChange() {
    this.setCode();
  }

  setCode() {
    const code = this.getCode();
    this.question.setValue(this.question.field, code);
  }

  setupObservers() {
    // pass
  }

  addButtonListeners() {}
}
