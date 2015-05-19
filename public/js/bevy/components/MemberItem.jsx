/**
 * MemberItem.jsx
 *
 * @author KEVIN
 * @author albert
 */

var React = require('react');
var _ = require('underscore');
var $ = require('jquery');

var rbs = require('react-bootstrap');
var ButtonGroup = rbs.ButtonGroup;
var Button = rbs.Button;
var Panel = rbs.Panel;

var BevyActions = require('./../BevyActions');

var MemberItem = React.createClass({

	propTypes: {
		contact: React.PropTypes.object,
		activeBevy: React.PropTypes.object,
		activeMember: React.PropTypes.object,
		active: React.PropTypes.bool
	},

	remove: function(ev) {
		ev.preventDefault();

		var bevy_id = this.props.activeBevy.id;
		var user_id = (_.isObject(this.props.contact.userid)) ? this.props.contact.userid._id : null;

		BevyActions.removeUser(bevy_id, this.props.contact.email, user_id);
	},

	render: function() {

		var defaultContactImage = '//ssl.gstatic.com/accounts/ui/avatar_2x.png';

		var contactButtonStyle = {
			backgroundImage: 'url(' + defaultContactImage + ')'
		};

		var contactName = this.props.contact.email || "Placeholder Contact";
		var joined = (_.isEmpty(this.props.contact.userid)) ? false : true;

		var contactStatus = '';
		if(!joined) contactStatus = '[invited]';
		else contactStatus = (this.props.contact.userid.google)
		? this.props.contact.userid.google.name.givenName + ' ' + this.props.contact.userid.google.name.familyName
		: this.props.contact.userid.email;

		var removeButton = '';
		if(!_.isEmpty(this.props.activeMember)) {
			if(this.props.activeMember.role == 'admin')
				removeButton = (
					<Button onClick={ this.remove } >
						Remove
					</Button>);
		}

		var className = 'row';
		if(this.props.active) className += ' active';

		return <div className="row">

					<div className='col-xs-3'>
						<Button
							className=''
							style={ contactButtonStyle }
						/>
					</div>

					<div className='col-xs-4'>
						<span className="">
							{ contactName }
						</span>
						<span className=''>
							{ contactStatus }
						</span>
					</div>

					<div className='col-xs-2'>
						<span> { this.props.contact.role || 'user' } </span>
					</div>

					<div className='col-xs-3'>
						{ removeButton }
					</div>

				 </div>
	}
});
module.exports = MemberItem;
