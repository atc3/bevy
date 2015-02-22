/**
 * aliases.js
 *
 * Alias database API
 *
 * @author albert
 */

'use strict'

var _ = require('underscore');
var error = require('./../error');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Alias = mongoose.model('Alias');

function collectAliasParams(req) {
	var update = {};
	// dynamically load schema values from request object
	Alias.schema.eachPath(function(pathname, schema_type) {
		// collect path value
		var val = null;
		if(req.body != undefined) val = req.body[pathname];
		if(!val && !_.isEmpty(req.query)) val = req.query[pathname];
		if(!val) return;
		update[pathname] = val;
	});
	return update;
}

// INDEX
// GET /aliases/
exports.index = function(req, res, next) {
	Alias.find()
		.exec(function(err, aliases) {
		if(err) throw err;
		return aliases;
	}).then(function(aliases) {
		res.json({
			  status: 'INDEX ALIASES'
			, object: 'alias array'
			, aliases: aliases
		});
	}, function(err) { next(err); });
}

// CREATE
// GET /aliases/create
// POST /aliases
exports.create = function(req, res, next) {

}

// SHOW
exports.show = function(req, res, next) {

}

// UPDATE
exports.update = function(req, res, next) {

}

// DESTROY
exports.destroy = function(req, res, next) {

}
