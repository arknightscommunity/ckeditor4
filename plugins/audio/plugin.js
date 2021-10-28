CKEDITOR.plugins.add("audio", {
  requires: "widget",
  icons: "audio",
  init: function init(editor) {
	var typeGroupMap = {
	  netease: {
		name: "网易云音乐",
		types: {
		  "default-type": "song",
		  song: "单曲", // 2
		  playlist: "歌单", // 0
		  album: "专辑", // 1
		  radio: "电台", // 4
		  program: "电台单曲" // 3
		}
	  }
	};
	editor.widgets.add("Audio", {
	  buttonToolbar: "custom1,30",
	  button: "添加音乐",
	  allowedContent:
		"audio;div[data-tag,data-audio-type,data-audio-subtype,data-audio-value](audio);span(audio-type,audio-subtype,audio-value)",
	  requiredContent: "audio",
	  draggable: false,
	  dialog: "audio",
	  template:
		'<div data-tag="audio" class="audio">音乐来源：<span class="audio-type"></span><br/>音乐类型：<span class="audio-subtype"></span><br/>音乐ID：<span class="audio-value"></span></div>',
	  upcast: function upcast(element) {
		return element.attributes["data-tag"] === "audio";
	  },
	  init: function init() {
		var type = this.element.getAttribute("data-audio-type");

		if (type) {
		  this.setData("audioType", type);
		}

		var subtype = this.element.getAttribute("data-audio-subtype");

		if (subtype) {
		  this.setData("audioSubtype", subtype);
		}

		var value = this.element.getAttribute("data-audio-value");

		if (value) {
		  this.setData("audioValue", value);
		}
	  },
	  data: function data() {
		if (this.data.audioType && this.data.audioValue) {
		  this.element.setAttribute("data-audio-type", this.data.audioType);
		  this.element.setAttribute("data-audio-value", this.data.audioValue);
		  var typeInfo = typeGroupMap[this.data.audioType];

		  if (typeInfo) {
			var subtype = this.data.audioSubtype || typeInfo.types["default-type"];
			this.element.setAttribute("data-audio-subtype", subtype);
			this.element.findOne(".audio-type").setText(typeInfo.name);
			this.element
			  .findOne(".audio-subtype")
			  .setText(typeInfo.types[subtype]);
			this.element.findOne(".audio-value").setText(this.data.audioValue);
		  }
		}
	  }
	});
	CKEDITOR.dialog.add("audio", this.path + "dialogs/audio.js");
  }
});
