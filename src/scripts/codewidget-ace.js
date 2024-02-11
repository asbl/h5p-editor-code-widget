export default class CodeWidgetAce extends H5P.AceEditor {
  
  constructor(parent, language, question, options) {
    super(parent, options); 
    this.language = language;
    this.question = question;
    if (this.language === 'markdown') {
      this.showLineNumbers = false;
    }
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

  setCode()  {
    const code = this.getCode();
    this.question.setValue(this.question.field, code);
  }
 
  setupObservers()  {
    // pass
  }

  addButtonListeners() {
  }
}