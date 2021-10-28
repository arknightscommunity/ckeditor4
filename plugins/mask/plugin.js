CKEDITOR.plugins.add("mask", {
  requires: "widget",
  icons: "mask",
  init: function init(editor) {
	editor.widgets.add("Mask", {
	  buttonToolbar: "insert,16",
	  button: "添加黑幕文本",
	  allowedContent: "mask;div[data-tag,title]{*}(mask,mask-content);span;b",
	  requiredContent: "mask",
	  draggable: false,
	  inline: true,
	  template:
		'<div data-tag="mask" class="mask" title="黑幕内容">请输入黑幕文字</div>',
	  editables: {
		content: {
		  selector: ".mask",
		  disallowedContent: "mask,collapse"
		}
	  },
	  upcast: function upcast(element) {
		return element.attributes["data-tag"] === "mask";
	  }
	});
  }
});
