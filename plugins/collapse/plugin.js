CKEDITOR.plugins.add("collapse", {
  requires: "widget",
  icons: "collapse",
  init: function init(editor) {
	editor.widgets.add("Collapse", {
	  buttonToolbar: "insert,14",
	  button: "添加折叠文本",
	  allowedContent: "collapse;div[data-tag]{*}(collapse,collapse-title,collapse-content);span;b",
	  requiredContent: "collapse",
	  draggable: false,
	  template: '<div data-tag="collapse" class="collapse"><span>折叠标题：</span><div class="collapse-title">点击展开</div><span>折叠内容：</span><div class="collapse-content"></div></div>',
	  editables: {
		title: {
		  selector: ".collapse-title",
		  allowedContent: "none"
		},
		content: {
		  selector: ".collapse-content"
		}
	  },
	  upcast: function upcast(element) {
		return element.attributes["data-tag"] === "collapse";
	  },
	  init: function init() {
		var element = this.element.findOne(".collapse-title");
		element.on("focus", function () {
		  editor.on("key", disableEnterKey);
		});
		element.on("blur", function () {
		  editor.removeListener("key", disableEnterKey);
		});

		function disableEnterKey(e) {
		  if (e.data.keyCode === 13) {
			e.cancel();
		  }
		}
	  }
	});
  }
});
