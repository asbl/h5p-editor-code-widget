export default class CodeWidgetContainer extends H5P.CodeContainer {
  constructor(parent, options) {
    super(parent, options);

    this.codingLanguage = options.codingLanguage;
    if (this.codingLanguage === 'markdown') {
      this.showLineNumbers = false;
    }
  }
}
