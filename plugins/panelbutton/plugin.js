/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.plugins.add( 'panelbutton', {
	requires: 'button',
	onLoad: function() {
		function clickFn( editor ) {
			var _ = this._;

			if ( _.state == CKEDITOR.TRISTATE_DISABLED )
				return;

			var promise = this.createPanel( editor );
			if (!promise) {
			  promise = Promise.resolve();
			}

			promise.then(function() {
			  if (_.on) {
				_.panel.hide();
				return;
			  }

			  _.panel.showBlock(_.id, this.document.getById(_.id), 4);
			});
		}

		/**
		 * @class
		 * @extends CKEDITOR.ui.button
		 * @todo class and methods
		 */
		CKEDITOR.ui.panelButton = CKEDITOR.tools.createClass( {
			base: CKEDITOR.ui.button,

			/**
			 * Creates a panelButton class instance.
			 *
			 * @constructor
			 */
			$: function( definition ) {
				// We don't want the panel definition in this object.
				var panelDefinition = definition.panel || {};

				delete definition.panel;

				this.base( definition );

				this.document = ( panelDefinition.parent && panelDefinition.parent.getDocument() ) || CKEDITOR.document;

				panelDefinition.block = {
					attributes: panelDefinition.attributes
				};
				panelDefinition.toolbarRelated = true;

				this.hasArrow = 'listbox';

				this.click = clickFn;

				this._ = {
					panelDefinition: panelDefinition
				};
			},

			statics: {
				handler: {
					create: function( definition ) {
						return new CKEDITOR.ui.panelButton( definition );
					}
				}
			},

			proto: {
				createPanel: function( editor ) {
					var _ = this._;

					if ( _.panel ) {
						return;
					}

					var panelDefinition = this._.panelDefinition,
						panelBlockDefinition = this._.panelDefinition.block,
						panelParentElement = panelDefinition.parent || CKEDITOR.document.getBody(),
						panel = this._.panel = new CKEDITOR.ui.floatPanel( editor, panelParentElement, panelDefinition );
					var serviceWorkerPromise = new Promise(function (reslove) {
					  var sw = panel.element.$.firstChild.contentWindow.navigator.serviceWorker;
					  if (sw) {
						sw.ready.then(function () {
						  reslove();
						});
						setTimeout(function () {
						  reslove();
						}, 200);
					  } else {
						reslove();
					  }
					});
					var blockPromise = serviceWorkerPromise.then(function () {
					  return panel.addBlock(_.id, panelBlockDefinition);
					});
				    var me = this,
						command = editor.getCommand( this.command );

					panel.onShow = function() {
						if ( me.className ) {
							this.element.addClass( me.className + '_panel' );
						}

						me.setState( CKEDITOR.TRISTATE_ON );

						_.on = 1;

						me.editorFocus && editor.focus();

						if ( me.onOpen ) {
							me.onOpen();
						}
					};

					panel.onHide = function( preventOnClose ) {
						if ( me.className ) {
							this.element.getFirst().removeClass( me.className + '_panel' );
						}

						// Defined `modes` has priority over the command for a backward compatibility (#3727).
						if ( !me.modes && command ) {
							me.setStateFromCommand( command );
						} else {
							me.setState( me.modes && me.modes[ editor.mode ] ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED );
						}

						_.on = 0;

						if ( !preventOnClose && me.onClose ) {
							me.onClose();
						}
					};

					panel.onEscape = function() {
						panel.hide( 1 );
						me.document.getById( _.id ).focus();
					};

					return blockPromise.then(function(block) {
					  if (this.onBlock) {
						this.onBlock(panel, block);
					  }

					  block.onHide = function () {
						_.on = 0;

						// Defined `modes` has priority over the command for a backward compatibility (#3727).
						if (!me.modes && me.command) {
						  me.setStateFromCommand(command);
						} else {
						  me.setState(CKEDITOR.TRISTATE_OFF);
						}
					  };
					});
				},

				setStateFromCommand: function( command ) {
					this.setState( command.state );
				}
			}
		} );

	},
	beforeInit: function( editor ) {
		editor.ui.addHandler( CKEDITOR.UI_PANELBUTTON, CKEDITOR.ui.panelButton.handler );
	}
} );

/**
 * Button UI element.
 *
 * @readonly
 * @property {String} [='panelbutton']
 * @member CKEDITOR
 */
CKEDITOR.UI_PANELBUTTON = 'panelbutton';
