/**
 * Notification.jsx
 *
 * @author KEVIN
 */

'use strict';

var React = require('react');
var _ = require('underscore');

var rbs = require('react-bootstrap');
var OverlayTrigger = rbs.OverlayTrigger;
var ModalTrigger = rbs.ModalTrigger;
var Button = rbs.Button;
var Popover = rbs.Popover;
var ButtonGroup = rbs.ButtonGroup;

var mui = require('material-ui');
var FlatButton = mui.FlatButton;

var AliasList = require('./../../alias/components/AliasList.jsx');
var AddAliasModal = require('./../../alias/components/AddAliasModal.jsx');
var NotificationList = require('./NotificationList.jsx');

var user = window.bootstrap.user;
var email = user.email;

var ProfileDropdown = React.createClass({

	propTypes: {
		allNotifications: React.PropTypes.array
	},

	render: function() {

		return <OverlayTrigger trigger="click" placement="bottom" overlay={
				 	<Popover className="notification-dropdown">
				 		<div className="title">
				 			Notifications
				 		</div>
						<NotificationList allNotifications={ this.props.allNotifications } />
					</Popover>}>
				 	<Button className="notification-dropdown-btn">
					 	<img src="./../../img/notification-icon.png"/>
				 	</Button>
				 </OverlayTrigger>;
	}
});
module.exports = ProfileDropdown;