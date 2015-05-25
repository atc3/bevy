/**
 * LoginPage.jsx
 *
 * @author albert
 * @author kevin
 */

'use strict';

// imports
var React = require('react');

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
						<a href="/forgot">Forgot your password?</a>
					</div>

					<br/>
				 </div>;
	}
});

module.exports = LoginPage;
