/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
(function () {
  CKEDITOR.on("dialogDefinition", function (ev) {
	var tab,
	  name = ev.data.name,
	  definition = ev.data.definition;

	if (name === "link") {
	  definition.removeContents("target");
	  definition.removeContents("upload");
	  definition.removeContents("advanced");
	  tab = definition.getContents("info");
	  var linkType = tab.get("linkType");
	  linkType.items = linkType.items.slice(0, 1);
	  var urlTypes = tab.get("urlOptions").children[0].children[0];
	  urlTypes.items = urlTypes.items.slice(0, 2);
	  tab.remove("anchorOptions");
	  tab.remove("emailOptions");
	  tab.remove("telOptions");
	} else if (name === "image") {
	  definition.removeContents("advanced");
	  tab = definition.getContents("Link");
	  tab.remove("cmbTarget");
	  tab = definition.getContents("info");
	  tab.remove("txtAlt");
	  var _float = tab.get("basic").children[1].children[3];
	  _float.label = "浮动方式";
	  _float.items[1][0] = "向左浮动";
	  _float.items[2][0] = "向右浮动";
	}
  });
  CKEDITOR.plugins.add("bbcode", {
	requires: "entities",
	// Adapt some critical editor configuration for better support
	// of BBCode environment.
	beforeInit: function beforeInit(editor) {
	  var config = editor.config;
	  editor.filter.allow(
		"div;details;summary;table{background-color};tr{background-color}"
	  );
	  editor.filter.disallow(
		"img{border-width,margin-left,margin-right,margin-top,margin-bottom};th;table[summary,border];caption;td{white-space,border-color}"
	  );
	  CKEDITOR.tools.extend(
		config,
		{
		  // This one is for backwards compatibility only as
		  // editor#enterMode is already set at this stage (https://dev.ckeditor.com/ticket/11202).
		  enterMode: CKEDITOR.ENTER_BR,
		  basicEntities: false,
		  entities: false,
		  fillEmptyBlocks: false
		},
		true
	  );

	  // Since CKEditor 4.3.0, editor#(active)enterMode is set before
	  // beforeInit. Properties got to be updated (https://dev.ckeditor.com/ticket/11202).
	  editor.activeEnterMode = editor.enterMode = CKEDITOR.ENTER_BR;

	  if (typeof BBCODE === 'undefined') {
		CKEDITOR.scriptLoader.load(CKEDITOR.getUrl("/new/ckeditor/bbcode.js"));
	  }
	},
	init: function init(editor) {
	  editor.dataProcessor.htmlFilter.addRules({
		elements: {
		  $: function $(element) {
			if (element.name === "a") {
			  if (!element.attributes["data-tag"]) {
				element.attributes["data-tag"] = "url";
			  }
			}

			return element;
		  }
		}
	  }, 1);

	  for (var _i = 0, _arr = ["p", "div", "details", "summary", "ul", "ol", "li"]; _i < _arr.length; _i++) {
		var tag = _arr[_i];
		editor.dataProcessor.writer.setRules(tag, {
		  breakBeforeOpen: 0,
		  breakAfterOpen: 0,
		  breakBeforeClose: 0,
		  breakAfterClose: 0
		});
	  }

	  editor.dataProcessor.toDataFormat = function (html, options) {
		return BBCODE.html2bbcode(html);
	  };

	  // 因为ckeditor有病会莫名其妙加换行，而且没有相关配置，所以在优先级为5的时候再解析
	  // 保证优先级在6以上处理器正常执行(尤其是优先级为8的小部件转换器) 优先级参考widgets源码和https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#event-toHtml
	  editor.on("toHtml", function (evt) {
		evt.data.bbcode = evt.data.dataValue;
	  }, null, null, 1);
	  editor.on("toHtml", function (evt) {
		if (evt.data.context === "body") {
		  evt.data.dataValue = CKEDITOR.htmlParser.fragment.fromHtml(
			BBCODE.bbcode2html(evt.data.bbcode, true)
		  );
		}
	  }, null, null, 5);
	  var autoBreakWidgets = ["Code", "Collapse", "Dice", "Notice", "Video", "Audio"];
	  editor.widgets.on("instanceCreated", function (evt) {
		var widget = evt.data;
		widget.once("focus", function (evt) {
		  if (autoBreakWidgets.indexOf(evt.sender.name) !== -1) {
			var selected = editor.getSelection().getStartElement();
			editor.execCommand("accessNextSpace");
			editor.getSelection().selectElement(selected);
			editor.execCommand("accessPreviousSpace");
			editor.getSelection().selectElement(selected);
		  }
		});
	  });
	}
  });
})();
