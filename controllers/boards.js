/**
 * boards.js
 * @author albert
 * @flow
 */

'use strict';

var mongoose = require('mongoose');
var _ = require('underscore');
var shortid = require('shortid');
var async = require('async');

var Board = require('./../models/Board');
var Bevy = require('./../models/Bevy');
var User = require('./../models/User');
var Thread = require('./../models/Thread');
var Post = require('./../models/Post');

// GET /users/:id/boards
exports.getUserBoards = function(req, res, next) {
  var user_id = req.params.id;

  User.findOne({ _id: user_id }, function(err, user) {
    if(err) return next(err);
    if(_.isEmpty(user)) return next('User not found');
    Board.find({ _id: { $in: user.boards }}, function(err, boards) {
      if(err) return next(err);
      return res.json(boards);
    })
    .populate({
      path: 'parents',
      select: '_id name slug image'
    });
  });
};

// GET /bevies/:id/boards
exports.getBevyBoards = function(req, res, next) {
  var bevy_id = req.params.id;

  Board.find({ parents: bevy_id }, function(err, boards) {
    if(err) return next(err);
    return res.json(boards);
  });
  /*.populate({
    path: 'parents',
    select: '_id name slug image'
  });*/
};

// POST /boards
exports.createBoard = function(req, res, next) {
  var update = {};
  update._id = shortid.generate();
  if(req.body['name'] != undefined)
    update.name = req.body['name'];
  if(req.body['description'] != undefined)
    update.description = req.body['description'];
  if(req.body['parents'] != undefined)
    update.parents = req.body['parents'];
  if(req.body['slug'] != undefined)
    update.slug = req.body['slug'];
  if(req.body['image'] != undefined)
    update.image = req.body['image'];
  if(req.body['admins'] != undefined)
    update.admins = req.body['admins'];
  if(req.body['settings'] != undefined)
    update.settings = req.body['settings'];

  Board.create(update, function(err, board) {
    if(err) return next(err);
    return res.json(board);
  });
};

// GET /boards/:id
exports.getBoard = function(req, res, next) {
  var board_id = req.params.id;
  Board.findOne({ _id: board_id }, function(err, board) {
    if(err) return next(err);
    if(_.isEmpty(board)) return next('Board not found');
    return res.json(board);
  })
  .populate({
    path: 'parents',
    select: '_id name slug image'
  });
};

// PUT /boards/:id
// PATCH /boards/:id
exports.updateBoard = function(req, res, next) {
  var board_id = req.params.id;
  var update = {};
  if(req.body['name'] != undefined)
    update.name = req.body['name'];
  if(req.body['description'] != undefined)
    update.description = req.body['description'];
  if(req.body['parents'] != undefined)
    update.parents = req.body['parents'];
  if(req.body['slug'] != undefined)
    update.slug = req.body['slug'];
  if(req.body['image'] != undefined)
    update.image = req.body['image'];
  if(req.body['admins'] != undefined)
    update.admins = req.body['admins'];
  if(req.body['settings'] != undefined)
    update.settings = req.body['settings'];
  if(!_.isEmpty(update)) {
    update.updated = Date.now();
  }

  var promise = Board.findOneAndUpdate({ _id: board_id }, update, { new: true })
    /*.populate({
      path: 'parents',
      select: '_id name slug image'
    })*/
    .exec();
  promise.then(function(board) {
    if(_.isEmpty(board)) return next('Board not found');
    return res.json(board);
  }, function(err) {
    return next(err);
  });
};

// DELETE /boards/:id
exports.destroyBoard = function(req, res, next) {
  var board_id = req.params.id;
  Bevy.findOneAndRemove({ _id: board_id }, function(err, board) {
    if(err) return next(err);
    // TODO delete all threads associated with this board
    // delete all posts associated with this board
    Post.remove({ board: board_id }, function(err, posts) {
      if(err) return next(err);
    });
    // remove refs to this board from all users
    User.find({ boards: board_id }, function(err, users) {
      if(err) return next(err);
      async.each(users, function(user, callback) {
        user.boards.pull(board_id);
        user.save(function(err) {
          if(err) next(err);
        });
        callback();
      },
      function(err) {
        if(err) return next(err);
      });
    });

    return res.json(board);
  });
};