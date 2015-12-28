/**
 * BevyStore.js
 *
 * Backbone and React and Flux confluence
 * for bevies
 *
 * @author albert
 * go home, bert
 */

'use strict';

// imports
var Backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');
var async = require('async');
var getSlug = require('speakingurl');

var router = require('./../router');

var Dispatcher = require('./../shared/dispatcher');

var Bevy = require('./BevyModel');
var Bevies = require('./BevyCollection');
var Boards = require('./../board/BoardCollection');

var constants = require('./../constants');
var BEVY = constants.BEVY;
var POST = constants.POST;
var CONTACT = constants.CONTACT;
var CHAT = constants.CHAT;
var APP = constants.APP;
var BOARD = constants.BOARD;
var BevyActions = require('./BevyActions');
var UserStore = require('./../profile/UserStore');
var user = window.bootstrap.user;

// inherit event class first
// VERY IMPORTANT, as the PostContainer view binds functions
// to this store's events
var BevyStore = _.extend({}, Backbone.Events);

// now add some custom functions
_.extend(BevyStore, {

  myBevies: new Bevies,
  active: {},
  publicBevies: new Bevies,
  searchQuery: '',
  searchList: new Bevies,
  activeTags: [],
  bevyBoards: new Boards,

  // handle calls from the dispatcher
  // these are created from BevyActions.js
  handleDispatch(payload) {
    switch(payload.actionType) {

      case BEVY.LOADMYBEVIES:
        var user = window.bootstrap.user;
        this.myBevies.url = constants.apiurl + '/users/' + user._id + '/bevies';

        this.myBevies.fetch({
          success: function(collection, response, options) {
            this.trigger(BEVY.LOADED);
            this.trigger(BEVY.CHANGE_ALL);
          }.bind(this)
        });
        break;

      case BEVY.LOADBEVYVIEW:
        Dispatcher.waitFor([ UserStore.dispatchToken ]);
        var bevy_id_or_slug = payload.bevy_id;
        var user = window.bootstrap.user;
        this.myBevies.url = constants.apiurl + '/users/' + user._id + '/bevies';

        this.myBevies.fetch({
          success: function(collection, response, options) {

              var active = this.myBevies.get(bevy_id_or_slug);
              this.active = active;
              this.bevyBoards.url = constants.apiurl + '/bevies/' + this.active.attributes._id + '/boards';

              this.bevyBoards.fetch({
                success: function(collection, response, options) {
                  this.trigger(BEVY.LOADED);
                  this.trigger(BEVY.CHANGE_ALL);
                }.bind(this)
              });

          }.bind(this)
        });

        break;
      case BOARD.LOADBOARDVIEW:
        Dispatcher.waitFor([ UserStore.dispatchToken ]);
        var user = window.bootstrap.user;
        this.myBevies.url = constants.apiurl + '/users/' + user._id + '/bevies';
        this.myBevies.fetch({
          success: function(collection, response, options) {
            this.trigger(BEVY.CHANGE_ALL);
          }.bind(this)
        });
        break;
      /*case APP.LOAD:
        Dispatcher.waitFor([ UserStore.dispatchToken ]);
        var user = window.bootstrap.user;
        this.myBevies.url = constants.apiurl + '/users/' + user._id + '/bevies';
        this.myBevies.fetch({
          success: function(collection, response, options) {
              this.trigger(BEVY.LOADED);
              this.trigger(BEVY.CHANGE_ALL);
          }.bind(this)
        });
        this.publicBevies.url = constants.apiurl + '/bevies';
        //load public bevies
        this.publicBevies.fetch({
          success: function(collection, response, options) {
            this.trigger(BEVY.CHANGE_ALL);
          }.bind(this)
        });

        break;*/

      case BEVY.CREATE:
        var name = payload.name;
        var image = payload.image;
        var slug = payload.slug;
        var user = window.bootstrap.user;

        if(_.isEmpty(image)) {
          image = {
            filename: constants.siteurl + '/img/default_group_img.png', 
            foreign: true
          };
        }

        // sanitize slug before we continue;
        if(_.isEmpty(slug)) {
          slug = getSlug(name);
        } else {
          // double check to make sure its url friendly
          slug = getSlug(slug);
        }

        var newBevy = this.myBevies.add({
          name: name,
          image: image,
          slug: slug,
          admins: [user._id],
          boards: [],
          settings: {
            privacy: 'Private'
          }
        });
        newBevy.url = constants.apiurl + '/bevies';

        newBevy.save(null, {
          success: function(model, response, options) {
            // success
            newBevy.set('_id', model.id);
            this.publicBevies.add(model);
            // switch to bevy
            this.active = model.id;
            var bevy_ids = this.myBevies.pluck('_id');
            bevy_ids.push(model.id);
            this.trigger(BEVY.CHANGE_ALL);

            // TODO: move this to user store
            $.ajax({
              method: 'PATCH',
              url: constants.apiurl + '/users/' + user._id,
              data: {
                bevies: bevy_ids
              },
              success: function($user) {
                window.location.href = constants.siteurl + model.get('url');
              }.bind(this)
            });
          }.bind(this)
        });
        break;

      case BEVY.DESTROY:
        var bevy_id = payload.bevy_id;
        var bevy = this.myBevies.get(bevy_id);
        bevy.destroy({
          success: function(model, response) {
            // switch to the frontpage
            router.navigate('/', { trigger: true });

            this.myBevies.remove(bevy_id);
            this.trigger(BEVY.CHANGE_ALL);
          }.bind(this)
        });

        break;

      case BEVY.UPDATE:
        var bevy_id = payload.bevy_id;

        var bevy = this.myBevies.get(bevy_id);

        var name = payload.name || bevy.get('name');
        var description = payload.description || bevy.get('description');
        var image = payload.image || bevy.get('image');
        var settings = payload.settings || bevy.get('settings');
        var tags = payload.tags || bevy.get('tags');
        var siblings = payload.siblings || bevy.get('siblings');

        bevy.set({
          name: name,
          description: description,
          image: image,
          tags: tags,
          siblings: siblings,
          settings: settings
        });

        bevy.save({
          name: name,
          description: description,
          image: image,
          tags: tags,
          siblings: siblings,
          settings: settings
        }, {
          patch: true
        });

        this.trigger(BEVY.UPDATED_IMAGE);
        this.trigger(POST.CHANGE_ALL);
        break;

      case BEVY.LEAVE:
        // remove bevy from mybevies collection
        var bevy_id = payload.bevy_id;

        var bevy = this.myBevies.get(bevy_id);
        if(bevy == undefined) break; // we havent joined yet

        this.myBevies.remove(bevy_id);
        this.trigger(BEVY.CHANGE_ALL);
        break;

      case BEVY.ADD_USER:
        var bevy_id = payload.bevy_id;
        var user_id = payload.user_id;
        var email = payload.email;

        $.ajax({
          method: 'PATCH',
          url: constants.apiurl + '/users/' + user_id + '/addbevy/' + bevy_id,
          success: function(res) {
            this.trigger(BEVY.CHANGE_ALL);
          }.bind(this)
        });

        break;

      case BEVY.JOIN:
        // add bevy to mybevies collection
        var bevy_id = payload.bevy_id;
        if(this.myBevies.get(bevy_id) != undefined) break; // already joined

        // fetch new bevy from server
        var new_bevy = new Bevy;
        new_bevy.url = constants.apiurl + '/bevies/' + bevy_id;
        new_bevy.fetch({
          success: function(model, response, options) {
            // add to collection
            this.myBevies.add(new_bevy);
            this.trigger(BEVY.CHANGE_ALL);
          }.bind(this)
        });

        break;

      case BEVY.REQUEST_JOIN:
        var bevy = payload.bevy;
        var user = payload.user;

        if(this.myBevies.get(bevy._id) != undefined) break; // already joined

        $.ajax({
          method: 'POST',
          url: constants.apiurl + '/notifications',
          data: {
            event: 'bevy:requestjoin',
            bevy_id: bevy._id,
            bevy_name: bevy.name,
            user_id: user._id,
            user_name: user.displayName,
            user_image: user.image_url,
            user_email: user.email
          },
          success: function(res) {
          }.bind(this)
        });

        break;

      /*case BEVY.SWITCH:
        var bevy_id = payload.bevy_id;

        var bevy = this.getBevy(bevy_id);

        console.log(bevy_id, bevy);

        this.active = bevy;

        this.trigger(BEVY.LOADED);
        this.trigger(BEVY.CHANGE_ALL);
        break;*/

      case BEVY.SORT:
        var filter = payload.filter;

        var collection = (!_.isEmpty(this.searchQuery)) ? this.searchList : this.publicBevies;
        collection.filter = filter;
        switch(filter) {
          case 'Most Subscribers':
            collection.comparator = this.sortByTop;
            break;
          case 'Least Subscribers':
            collection.comparator = this.sortByBottom;
            break;
          case 'Newest':
            collection.comparator = this.sortByNew;
            break;
          case 'Oldest':
            collection.comparator = this.sortByOld;
            break;
          case 'ABC':
            collection.comparator = this.sortByAbc;
            break;
          case 'ZYX':
            collection.comparator = this.sortByZyx;
            break;
        }
        //console.log(filter);
        collection.sort();

        this.trigger(BEVY.CHANGE_ALL);
        this.trigger(BEVY.SEARCH_COMPLETE);
        break;

      case BEVY.SEARCH:
        var query = payload.query;
        this.searchQuery = query;
        this.searchList.reset();
        this.trigger(BEVY.SEARCHING);
        this.searchList.url = constants.apiurl + '/bevies/search/' + query;
        this.searchList.fetch({
          reset: true,
          success: function(collection, response, options) {
            this.trigger(BEVY.SEARCH_COMPLETE);
            this.searchList.comparator = this.sortByTop;
          }.bind(this)
        });
        break;

      case BEVY.UPDATE_TAGS:
        var tags = payload.tags || [];
        this.activeTags = tags;
        this.trigger(BEVY.CHANGE_ALL);
        this.trigger(POST.CHANGE_ALL);
        break;

      case BOARD.CREATE:
        var name = payload.name;
        var description = payload.description;
        var image = payload.image;
        var user = window.bootstrap.user;
        var parent_id = payload.parent_id;

        if(_.isEmpty(image)) {
          image = {filename: constants.siteurl + '/img/default_board_img.png', foreign: true};
        }

        if(_.isEmpty(parent_id))
          break;

        var newBoard = this.bevyBoards.add({
          name: name,
          description: description,
          image: image,
          admins: [user._id],
          parent: parent_id
        });

        newBoard.url = constants.apiurl + '/boards';

        newBoard.save(null, {
          success: function(model, response, options) {
            // success
            newBoard.set('_id', model.id);
            var boards = this.active.get('boards');
            boards.push(model.id);
            this.active.url = constants.apiurl + '/bevies/' + this.active.get('_id');
            this.active.save({
              boards: boards
            }, {
              patch: true,
              success: function(model, response, options) {
                this.trigger(BOARD.CHANGE_ALL);
                this.trigger(BEVY.CHANGE_ALL);
              }.bind(this)
            });
            BoardActions.join(model.id);
          }.bind(this)
        });

        break;
    }
  },

  getMyBevies() {
    return this.myBevies.toJSON();
  },

  getPublicBevies() {
    return (this.publicBevies.models.length <= 0)
    ? []
    : this.publicBevies.toJSON();
  },

  getActive() {
    return (!_.isEmpty(this.active)) ? this.active.toJSON() : {};
  },

  getBevy(bevy_id) {
    var bevy = this.myBevies.get(bevy_id) || this.publicBevies.get(bevy_id);
    return (bevy)
    ? bevy.toJSON()
    : {};
  },

  getBevyBoards() {
    return this.bevyBoards.toJSON() || [];
  },

  getSearchList() {
    return (this.searchList.models.length <= 0)
    ? []
    : this.searchList.toJSON();
  },

  getSearchQuery() {
    return this.searchQuery;
  },

  /*
  getActiveTags() {
    return this.activeTags;
  },*/

  sortByAbc(bevy) {
    var name = bevy.attributes.name.toLowerCase();
    var nameValue = name.charCodeAt(0);
    return nameValue;
  },

  sortByZyx(bevy) {
    var name = bevy.attributes.name.toLowerCase();
    var nameValue = name.charCodeAt(0);
    return -nameValue;
  },

  sortByTop(bevy) {
    var subs = bevy.attributes.subCount;
    return -subs;
  },
  sortByBottom(bevy) {
    var subs = bevy.attributes.subCount;
    return subs;
  },
  sortByNew(bevy) {
    var date = Date.parse(bevy.get('created'));
    return -date;
  },
  sortByOld(bevy) {
    var date = Date.parse(bevy.get('created'));
    return date;
  }
  
});

var dispatchToken = Dispatcher.register(BevyStore.handleDispatch.bind(BevyStore));
BevyStore.dispatchToken = dispatchToken;

module.exports = BevyStore;
