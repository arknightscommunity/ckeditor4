CKEDITOR.plugins.add("video", {
  requires: "widget",
  icons: "video",
  init: function init(editor) {
	var typeGroupMap = {
	  bvideo: "B站"
	};
	typeGroupMap["video"] = typeGroupMap["bvideo"];
	editor.widgets.add("Video", {
	  buttonToolbar: "custom1,20",
	  button: "添加视频",
	  allowedContent:
		"video;div[data-tag,data-video-type,data-video-value](video);span(video-type,video-value)",
	  requiredContent: "video",
	  draggable: false,
	  dialog: "video",
	  template: '<div data-tag="video" class="video">视频来源：<span class="video-type"></span><br/>视频ID：<span class="video-value"></span></div>',
	  upcast: function upcast(element) {
		return element.attributes["data-tag"] === "video";
	  },
	  init: function init() {
		var type = this.element.getAttribute("data-video-type");

		if (type) {
		  this.setData("videoType", type);
		}

		var value = this.element.getAttribute("data-video-value");

		if (value) {
		  this.setData("videoValue", value);
		}
	  },
	  data: function data() {
		if (this.data.videoType && this.data.videoValue) {
		  this.element.setAttribute("data-video-type", this.data.videoType);
		  this.element.setAttribute("data-video-value", this.data.videoValue);
		  this.element
			.findOne(".video-type")
			.setText(typeGroupMap[this.data.videoType]);
		  this.element.findOne(".video-value").setText(this.data.videoValue);
		}
	  }
	});
	CKEDITOR.dialog.add("video", this.path + "dialogs/video.js");
  }
});
