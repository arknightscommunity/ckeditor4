CKEDITOR.plugins.add("dice", {
  requires: "widget",
  icons: "dice",
  init: function init(editor) {
	editor.widgets.add("Dice", {
	  buttonToolbar: "insert,12",
	  button: "添加骰子",
	  allowedContent: "dice;div[data-tag]{*}(dice,dice-expression);span;b",
	  requiredContent: "dice",
	  draggable: false,
	  template: '<div data-tag="dice" class="dice"><div><span><b>骰子ROLL点表达式：</b></span><div class="dice-expression">d10</div></div></div>',
	  editables: {
		expression: {
		  selector: ".dice-expression",
		  allowedContent: "none"
		}
	  },
	  upcast: function upcast(element) {
		return element.attributes["data-tag"] === "dice";
	  },
	  init: function init() {
		var element = this.element.findOne(".dice-expression");
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
