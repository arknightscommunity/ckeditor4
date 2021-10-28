CKEDITOR.plugins.add("code", {
  requires: "widget",
  icons: "code",
  init: function init(editor) {
	editor.widgets.add("Code", {
	  buttonToolbar: "custom1,40",
	  button: "添加代码",
	  allowedContent: "code;div[data-tag]{*}(code);pre(code-content);span",
	  requiredContent: "code",
	  draggable: false,
	  template: '<div data-tag="code" class="code"><span>代码文本：</span><pre class="code-content"></pre></div>',
	  editables: {
		content: {
		  selector: ".code-content",
		  allowedContent: "none"
		}
	  },
	  upcast: function upcast(element) {
		return element.attributes["data-tag"] === "code";
	  }
	});
  }
});
