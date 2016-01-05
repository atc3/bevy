/**
 * ThreadItem.jsx
 * @author albert
 */

'use strict';

var React = require('react');
var Ink = require('react-ink');
var {
  Button,
  OverlayTrigger,
  Tooltip
} = require('react-bootstrap');
var ThreadImage = require('./ThreadImage.jsx');

var _ = require('underscore');
var constants = require('./../../constants');
var ChatActions = require('./../ChatActions');
var ChatStore = require('./../ChatStore');
var user = window.bootstrap.user;

var ThreadItem = React.createClass({
  propTypes: {
    thread: React.PropTypes.object.isRequired,
    width: React.PropTypes.any,
    onClick: React.PropTypes.func,
    sidebarOpen: React.PropTypes.bool,
    showTooltip: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      width: '100%',
      onClick: _.noop,
      showTooltip: false
    }
  },

  openThread(ev) {
    ev.preventDefault();
    ChatActions.openThread(this.props.thread._id);
    this.props.onClick(ev);
  },

  getLatestMessage() {
    var latestMessage = this.props.thread.latest;
    if(!_.isEmpty(latestMessage)) {
      var messageAuthor = latestMessage.author.displayName;
      if(latestMessage.author._id == user._id) messageAuthor = 'Me';
    } else return '';
    return messageAuthor + ': ' + latestMessage.body;
  },

  render() {
    if(_.isEmpty(this.props.thread))
      return <div/>;

    var thread = this.props.thread;

    //var board = this.props.thread.board;
    var name = ChatStore.getThreadName(thread._id);

    var hideTooltip = (this.props.sidebarOpen) ? {display: 'none'} : {};
    var tooltip = (this.props.showTooltip) ? (
      <Tooltip id='threadtooltip' style={hideTooltip}>{name}</Tooltip>
    ) : <div />;

    // monkey patch to hide threads that have just been removed from the collection
    if(_.isEmpty(name)) {
      return <div />;
    }

    return (
      <OverlayTrigger placement='left' overlay={tooltip}>
        <a
          className='conversation-item'
          style={{ width: this.props.width }}
          href='#'
          onClick={ this.openThread }
          title={ name }
        >
          <ThreadImage thread={ thread } />
          <div className='details'>
            <span className='name'>{ name }</span>
            <span className='latest-message'>{ this.getLatestMessage() }</span>
          </div>
          <Ink style={{ color: '#aaa', height: 50, top: 0 }}/>
        </a>
      </OverlayTrigger>
    );
  }
});

module.exports = ThreadItem;
