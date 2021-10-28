CKEDITOR.dialog.add("video", function (editor) {
  var typeMap = {
	bvideo: "BV号"
  };
  var currentLabel = "视频ID";
  return {
	title: "视频参数",
	minWidth: 150,
	minHeight: 200,
	contents: [
	  {
		id: "info",
		elements: [
		  {
			id: "videoType",
			type: "select",
			label: "视频来源",
			items: [
			  ["未选择", ""],
			  ["B站", "bvideo"]
			],
			setup: function setup(widget) {
			  this.setValue(widget.data.videoType || "bvideo");
			},
			commit: function commit(widget) {
			  widget.setData("videoType", this.getValue());
			},
			validate: function validate() {
			  if (this.getValue()) {
				return true;
			  } else {
				alert("请选择视频来源！");
				return false;
			  }
			},
			onChange: function onChange() {
			  var dialog = this.getDialog();
			  var sectionElement = dialog.getContentElement(
				"info",
				"videoValue"
			  );
			  currentLabel = typeMap[this.getValue()] || "视频ID";
			  sectionElement.setLabel(currentLabel);
			}
		  },
		  {
			id: "videoValue",
			type: "text",
			label: "视频ID",
			setup: function setup(widget) {
			  this.setValue(widget.data.videoValue);
			},
			commit: function commit(widget) {
			  widget.setData("videoValue", this.getValue());
			},
			validate: function validate() {
			  if (this.getValue()) {
				return true;
			  } else {
				alert("请输入" + currentLabel + "！");
				return false;
			  }
			}
		  }
		]
	  }
	]
  };
});
