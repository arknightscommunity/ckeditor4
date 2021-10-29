/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// TODO 还缺registerCKEditor的内容没弄过来(registerCKEditor考虑在bbs项目中作为动态配置导入)
CKEDITOR.editorConfig = function( config ) {
  // %REMOVE_START%
  config.plugins = "autosave,basicstyles,blockquote,clipboard,colorbutton,colordialog,contextmenu,divarea,elementspath,enterkey,entities,filebrowser,floatingspace,font,format,horizontalrule,htmlwriter,image,indentlist,justify,link,list,magicline,maximize,mentions,panelbutton,pastefromword,pastetext,removeformat,resize,showborders,sourcearea,tab,table,tableselection,tabletools,toolbar,undo,uploadimage,wysiwygarea,bbcode,emoji,dice,collapse,mask,notice,video,audio,code";
  // %REMOVE_END%
  config.toolbarGroups = [
	{name: 'tools', groups: ['tools']},
	{name: 'document', groups: ['mode', 'document', 'doctools']},
	{name: 'clipboard', groups: ['clipboard', 'undo']},
	{name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing']},
	{name: 'links', groups: ['links']},
	{name: 'insert', groups: ['insert']},
	{name: 'custom1', groups: ['custom1']},
	{name: 'forms', groups: ['forms']},
	{name: 'others', groups: ['others']},
	{name: 'colors', groups: ['colors']},
	{name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
	{name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph']},
	{name: 'styles', groups: ['styles']},
	{name: 'about', groups: ['about']}
  ];

  config.title = false;
  config.language = 'zh-cn';
  config.removeDialogTabs = 'image:Link;image:advanced;';
  config.removeButtons = 'Subscript,Superscript,Font,Outdent,Indent,Anchor,Cut,Copy,Preview,RemoveFormat,JustifyBlock,Paste,PasteText,PasteFromWord';

  config.pasteFilter = null;
  config.image_previewText = '本段文字仅用于预览图片格式，不会出现在帖子中。欢迎来到泰拉通讯枢纽，本论坛由明日方舟玩家建立,仅限于发布明日方舟及其二创相关内容，在本论坛发言默认遵守总版规和各分区版规。对于违反版规的帖子，我们会进行关闭回复、删除帖子、禁言等处理。\n';

  config.tabSpaces = 4;
  config.coreStyles_bold = {element: 'b', overrides: 'strong'};
  config.coreStyles_italic = {element: 'i', overrides: 'em'};
  config.format_tags = 'p;h1;h2;h3';
  config.fontSize_sizes = '1/12px;2/13px;3/16px;4/18px;5/24px;6/32px;7/48px';
  config.colorButton_backStyle = {
	element: 'span',
	styles: {'background-color': '#(color)'},
	attributes: {'data-color': '#(color)', 'data-tag': 'bgcolor'}
  };
  config.colorButton_foreStyle = {
	element: 'span',
	styles: {'color': '#(color)'},
	attributes: {'data-color': '#(color)', 'data-tag': 'color'}
  };
  config.fontSize_style = {
	element: 'span',
	styles: {'font-size': '#(size)'},
	attributes: {'data-size': '#(size)', 'data-tag': 'size'}
  };
  config.colorButton_bgcolors = "9BE7D1,96F9B3,A1C4DF,C191D3,8A8A8A,FFF57D,8ECAB9,89DBA0,8EACCB,B57DCA,676767,F7CE75,F0B375,E78D7A,EFEFEF,D3D3D3,ECECEC,FFFFFF,EE8E56,E27A67,F5F5F5,B9B9B9,CACACA,2C2C2C";
  config.colorButton_colors = "1ABC9C,2ECC71,3498DB,9B59B6,4E5F70,F1C40F,16A085,27AE60,2980B9,8E44AD,2C3E50,F39C12,E67E22,E74C3C,ECF0F1,95A5A6,DDD,FFF,D35400,C0392B,BDC3C7,7F8C8D,999,000";
  config.linkDefaultProtocol = 'https://';
  config.enterMode = CKEDITOR.ENTER_BR;
  config.shiftEnterMode = CKEDITOR.ENTER_BR;
  config.fillEmptyBlocks = false;
  config.ignoreEmptyParagraph = true;
  config.basicEntities = false;
  config.extraAllowedContent = 'h4[*]{*}(*);span[*]{*}(*);div[*]{*}(*);p[*]{*}(*)';
  // TODO 这里大概得用绝对路径？
  config.emoji_emojiListUrl = 'https://arknightscommunity.drblack-system.com/wp-content/themes/LightSNS/module/stencil/smile.php';
  config.filebrowserImageUploadUrl = 'https://arknightscommunity.drblack-system.com/wp-content/themes/LightSNS/module/upload/bbs.php?from=ckeditor';
};

function resetUploadAction(editor) {
  editor.on('fileUploadRequest', function (evt) {
	// Prevented the default behavior.
	evt.stop();

	var fileLoader = evt.data.fileLoader,
	  $formData = new FormData(),
	  requestData = evt.data.requestData,
	  configXhrHeaders = editor.config.fileTools_requestHeaders,
	  header;

	if (requestData['upload']) {
	  requestData['file'] = requestData['upload'];
	  delete requestData['upload'];
	}
	for (var name in requestData) {
	  var value = requestData[name];

	  // Treating files in special way
	  if (typeof value === 'object' && value.file) {
		$formData.append(name, value.file, value.name);
	  } else {
		$formData.append(name, value);
	  }
	}
	// Append token preventing CSRF attacks.
	$formData.append('ckCsrfToken', CKEDITOR.tools.getCsrfToken());

	if (configXhrHeaders) {
	  for (header in configXhrHeaders) {
		fileLoader.xhr.setRequestHeader(header, configXhrHeaders[header]);
	  }
	}

	fileLoader.xhr.send($formData);
  });
  editor.on('fileUploadResponse', function (evt) {
	// Prevent the default response handler.
	evt.stop();

	// Get XHR and response.
	var data = evt.data,
	  xhr = data.fileLoader.xhr,
	  response = JSON.parse(xhr.responseText);

	if (response.code != 1) {
	  // An error occurred during upload.
	  data.message = response.msg;
	  evt.cancel();
	} else {
	  data.url = response.file_url;
	}
  });
}

CKEDITOR.on('instanceReady', function (e) {
  if (e.editor.contextMenu) {
	e.editor.removeMenuItem('paste');
  }
  resetUploadAction(e.editor);
});

// %LEAVE_UNMINIFIED% %REMOVE_LINE%
