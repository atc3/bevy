/**
 * NewBoardModal.jsx
 *
 * @author albert
 * @author kevin
 */

'use strict';

var React = require('react');
var _ = require('underscore');
var $ = require('jquery');
var constants = require('./../../constants');
var getSlug = require('speakingurl');

var {
  Panel,
  Input,
  Button,
  Modal
} = require('react-bootstrap');

var {
  FlatButton,
  RaisedButton,
  TextField,
  Styles
} = require('material-ui');

var ThemeManager = new Styles.ThemeManager();

var BoardActions = require('./../BoardActions');
var Uploader = require('./../../shared/components/Uploader.jsx');

var user = window.bootstrap.user;

var NewBoardModal = React.createClass({

  propTypes: {
    show: React.PropTypes.bool,
    onHide: React.PropTypes.func
  },

  getInitialState() {
    return {
      name: '',
      description: '',
      image: {},
    };
  },

  getChildContext() { 
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    }
  },

  componentWillMount() {
    ThemeManager.setComponentThemes({
      textField: {
        textColor: '#666',
        focusColor: '#666'
      }
    });
  },

  onUploadComplete(file) {
    this.setState({
      image: file,
    });
  },

  create(ev) {
    ev.preventDefault();

    var name = this.refs.Name.getValue();
    var description = this.refs.Description.getValue();
    var image = this.state.image;
    var parent = this.props.activeBevy._id;

    if(_.isEmpty(name)) {
      this.refs.Name.setErrorText('Please enter a name for your board');
      return;
    }

    BoardActions.create(name, description, image, parent);

    // after, close the window
    this.hide();
  },

  hide() {
    this.setState({
      name: '',
      description: '',
      image: {},
    });
    this.props.onHide();
  },

  render() {

    var dropzoneOptions = {
      maxFiles: 1,
      acceptedFiles: 'image/*',
      clickable: '.dropzone-panel-button',
      dictDefaultMessage: ' ',
      init: function() {
        this.on("addedfile", function() {
          if (this.files[1]!=null){
            this.removeFile(this.files[0]);
          }
        });
      }
    };
    var boardImageURL = (_.isEmpty(this.state.image)) 
      ? '/img/default_board_img.png' 
      : constants.apiurl + '/files/' + this.state.image.filename;
    var boardImageStyle = {
      backgroundImage: 'url(' + boardImageURL + ')',
      backgroundSize: '100% auto'
    };

    return (
      <Modal show={ this.props.show } onHide={ this.hide } className="create-board">
        <Modal.Header closeButton>
          <Modal.Title>New Board For "{this.props.activeBevy.name}"</Modal.Title>
        </Modal.Header>
        <Modal.Body className="board-info">
          <div className="new-board-picture">
            <Uploader
              onUploadComplete={ this.onUploadComplete }
              className="bevy-image-dropzone"
              style={ boardImageStyle }
              dropzoneOptions={ dropzoneOptions }
            />
          </div>
          <div className='text-fields'>
            <TextField
              type='text'
              ref='Name'
              placeholder='Board Name'
              onChange={() => {
                this.setState({
                  name: this.refs.Name.getValue()
                });
              }}
            />
            <TextField
              type='text'
              ref='Description'
              placeholder='Board Description'
              multiLine={true}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="panel-bottom">
          <FlatButton
            onClick={ this.hide }
            label="Cancel"
          />
          <RaisedButton
            onClick={ this.create }
            label="Create"
            style={{ marginLeft: '10px' }}
            disabled={this.state.name == '' || _.isEmpty(this.props.activeBevy)}
          />
        </Modal.Footer>
      </Modal>
    );
  }
});

NewBoardModal.childContextTypes = {
  muiTheme: React.PropTypes.object
};

module.exports = NewBoardModal;