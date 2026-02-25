export default class CodeWidgetContainer extends H5P.CodeContainer {
  constructor(parent, options) {
    super(parent, options);

    this.codingLanguage = options.codingLanguage;
    if (this.codingLanguage === "markdown") {
      this.showLineNumbers = false;
    }
  }

  getPagemanager(parent, options, empty) {
    return super.getPageManager(parent, options, true);
  }

  getButtonManager(parent, options, empty) {
    return super.getButtonManager(parent, options, true);
  }

  getMode() {
    return `ace/mode/${this.language}`;
  }

  onChange() {
    this.setCode();
  }

  setCode() {
    this.question.setValue(this.question.field, code);
  }
}
