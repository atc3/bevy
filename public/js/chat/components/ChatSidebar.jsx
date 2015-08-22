/**
 * ChatDropdown.jsx
 *
 * @author KEVIN
 */

'use strict';

var React = require('react');
var _ = require('underscore');
var $ = require('jquery');

var {
  Button,
  Accordion,
  PanelGroup,
  Panel
} = require('react-bootstrap');
var {
  TextField
} = require('material-ui');

var ThreadItem = require('./ThreadItem.jsx');
var UserSearchItem = require('./UserSearchItem.jsx');

var ChatActions = require('./../ChatActions');
var ChatStore = require('./../ChatStore');
var UserActions = require('./../../profile/UserActions');
var UserStore = require('./../../profile/UserStore');

var mui = require('material-ui');
var TextField = mui.TextField;
var ThemeManager = new mui.Styles.ThemeManager();

var constants = require('./../../constants');
var USER = constants.USER;
var CHAT = constants.CHAT;

var user = window.bootstrap.user;
var email = user.email;

var ChatSidebar = React.createClass({

  propTypes: {
    allContacts: React.PropTypes.array,
    allThreads: React.PropTypes.array,
    activeThread: React.PropTypes.object,
    userSearchResults: React.PropTypes.array,
    userSearchQuery: React.PropTypes.string
  },

  getChildContext() { 
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    }
  },

  componentWillMount() {
    ThemeManager.setComponentThemes({
        textField: {
          textColor: 'rgba(0,0,0,.87)',
          focusColor: 'rgba(0,0,0,.4)'
        }
      });
  },

  getInitialState() {
    return {
      allThreads: [],

      sidebarWidth: constants.chatSidebarWidthClosed,
      searchHeight: 0,
      isOverlayOpen: false,
      searching: false,
      query: '',
      searchUsers: []
    };
  },

  componentDidMount() {
    ChatStore.on(CHAT.CHANGE_ALL, this.handleChangeAll);
    UserStore.on(USER.SEARCH_COMPLETE, this.handleSearchResults);
    UserStore.on(USER.SEARCHING, this.handleSearching);
  },

  componentWillUnmount() {
    ChatStore.off(CHAT.CHANGE_ALL, this.handleChangeAll);
    UserStore.off(USER.SEARCH_COMPLETE, this.handleSearchResults);
    UserStore.off(USER.SEARCHING, this.handleSearching);
  },

  handleChangeAll() {
    this.setState({
      allThreads: ChatStore.getAllThreads()
    });
  },

  handleSearching() {
    this.setState({
      searching: true,
      searchUsers: []
    });
  },

  handleSearchResults() {
    this.setState({
      searching: false,
      query: UserStore.getUserSearchQuery(),
      searchUsers: UserStore.getUserSearchResults()
    });
  },

  handleToggle(ev) {
    ev.preventDefault();
    this.setState({
      isOverlayOpen: !this.state.isOverlayOpen
    });
  },

  openSearchResults() {
    this.setState({
      searchHeight: constants.chatSidebarSearchHeight
    });
  },

  closeSearchResults() {
    // clear search query and results
    // and reset height
    this.setState({
      searchHeight: 0,
      query: '',
      searchUsers: []
    });
    // blur text field
    this.refs.userSearch.blur();
  },

  onChange(ev) {
    ev.preventDefault();
    var query = this.refs.userSearch.getValue();
    this.setState({
      query: query
    });
    if(_.isEmpty(query)) return;
    else UserActions.search(query);
  },

  _renderThreads() {
    var allThreads = _.map(this.state.allThreads, ($thread) => $thread); // create deep copy
    allThreads = _.reject(allThreads, ($thread) => $thread._id == -1); // dont render the new message panel/thread

    // collect and render all thread items - sorted by type
    var bevyThreads = _.where(allThreads, { type: 'bevy' });
    var bevyThreadItems = [];
    for(var key in bevyThreads) {
      var thread = bevyThreads[key];
      bevyThreadItems.push(
        <ThreadItem
          key={ 'sidebar:bevythread:' + thread._id }
          width={ constants.chatSidebarWidthOpen }
          thread={ thread }
        />
      );
    };
    var groupThreads = _.where(allThreads, { type: 'group' });
    var groupThreadItems = [];
    for(var key in groupThreads) {
      var thread = groupThreads[key];
      groupThreadItems.push(
        <ThreadItem
          key={ 'sidebar:groupthread:' + thread._id }
          width={ constants.chatSidebarWidthOpen }
          thread={ thread }
        />
      );
    };
    var pmThreads = _.where(allThreads, { type: 'pm' });
    var pmThreadItems = [];
    for(var key in pmThreads) {
      var thread = pmThreads[key];
      pmThreadItems.push(
        <ThreadItem
          key={ 'sidebar:pmthread:' + thread._id }
          width={ constants.chatSidebarWidthOpen }
          thread={ thread }
        />
      );
    };
    return (
      <div>
        <Panel header={ 'bevy threads' } eventKey='1' defaultExpanded={ true } collapsible>
          { bevyThreadItems }
        </Panel>
        <Panel header={ 'group threads' } eventKey='2' defaultExpanded={ true } collapsible>
          { groupThreadItems }
        </Panel>
        <Panel header={ 'pm threads' } eventKey='3' defaultExpanded={ true } collapsible>
          { pmThreadItems }
        </Panel>
      </div>
    );
  },

  render() {
    var searchResults = [];
    var userSearchResults = this.state.searchUsers;
    for(var key in userSearchResults) {

      var user = userSearchResults[key];
      
      searchResults.push(
        <UserSearchItem
          key={ 'chatusersearch:' + user._id }
          searchUser={ user }
        />
      );
    }

    if(_.isEmpty(searchResults) && !_.isEmpty(this.state.query)) {
      searchResults = (
        <div>
          <h3>
            no results :(
          </h3>
        </div>
      );
    }

    if(this.state.searching) {
      searchResults = <section className="loaders"><span className="loader loader-quart"> </span></section>
    }

    return (
      <div 
        className='chat-sidebar' 
        style={{ 
          width: 200,
          right: this.state.sidebarWidth - constants.chatSidebarWidthOpen
        }}
        onMouseOver={() => { 
          this.setState({ sidebarWidth: constants.chatSidebarWidthOpen }); 
        }}
        onMouseOut={() => { 
          //this.closeSearchResults();
          this.setState({ sidebarWidth: constants.chatSidebarWidthClosed }); 
        }}
      >
        <div className='conversation-list'>
          <div className='title'>
          </div>
          { this._renderThreads() }
        </div>
        <div 
          className='search-results'
          style={{ 
            width: constants.chatSidebarWidthOpen,
            height: this.state.searchHeight
          }}
        >
          <div className='content' >
            <div className='results-list'>
              <span className='results-list-header'>Users</span>
              { searchResults }
            </div>
          </div>
          <div className='topline-wrapper'>
            <div className='topline'/>
          </div>
        </div>
        <div className='chat-actions'>
          <span className='glyphicon glyphicon-search' />
          <TextField 
            onFocus={ this.openSearchResults } 
            onBlur={this.closeSearchResults}
            type='text'
            className='search-input'
            ref='userSearch'
            value={ this.state.query }
            onChange={ this.onChange }
            hintText='Search Users'
          />
        </div>
      </div>
    );
  }
});

ChatSidebar.childContextTypes = {
  muiTheme: React.PropTypes.object
};

module.exports = ChatSidebar;
