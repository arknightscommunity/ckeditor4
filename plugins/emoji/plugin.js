/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
(function () {
  "use strict";

  var stylesLoaded = false,
	arrTools = CKEDITOR.tools.array,
	ICON_SIZE = 21,
	htmlEncode = CKEDITOR.tools.htmlEncode,
	EmojiDropdown = CKEDITOR.tools.createClass({
	  $: function $(editor, plugin) {
		var lang = (this.lang = editor.lang.emoji),
		  self = this;
		this.listeners = [];
		this.plugin = plugin;
		this.editor = editor;
		this.groups = []; // Keeps html elements references to not find them again.

		this.elements = {}; // Below line might be removable

		editor.ui.addToolbarGroup("emoji", "insert"); // Name is responsible for icon name also.

		editor.ui.add("EmojiPanel", CKEDITOR.UI_PANELBUTTON, {
		  label: "emoji",
		  title: "表情包",
		  modes: {
			wysiwyg: 1
		  },
		  editorFocus: 0,
		  toolbar: "insert,5",
		  panel: {
			css: [
			  CKEDITOR.skin.getPath("editor"),
			  plugin.path + "skins/default.css"
			],
			attributes: {
			  role: "listbox",
			  "aria-label": lang.title
			},
			markFirst: false
		  },
		  onBlock: function onBlock(panel, block) {
			var keys = block.keys;
			keys[39] = "next"; // ARROW-RIGHT

			keys[40] = "next"; // ARROW-DOWN

			keys[9] = "next"; // TAB

			keys[37] = "prev"; // ARROW-LEFT

			keys[38] = "prev"; // ARROW-UP

			keys[CKEDITOR.SHIFT + 9] = "prev"; // SHIFT + TAB

			keys[32] = "click"; // SPACE

			self.blockElement = block.element;
			self.groups = self.editor._.emoji.list;
			block.element.getAscendant("html").addClass("cke_emoji");
			block.element
			  .getDocument()
			  .appendStyleSheet(
				CKEDITOR.getUrl(CKEDITOR.basePath + "contents.css")
			  );
			block.element.addClass("cke_emoji-panel_block");
			block.element.setHtml(self.createEmojiBlock());
			block.element.removeAttribute("title");
			panel.element.addClass("cke_emoji-panel");
			self.items = block._.getItems();
			self.blockObject = block;
			self.elements.emojiItems = block.element.find(
			  ".cke_emoji-outer_emoji_block li > span"
			);
			self.elements.sectionHeaders = block.element.find(
			  ".cke_emoji-outer_emoji_block h2"
			);
			self.elements.emojiBlock = block.element.findOne(
			  ".cke_emoji-outer_emoji_block"
			);
			self.elements.navigationItems = block.element.find("nav li");
			self.elements.sections = block.element.find("section");
			self.registerListeners();
		  },
		  onOpen: self.openReset()
		});
	  },
	  proto: {
		registerListeners: function registerListeners() {
		  arrTools.forEach(
			this.listeners,
			function (item) {
			  var root = this.blockElement,
				selector = item.selector,
				listener = item.listener,
				event = item.event,
				ctx = item.ctx || this;
			  arrTools.forEach(root.find(selector).toArray(), function (node) {
				node.on(event, listener, ctx);
			  });
			},
			this
		  );
		},
		createEmojiBlock: function createEmojiBlock() {
		  var output = []; // (#2607)

		  this.loadSVGNavigationIcons();
		  output.push(this.createGroupsNavigation());
		  output.push(this.createEmojiListBlock());
		  return (
			'<div class="cke_emoji-inner_panel">' + output.join("") + "</div>"
		  );
		},
		createGroupsNavigation: function createGroupsNavigation() {
		  var itemTemplate, items;
		  itemTemplate = new CKEDITOR.template(
			'<li class="cke_emoji-navigation_item" data-cke-emoji-group="{group}"><span>{name}</span></li>'
		  );
		  items = arrTools.reduce(
			this.groups,
			function (acc, item) {
			  if (!item.items.length) {
				return acc;
			  } else {
				return (
				  acc +
				  itemTemplate.output({
					group: htmlEncode(item.name),
					name: htmlEncode(item.sectionName),
					positionX: item.position.x,
					positionY: item.position.y
				  })
				);
			  }
			},
			""
		  );
		  this.listeners.push({
			selector: "nav",
			event: "click",
			listener: function listener(event) {
			  var activeElement = event.data
				.getTarget()
				.getAscendant("li", true);

			  if (!activeElement) {
				return;
			  }

			  arrTools.forEach(
				this.elements.navigationItems.toArray(),
				function (node) {
				  if (node.equals(activeElement)) {
					node.addClass("active");
				  } else {
					node.removeClass("active");
				  }
				}
			  );
			  this.moveFocus(activeElement.data("cke-emoji-group"));
			  event.data.preventDefault();
			}
		  });
		  return (
			'<nav aria-label="' +
			htmlEncode(this.lang.navigationLabel) +
			'"><ul>' +
			items +
			"</ul></nav>"
		  );
		},
		createEmojiListBlock: function createEmojiListBlock() {
		  var self = this;
		  this.listeners.push({
			selector: ".cke_emoji-outer_emoji_block",
			event: "scroll",
			listener: (function () {
			  var buffer = CKEDITOR.tools.throttle(
				150,
				self.refreshNavigationStatus,
				self
			  );
			  return buffer.input;
			})()
		  });
		  this.listeners.push({
			selector: ".cke_emoji-outer_emoji_block",
			event: "click",
			listener: function listener(event) {
			  if (event.data.getTarget().data("cke-emoji-id")) {
				this.editor.execCommand("insertEmoji", {
				  emojiText: event.data.getTarget().data("cke-emoji-id")
				});
			  }

			  event.data.preventDefault();
			}
		  });
		  return (
			'<div class="cke_emoji-outer_emoji_block">' +
			this.getEmojiSections() +
			"</div>"
		  );
		},
		getEmojiSections: function getEmojiSections() {
		  return arrTools.reduce(
			this.groups,
			function (acc, item) {
			  // If group is empty skip it.
			  if (!item.items.length) {
				return acc;
			  } else {
				return acc + this.getEmojiSection(item);
			  }
			},
			"",
			this
		  );
		},
		getEmojiSection: function getEmojiSection(item) {
		  var groupName = htmlEncode(item.name),
			sectionName = htmlEncode(item.sectionName),
			group = this.getEmojiListGroup(item.items);
		  return (
			'<section data-cke-emoji-group="' +
			groupName +
			'" ><h2 id="' +
			groupName +
			'" style="display: none">' +
			sectionName +
			"</h2><ul>" +
			group +
			"</ul></section>"
		  );
		},
		getEmojiListGroup: function getEmojiListGroup(items) {
		  var emojiTpl = new CKEDITOR.template(
			'<li class="cke_emoji-item">' +
			'<img data-cke-emoji-group="{group}" data-cke-emoji-id="{id}" src="{url}" alt="{name}">' +
			"</li>"
		  );
		  return arrTools.reduce(
			items,
			function (acc, item) {
			  return (
				acc +
				emojiTpl.output({
				  url: htmlEncode(item.url),
				  id: htmlEncode(item.id),
				  name: item.id,
				  group: htmlEncode(item.group)
				})
			  );
			},
			"",
			this
		  );
		},
		openReset: function openReset() {
		  // Resets state of emoji dropdown.
		  var self = this,
			firstCall;
		  return function () {
			if (!firstCall) {
			  firstCall = true;
			}

			self.elements.emojiBlock.$.scrollTop = 0;
			self.refreshNavigationStatus();
		  };
		},
		refreshNavigationStatus: function refreshNavigationStatus() {
		  var containerOffset = this.elements.emojiBlock.getClientRect().top,
			section,
			groupName;
		  section = arrTools.filter(
			this.elements.sections.toArray(),
			function (element) {
			  var rect = element.getClientRect();

			  if (!rect.height || element.findOne("h2").hasClass("hidden")) {
				return false;
			  }

			  return rect.height + rect.top > containerOffset;
			}
		  );
		  groupName = section.length ? section[0].data("cke-emoji-group") : false;
		  arrTools.forEach(
			this.elements.navigationItems.toArray(),
			function (node) {
			  if (node.data("cke-emoji-group") === groupName) {
				node.addClass("active");
			  } else {
				node.removeClass("active");
			  }
			}
		  );
		},
		moveFocus: function moveFocus(groupName) {
		  var firstSectionItem = this.blockElement.findOne(
			  'img[data-cke-emoji-group="' + htmlEncode(groupName) + '"]'
			),
			itemIndex;

		  if (!firstSectionItem) {
			return;
		  }

		  itemIndex = this.getItemIndex(this.items, firstSectionItem);
		  firstSectionItem.focus(true);
		  firstSectionItem.scrollIntoView(true);

		  this.blockObject._.markItem(itemIndex);
		},
		getItemIndex: function getItemIndex(nodeList, item) {
		  return arrTools.indexOf(nodeList.toArray(), function (element) {
			return element.equals(item);
		  });
		},
		// To avoid CORS issues due to XML-based SVG icons, they should be loaded into the panel document.
		// This method ensures that the icons are loaded locally.
		loadSVGNavigationIcons: function loadSVGNavigationIcons() {
		  if (!this.editor.plugins.emoji.isSVGSupported()) {
			return;
		  }

		  var doc = this.blockElement.getDocument();
		  CKEDITOR.ajax.load(
			CKEDITOR.getUrl(this.plugin.path + "assets/iconsall.svg"),
			function (html) {
			  var container = new CKEDITOR.dom.element("div");
			  container.addClass("cke_emoji-navigation_icons");
			  container.setHtml(html);
			  doc.getBody().append(container);
			}
		  );
		}
	  }
	});
  CKEDITOR.plugins.add("emoji", {
	requires: "ajax,panelbutton",
	lang: "zh-cn",
	icons: "emojipanel",
	hidpi: true,
	isSupportedEnvironment: function isSupportedEnvironment() {
	  return !CKEDITOR.env.ie || CKEDITOR.env.version >= 11;
	},
	beforeInit: function beforeInit() {
	  if (!this.isSupportedEnvironment()) {
		return;
	  }

	  if (!stylesLoaded) {
		CKEDITOR.document.appendStyleSheet(this.path + "skins/default.css");
		stylesLoaded = true;
	  }
	},
	init: function init(editor) {
	  if (!this.isSupportedEnvironment()) {
		return;
	  }

	  CKEDITOR.ajax.load(editor.config.emoji_emojiListUrl, function (data) {
		if (data === null) {
		  return;
		}

		if (editor._.emoji === undefined) {
		  editor._.emoji = {};
		}

		var groups = [];

		if (editor._.emoji.list === undefined) {
		  var dom = new DOMParser().parseFromString(data, "text/html");
		  var header = dom.getElementsByClassName("header")[0];
		  var content = dom.getElementsByClassName("content")[0];
		  var headers;

		  if (header) {
			headers = Array.from(header.getElementsByTagName("li")).map(
			  function (x) {
				return x.textContent;
			  }
			);
		  } else {
			headers = ["表情包"];
		  }

		  var contents = content.getElementsByTagName("ul");

		  for (var i = 0; i < headers.length; i++) {
			var groupName = headers[i];
			var group = {
			  name: groupName,
			  sectionName: groupName,
			  position: {
				x: -1 * (i + 1) * ICON_SIZE,
				y: 0
			  },
			  items: []
			};
			var spans = Array.from(contents[i].getElementsByTagName("span"));

			for (var j = 0; j < spans.length; j++) {
			  var span = spans[j];
			  var classList = Array.from(span.classList);

			  for (var k = 0; k < classList.length; k++) {
				var cls = classList[k];

				if (cls.indexOf("smile-") === 0) {
				  group.items.push({
					id: cls.replace("smile-", "s-"),
					group: groupName,
					url: span.getElementsByTagName("img")[0].getAttribute("src")
				  });
				}
			  }
			}

			groups.push(group);
		  }

		  editor._.emoji.list = groups;
		}
	  });
	  editor.addCommand("insertEmoji", {
		exec: function exec(editor, data) {
		  var dom = editor.document.createElement("span");
		  dom.setHtml("&nbsp;[" + data.emojiText + "]&nbsp;");
		  editor.insertElement(dom);
		}
	  });

	  if (editor.plugins.toolbar) {
		new EmojiDropdown(editor, this);
	  }
	},
	isSVGSupported: function isSVGSupported() {
	  return !CKEDITOR.env.ie || CKEDITOR.env.edge;
	}
  });
})();
