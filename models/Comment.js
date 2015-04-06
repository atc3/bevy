/**
 * Comment.js
 *
 * Comment mongoose model
 *
 * @author albert
 */

'use strict';

// imports
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
	author: {
		type: Schema.Types.ObjectId,
		ref: 'Alias'
	},
	title: String,
	body: String,
	link: String,
	imageURL: String,
	settings: {
		visibility: String
	},
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date,
		default: Date.now
	}
});
