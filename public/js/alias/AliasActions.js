/**
 * AliasActions.js
 *
 * Action dispatcher for aliases
 *
 * @author albert
 */

'use strict';

// imports
var dispatch = require('./../shared/helpers/dispatch');

var ALIAS = require('./../constants').ALIAS;

var AliasActions = {

	switch: function(alias_id) {
		dispatch(ALIAS.SWITCH, {
			id: (alias_id == undefined) ? '' : alias_id
		});
	},

	create: function(name) {
		dispatch(ALIAS.CREATE, {
			name: (name == undefined) ? '' : name
		});
	},

	destroy: function(id) {
		dispatch(ALIAS.DESTROY, {
			id: (id == undefined) ? '0' : id
		});
	},

	update: function(alias_id, name) {
		dispatch(ALIAS.UPDATE, {
			alias_id: (alias_id == undefined) ? '' : alias_id,
			name: (name == undefined) ? 'noname' : name
		});
	}
};
module.exports = AliasActions;
