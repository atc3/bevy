/**
 * permissions/board.js
 * @author albert
 * @flow
 */

'use strict';

var _ = require('underscore');
var checkBackdoor = require('./backdoor');
var Board = require('./../../models/Board');

// check if the user has access to this private? board
exports.hasPrivateBoardAccess = function(req, res, next) {
  if(checkBackdoor(req)) return next();
  var user = req.user;
  var board_id = req.params.boardid;
  if(_.isEmpty(board_id)) board_id = req.body['board'];
  if(_.isEmpty(board_id)) return next({
    code: 400,
    message: 'Board ID not supplied'
  });
  Board.findOne({ _id: board_id }, function(err, board) {
    if(err) return next(err);
    if(_.isEmpty(board)) return next({
      code: 404,
      message: 'Board not found'
    });
    checkPrivateBoardAccess(user, board, next);
  });
};

var checkPrivateBoardAccess = function(user, board, next) {
  // if its public, dont need to check for membership
  if(board.settings.privacy == 'Public') return next();
  else if (board.settings.privacy == 'Private' || board.settings.privacy == 'Secret') {
    // continue if user is a member of this private board
    if(_.contains(user.boards, board._id)) return next();
    else return next({
      code: 403,
      message: 'User does not have permission to view this board'
    });
  }
};
exports.checkPrivateBoardAccess = checkPrivateBoardAccess;

exports.isBoardMember = function(req, res, next) {
  if(checkBackdoor(req)) return next();
  var user = req.user;
  var board_id = req.params.boardid;
  // if the board id is in the user's collection of boards, then continue
  if(_.contains(user.boards, board_id)) return next();
  else return next('User is not a member of this board');
};

exports.isBoardAdmin = function(req, res, next) {
  if(checkBackdoor(req)) return next();
  var user = req.user;
  var board_id = req.params.boardid;
  Board.findOne({ _id: board_id}, function(err, board) {
    if(err) return next(err);
    // if the user is in the board's admins collection, then continue
    if(_.contains(board.admins, user._id)) return next();
    else return next('User is not an admin of this board');
  });
};
