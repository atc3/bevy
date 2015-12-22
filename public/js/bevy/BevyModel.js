/**
 * BevyModel.js
 *
 * Backbone model for Bevies
 *
 * @author albert
 */

'use strict';

// imports
var Backbone = require('backbone');

var constants = require('./../constants');

// backbone model
var BevyModel = Backbone.Model.extend({
  defaults: {
    name: null,
    description: null,
    image: null,
    admins: [],
    settings: {},
    created: 0,
    updated: 0,
    subCount: 0,
    boards: []
  },
  idAttribute: '_id'
});

module.exports = BevyModel;
