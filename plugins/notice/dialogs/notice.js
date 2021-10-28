CKEDITOR.dialog.add("notice", function (editor) {
  return {
	title: "选择提醒类型",
	minWidth: 150,
	minHeight: 60,
	contents: [
	  {
		id: "info",
		elements: [
		  {
			id: "noticeTip",
			type: "button",
			label: "除剧透和推测外其它贴条限管理人员使用，非管理人员使用无效"
		  },
		  {
			id: "noticeType",
			type: "select",
			label: "类型",
			items: [
			  ["未选择", ""],
			  ["剧透", "jutou"],
			  ["推测", "predict"],
			  ["现实交易", "rmt"],
			  ["警告", "warn"],
			  ["反馈-已记录", "rec"],
			  ["反馈-已解决", "succ"],
			  ["反馈-无法解决", "fail"],
			  ["精华-文章", "post"],
			  ["精华-画", "paint"],
			  ["精华-安科", "rpg"],
			  ["精华-考据", "kaoju"],
			  ["精华-攻略", "gonglve"]
			],
			setup: function setup(widget) {
			  this.setValue(widget.data.noticeType);
			},
			commit: function commit(widget) {
			  widget.setData("noticeType", this.getValue());
			},
			validate: function validate() {
			  if (this.getValue()) {
				return true;
			  } else {
				alert("请选择提醒类型！");
				return false;
			  }
			}
		  }
		]
	  }
	]
  };
});
