CKEDITOR.dialog.add("audio", function (editor) {
  var typeSubMap = {
	netease: [
	  ["单曲", "song"],
	  ["歌单", "playlist"],
	  ["专辑", "album"],
	  ["电台", "radio"],
	  ["电台单曲", "program"]
	]
  };
  return {
	title: "音乐参数",
	minWidth: 350,
	minHeight: 200,
	contents: [
	  {
		id: "resloveLink",
		label: "解析链接",
		elements: [
		  {
			id: "audioLink",
			type: "text",
			label: "音乐链接"
		  },
		  {
			id: "audioLinkResloveBtn",
			type: "button",
			label: "点击解析",
			onClick: function onClick() {
			  var dialog = this.getDialog();
			  var eLink = dialog.getContentElement("resloveLink", "audioLink");
			  var eErr = dialog.getContentElement(
				"resloveLink",
				"audioLinkResloveErr"
			  );
			  var link = eLink.getValue();

			  if (!link) {
				eErr.setLabel(
				  "尚未输入音乐链接(可通过音乐播放器的链接分享功能获得)"
				);
				return;
			  }

			  var url;

			  try {
				url = new URL(link);
			  } catch (e) {
				console.log(e);
				eErr.setLabel(
				  "非法URL，请输入有效音乐链接(可通过音乐播放器的链接分享功能获得)"
				);
				return;
			  } // noinspection FallThroughInSwitchStatementJS

			  switch (url.host) {
				case "y.music.163.com":
				  link = link.replace(
					"//y.music.163.com/m/",
					"//music.163.com/"
				  );

				case "music.163.com":
				  url = new URL(
					link.replace("//music.163.com/#/", "//music.163.com/")
				  );
				  var id = url.searchParams.get("id");

				  if (/^\d+$/g.test(id)) {
					dialog
					  .getContentElement("info", "audioType")
					  .setValue("netease", undefined);
					dialog
					  .getContentElement("info", "audioValue")
					  .setValue(id, undefined);
					var eSubtype = dialog.getContentElement(
					  "info",
					  "audioSubtype"
					);

					switch (url.pathname.replaceAll("/", "")) {
					  case "playlist":
						eSubtype.setValue("playlist", undefined);
						break;

					  case "album":
						eSubtype.setValue("album", undefined);
						break;

					  case "djradio":
					  case "radio":
						eSubtype.setValue("radio", undefined);
						break;

					  case "dj":
					  case "program":
						eSubtype.setValue("program", undefined);
						break;

					  case "song":
					  default:
						eSubtype.setValue("song", undefined);
						break;
					}

					dialog.selectPage("info");
					eErr.setLabel("");
				  } else {
					eErr.setLabel(
					  "非法URL，请输入通过网易云音乐播放器的链接分享功能获得的URL"
					);
				  }

				  return;

				default:
				  eErr.setLabel("暂不支持解析来自[" + url.host + "]的音乐链接");
				  return;
			  }
			}
		  },
		  {
			id: "audioLinkResloveErr",
			type: "text",
			labelStyle: "color: red",
			inputStyle: "display: none"
		  },
		  {
			id: "audioLinkTip",
			type: "text",
			label: "请使用音乐播放器的分享功能复制链接",
			inputStyle: "display: none"
		  }
		]
	  },
	  {
		id: "info",
		label: "音乐参数",
		elements: [
		  {
			id: "audioType",
			type: "select",
			label: "音乐来源",
			items: [
			  ["未选择", ""],
			  ["网易云音乐", "netease"]
			],
			setup: function setup(widget) {
			  this.setValue(widget.data.audioType || "netease");
			},
			commit: function commit(widget) {
			  widget.setData("audioType", this.getValue());
			},
			validate: function validate() {
			  if (this.getValue()) {
				return true;
			  } else {
				alert("请选择音乐来源！");
				return false;
			  }
			},
			onChange: function onChange() {
			  var dialog = this.getDialog();
			  var eSubtype = dialog.getContentElement("info", "audioSubtype");
			  console.log(eSubtype);
			  eSubtype.clear();
			  var list = typeSubMap[this.getValue()];

			  if (Array.isArray(list)) {
				for (var i = 0; i < list.length; i++) {
				  var item = list[i];
				  eSubtype.add(item[0], item[1]);
				}
			  }
			}
		  },
		  {
			id: "audioSubtype",
			type: "select",
			label: "音乐类型",
			items: [["未选择", ""]],
			setup: function setup(widget) {
			  this.setValue(widget.data.audioType || "netease");
			},
			commit: function commit(widget) {
			  widget.setData("audioSubtype", this.getValue());
			}
		  },
		  {
			id: "audioValue",
			type: "text",
			label: "音乐ID",
			setup: function setup(widget) {
			  this.setValue(widget.data.audioValue);
			},
			commit: function commit(widget) {
			  widget.setData("audioValue", this.getValue());
			},
			validate: function validate() {
			  if (this.getValue()) {
				return true;
			  } else {
				alert("请输入音乐ID！");
				return false;
			  }
			}
		  }
		]
	  }
	]
  };
});
