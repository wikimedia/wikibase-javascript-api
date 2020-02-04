( function ( wb, util ) {
	'use strict';

	var MODULE = wb.api;
	var PARENT = Error;

	/**
	 * Wikibase Repo API Error.
	 * @class wikibase.api.RepoApiError
	 * @extends Error
	 * @since 1.0
	 * @license GPL-2.0+
	 * @author H. Snater < mediawiki@snater.com >
	 *
	 * @constructor
	 *
	 * @param {string} code Error code (used to determine the actual error message).
	 * @param {string} detailedMessage HTML
	 * @param {string[]} [parameters]
	 * @param {string} [action] Generic API action (e.g. "save" or "cancel") used to determine a
	 *        specific message.
	 */
	var SELF = MODULE.RepoApiError
		= util.inherit( 'WbRepoApiError', PARENT, function (
			code,
			detailedMessage,
			parameters,
			action
		) {
			this.code = code;
			this.detailedMessage = detailedMessage;
			this.action = action;

			// native Error attributes
			this.name = 'Wikibase Repo API Error';
			this.message = this.getMessage( parameters );
		},
		{
			/**
			 * Message keys of API related error messages.
			 * @property {Object}
			 * @private
			 * @readonly
			 */
			API_ERROR_MESSAGE: {
				GENERIC: {
					DEFAULT: 'wikibase-error-unexpected',
					save: 'wikibase-error-save-generic',
					remove: 'wikibase-error-remove-generic'
				},
				timeout: {
					save: 'wikibase-error-save-timeout',
					remove: 'wikibase-error-remove-timeout'
				},
				'no-external-page': 'wikibase-error-ui-no-external-page',
				'edit-conflict': 'wikibase-error-ui-edit-conflict'
			},

			/**
			 * Returns a short message string.
			 *
			 * @param {string[]} [parameters]
			 * @return {string}
			 */
			getMessage: function ( parameters ) {
				var msgKey = this.API_ERROR_MESSAGE[ this.code ];

				if ( !msgKey || typeof msgKey !== 'string' ) {
					if ( msgKey && this.action && msgKey[ this.action ] ) {
						msgKey = msgKey[ this.action ];
					} else if ( this.action && this.API_ERROR_MESSAGE.GENERIC[ this.action ] ) {
						msgKey = this.API_ERROR_MESSAGE.GENERIC[ this.action ];
					} else {
						msgKey = this.API_ERROR_MESSAGE.GENERIC.DEFAULT;
					}
				}

				return mw.msg.apply( mw.msg, [ msgKey ].concat( parameters || [] ) );
			}

		} );

	/**
	 * Creates a new RepoApiError out of the values returned from the API.
	 * @static
	 *
	 * @param {Object} details Object returned from the API containing detailed information.
	 * @param {string} [apiAction] API action (e.g. 'save', 'remove') that may be passed to
	 *        determine a specific message.
	 * @return {wikibase.api.RepoApiError}
	 */
	SELF.newFromApiResponse = function ( details, apiAction ) {
		var errorCode = '',
			parameters = [],
			detailedMessage = '';

		if ( details.error ) {
			errorCode = details.error.code;
			if ( details.error.messages ) {
				// HTML message in a format only Wikibase supports, see ApiErrorReporter. The data
				// structure supports multiple messages, but this is not relevant in the cases
				// API_ERROR_MESSAGE supports. Assume the first message parameters are compatible.
				parameters = details.error.messages[ 0 ] && details.error.messages[ 0 ].parameters;
				detailedMessage = messagesObjectToHtml( details.error.messages );
			} else if ( details.error.info ) {
				// Wikibase API no-HTML error message fall-back.
				detailedMessage = mw.html.escape( String( details.error.info ) );
			}
		} else if ( details.errors ) {
			errorCode = details.errors[ 0 ].code;
			detailedMessage = mw.html.escape( String( details.errors[ 0 ][ '*' ] ) );
		} else if ( details.exception ) {
		// Failed MediaWiki API call.
			errorCode = details.textStatus;
			detailedMessage = mw.html.escape( String( details.exception ) );
		}

		return new SELF( errorCode, detailedMessage, parameters, apiAction );
	};

	/**
	 * @ignore
	 *
	 * @param {Object} messages Object returned from the API.
	 * @return {string|undefined} HTML list, single message or undefined if no HTML could be found.
	 */
	function messagesObjectToHtml( messages ) {
		// Can't use length, it's not an array!
		if ( messages[ 1 ] && messages[ 1 ].html ) {
			var html = '<ul>';
			for ( var i = 0; messages[ i ]; i++ ) {
				html += '<li>' + messages[ i ].html[ '*' ] + '</li>';
			}
			return html + '</ul>';
		}

		return messages[ 0 ] && messages[ 0 ].html && messages[ 0 ].html[ '*' ]
			|| messages.html && messages.html[ '*' ];
	}

}( wikibase, util ) );
