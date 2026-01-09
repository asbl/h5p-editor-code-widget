/** Class for H5P CodeWidget */
export default class CodeWidget {
  /**
   * @class
   * @param {object} parent Parent element in semantics.
   * @param {object} field Semantics field properties.
   * @param {object} params Parameters entered in editor form.
   * @param {function} setValue Callback to set parameters.
   */
  constructor(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;
    this.parentDiv = document.createElement("div");
    this.parentDiv.id = `h5p_codewidget_${H5P.createUUID()}`;
    this.parentDiv.classList.add("h5peditor-codewidget-field");
    // Let parent handle ready callbacks of children
    this.passReadies = true;
    // DOM
    this.$container = document.createElement("div");
    this.$container.className = "h5peditor-codewidget";
    this.$container.append(this.parentDiv);
    this.header = document.createElement("div");
    this.header.className = "h5peditor-label";
    this.header.innerHTML = this.field.label;
    this.parentDiv.append(this.header);
    this.wrapper = document.createElement("div");
    this.wrapper.id = `h5p_codewidget_wrapper_${H5P.createUUID()}`;
    this.wrapper.className = "ace_editor_wrapper";
    this.parentDiv.append(this.wrapper);
    const language = field.options?.[0]?.language ?? "python";
    const showAlways = field.options?.[0]?.showAlways ?? false;

    this.codeContainer = new H5PEditor.CodeWidgetContainer(
      this.wrapper,
      language,
      {
        code: this.params,
        manualSetup: true,
        hasButtons: false,
        hasConsole: false,
        language: language,
        showAlways: showAlways,
        onChangeCallback: (code) => {
          this.setValue(this.field, code);
        },
      },
    );

    if (field.optional && !showAlways) {
      let showButton = document.createElement("button");
      showButton.className = "show-widget-button";
      showButton.innerHTML = "Show Editor";
      this.parentDiv.appendChild(showButton);

      showButton.addEventListener("click", () => {
        this.wrapper.style.display = "block";
        showButton.style.display = "none";
      });
      this.wrapper.style.display = "none";
    }
  }

  /**
   * Append field to wrapper. Invoked by H5P core.
   * @param {H5P.jQuery} $wrapper Wrapper.
   */
  appendTo($wrapper) {
    const descriptionDiv = document.createElement("div");
    descriptionDiv.innerHTML = this.field.description;
    descriptionDiv.classList.add("description");
    $wrapper.get(0).appendChild(this.parentDiv);
    this.parentDiv.append(descriptionDiv);
    setTimeout(() => {
      this.codeContainer.setup();
    }, 100);
    // because document.ready is already called, editor.setup() is called here manually.
  }

  /**
   * Validate current values. Invoked by H5P core.
   * @returns {boolean} True, if current value is valid, else false.
   */
  validate() {
    return true;
  }

  /**
   * Remove self. Invoked by H5P core.
   */
  remove() {
    this.parentDiv.remove();
  }
}
