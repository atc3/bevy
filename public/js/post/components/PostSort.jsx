/**
 * PostSort.jsx
 *
 * Sort posts with this handy neat little bar
 *
 * @author albert
 */

'use strict';

// imports
var React = require('react');

var PostActions = require('./../PostActions');
var PostStore = require('./../PostStore');

var rbs = require('react-bootstrap');
var Well = rbs.Well;
var Button = rbs.Button;
var ButtonGroup = rbs.ButtonGroup;

// React class
var PostSort = React.createClass({

  propTypes: {
    activeBevy: React.PropTypes.object,
    sortType: React.PropTypes.string
  },

  // grab initial sorting mechanism
  // should default to 'top' and 'asc'
  getInitialState() {
    return {
      sortType: this.props.sortType
    }
  },

  /**
   * send the sort action
   * and update the state for immediate
   * visual feedback
   * @param  {ev} browser (synthetic) event
   */
  sort(ev) {
    // get the sort type that was triggered
    var by = ev.target.textContent;

    // update the state immediately
    // should trigger a rerender
    this.setState({
      sortType: by
    });

    // now call action
    PostActions.sort(by);
  },

  render() {

    // add to this string to add more types to the top
    // split function turns this string into an array
    var sort_types = 'new top'.split(' ');
    // array of react components to inject
    var sorts = [];

    // for each sort type
    for(var key in sort_types) {
      var type = sort_types[key];

      // generate html attributes
      var id = type + '-btn';
      var className = 'sort-btn btn';
      // if this type matches the current sorting mechanism (stored in the state)
      // make it active
      var activeStyle = {};
      if(type == this.state.sortType) {
       var activeStyle = {color: '#222', textDecoration: 'underline'};
       className += ' active';
      }
      // the dot that separates types
      // don't generate for the last one
      var dot = (key == (sort_types.length-1)) ? '' : '•';

      sorts.push(
        <Button
          type='button'
          className={ className }
          key={ id }
          id={ id }
          style={activeStyle}
          onClick={ this.sort }
        > { type }
        </Button>
      );
      sorts.push(dot);
    }

    return (
      <Well className="sort-well">
        <ButtonGroup className='sort-btn-group' role="group">
          { sorts }
        </ButtonGroup>
      </Well>
    );
  }
});

module.exports = PostSort;
