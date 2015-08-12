/**
 * CreateNewEvent.jsx
 *
 * i cant believe im rewriting this rn.
 * @author kevin
 */

'use strict';

var React = require('react');
var _ = require('underscore');
var $ = require('jquery');
var constants = require('./../../constants');

var rbs = require('react-bootstrap');
var Panel = rbs.Panel;
var Input = rbs.Input;
var Button = rbs.Button;
var Modal = rbs.Modal;

var DateTimeField = require('react-bootstrap-datetimepicker');

var mui = require('material-ui');
var FlatButton = mui.FlatButton;
var RaisedButton = mui.RaisedButton;
var TextField = mui.TextField;
var DatePicker = mui.DatePicker;

var Uploader = require('./../../shared/components/Uploader.jsx');

var PostActions = require('./../PostActions');

var user = window.bootstrap.user;

var CreateNewEvent = React.createClass({

	propTypes: {
		activeBevy: React.PropTypes.object.isRequired,
		myBevies: React.PropTypes.array.isRequired,
		disabled: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			title: '',
			image: '/img/default_event_img.png',
			bevies: [],
			selectedIndex: 0,
			date: '',
			location: '',
			description: '',
			attendees: '',
			error: ''
		};
	},

	onUploadComplete: function(file) {
		var filename = file.filename;
		var image = constants.apiurl + '/files/' + filename
		this.setState({
			image: image,
		});
	},

	submit: function(ev) {
		ev.preventDefault();

		if(!(this.state.date && this.state.location && this.state.title)) {
			this.setState({
				error: 'please complete all required fields'
			});
			return;
		}
		
		event = {
				date: this.state.date,
				location: this.state.location,
				description: this.state.description,
				attendees: null
			};

		console.log(event);

		// send the create action
		PostActions.create(
			this.state.title, // title
			[this.state.image], // image_url
			window.bootstrap.user, // author
			this.props.activeBevy, // bevy
			'event', //type
			event // event
		);

		// reset fields
		this.setState(this.getInitialState());
		this.props.onRequestHide(); 
	},

	handleChange: function() {
		this.setState({
			title: this.refs.title.getValue(),
			description: this.refs.description.getValue(),
			location: this.refs.location.getValue()
		});
	},

	handleDate: function(x) {
		this.setState({
			date: x     
		});
	},

	render: function() {

		var dropzoneOptions = {
			maxFiles: 1,
			acceptedFiles: 'image/*',
			clickable: '.dropzone-panel-button',
			dictDefaultMessage: ' ',
		};
		var eventImageStyle = {
			backgroundImage: 'url(' + this.state.image + ')',
			backgroundSize: '100% auto'

		};
		var error = this.state.error;
		console.log(error);
		var errorStyle = (error = '') ? {display: 'none'} : {marginTop: '10px', color: 'red'};

		return <Modal className="create-bevy create-event" {...this.props} title='Create a new Event'>

					<div className="bevy-info">
						<div className="new-bevy-picture">
							<Uploader
								onUploadComplete={ this.onUploadComplete }
								className="bevy-image-dropzone"
								style={ eventImageStyle }
								dropzoneOptions={ dropzoneOptions }
							/>
						</div>
						<div className='error' style={errorStyle}>{error}</div>
						<div className='text-fields'>
							<TextField
								className="title-field"
								hintText='event title'
								ref='title'
								value={ this.state.title }
								onChange={ this.handleChange }
							/>
							<TextField
								className="title-field"
								hintText='event description'
								ref='description'
								multiLine={ true }
								value={ this.state.description }
								onChange={ this.handleChange }
							/>
							<TextField
								className="title-field"
								hintText='location'
								ref='location'
								value={ this.state.location }
								onChange={ this.handleChange }
							/>
							<DateTimeField
								className='date-picker'
								ref='date'
								defaultText='set a date'
							/>
						</div>
					</div>
					<div className="panel-bottom">
						<div className='right'>
							<RaisedButton
								onClick={ this.submit }
								label="Create"
							/>
							<FlatButton
								onClick={ this.props.onRequestHide }
								label="Cancel"
							/>
						</div>
					</div>
				 </Modal>
	}
});

module.exports = CreateNewEvent;
