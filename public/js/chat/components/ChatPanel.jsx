'use strict';

var React = require('react');

var rbs = require('react-bootstrap');
var Button = rbs.Button;
var Input = rbs.Input;

var ChatActions = require('./../ChatActions')

var ChatPanel = React.createClass({

	propTypes: {
		thread: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			isOpen: false,
			body: ''
		};
	},

	onChange: function(ev) {
		var body = this.refs.body.getValue();
		this.setState({
			body: body
		});
	},

	onKeyPress: function(ev) {
		if(ev.which == 13) {
			// create message
			var thread = this.props.thread;
			var author = window.bootstrap.user;
			var body = this.refs.body.getValue();
			ChatActions.createMessage(thread._id, author, body);
			this.setState({
				body: ''
			});
		}
	},

	handleToggle: function(ev) {
		ev.preventDefault();
		this.setState({
			isOpen: !this.state.isOpen
		});
	},

	closePanel: function(ev) {
		ev.preventDefault();
		ChatActions.closePanel(this.props.thread._id);
	},

	render: function() {

		var thread = this.props.thread;
		var bevy = thread.bevy;

		var header = (
			<div className='row chat-panel-header'>
				<div className='col-xs-8'>
					<a href="#" onClick={ this.handleToggle }>{ bevy.name }</a>
				</div>
				<div className='col-xs-2'>
					<span className="glyphicon glyphicon-minus btn" onClick={ this.handleToggle }></span>
				</div>
				<div className='col-xs-2'>
					<span className="glyphicon glyphicon-remove btn" onClick={ this.closePanel }></span>
				</div>
			</div>
		);

		var input = (
			<div className='row chat-panel-input'>
				<div className='col-xs-10'>
					<Input
						type='text'
						ref='body'
						placeholder='Chat'
						onKeyPress={ this.onKeyPress }
						onChange={ this.onChange }
						value={ this.state.body }
					/>
				</div>
				<div className='col-xs-2'>

				</div>
			</div>
		);
		if(!this.state.isOpen) input = <div />;

		var body = (
			<div className='row chat-panel-body'>
				the chat body
				{ input }
			</div>
		);
		if(!this.state.isOpen) body = <div />;

		return (
			<div className='chat-panel col-xs-3'>
				{ header }
				{ body }
			</div>
		);
	}
});

module.exports = ChatPanel;