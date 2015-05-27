/**
 * LoginPage.jsx
 *
 * @author albert
 * @author kevin
 */

'use strict';

// imports
var React = require('react');

var Router = require('react-router');
var Link = Router.Link;

var LoginPanel = require('./LoginPanel.jsx');

var LoginPage = React.createClass({
	render: function() {
		return <div className='login-container'>

					<div className='login-header'>
						<img src='/img/logo_100.png' height="60" width="60"/>
					</div>

					<div className='login-title'>
						<h1>Join the Fun</h1>
						<h2>Sign in to continue to Bevy.</h2>
					</div>

					<LoginPanel />

					<div className='back-link'>
						<Link to="forgot">Forgot your password?</Link>
						<br />
						<Link to='register'>Create an Account</Link>
					</div>

					<br/>
				 </div>;
	}
});

module.exports = LoginPage;
