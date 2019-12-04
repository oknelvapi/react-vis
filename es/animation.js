var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { interpolate } from 'd3-interpolate';
import { spring, Motion, presets } from 'react-motion';

var ANIMATION_PROPTYPES = PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
  stiffness: PropTypes.number,
  nonAnimatedProps: PropTypes.arrayOf(PropTypes.string),
  damping: PropTypes.number
}), PropTypes.bool]);

var propTypes = {
  animatedProps: PropTypes.arrayOf(PropTypes.string).isRequired,
  animation: ANIMATION_PROPTYPES,
  onStart: PropTypes.func,
  onEnd: PropTypes.func
};

/**
 * Format the animation style object
 * @param {Object|String} animationStyle - The animation style property, either the name of a
 * presets are one of noWobble, gentle, wobbly, stiff
 */
function getAnimationStyle() {
  var animationStyle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : presets.noWobble;

  if (typeof animationStyle === 'string') {
    return presets[animationStyle] || presets.noWobble;
  }
  var damping = animationStyle.damping,
      stiffness = animationStyle.stiffness;

  return _extends({
    damping: damping || presets.noWobble.damping,
    stiffness: stiffness || presets.noWobble.stiffness
  }, animationStyle);
}

/**
 * Extract the animated props from the entire props object.
 * @param {Object} props Props.
 * @returns {Object} Object of animated props.
 */
export function extractAnimatedPropValues(props) {
  var animatedProps = props.animatedProps,
      otherProps = _objectWithoutProperties(props, ['animatedProps']);

  return animatedProps.reduce(function (result, animatedPropName) {
    if (otherProps.hasOwnProperty(animatedPropName)) {
      result[animatedPropName] = otherProps[animatedPropName];
    }
    return result;
  }, {});
}

var Animation = function (_PureComponent) {
  _inherits(Animation, _PureComponent);

  function Animation(props) {
    _classCallCheck(this, Animation);

    var _this = _possibleConstructorReturn(this, (Animation.__proto__ || Object.getPrototypeOf(Animation)).call(this, props));

    _this._motionEndHandler = function () {
      if (_this.props.onEnd) {
        _this.props.onEnd();
      }
    };

    _this._renderChildren = function (_ref) {
      var i = _ref.i;
      var children = _this.props.children;

      var interpolator = _this._interpolator;
      var child = React.Children.only(children);
      var interpolatedProps = interpolator ? interpolator(i) : interpolator;

      // interpolator doesnt play nice with deeply nested objected
      // so we expose an additional prop for situations like these, soit _data,
      // which stores the full tree and can be recombined with the sanitized version
      // after interpolation
      var data = interpolatedProps && interpolatedProps.data || null;
      if (data && child.props._data) {
        data = data.map(function (row, index) {
          var correspondingCell = child.props._data[index];
          return _extends({}, row, {
            parent: correspondingCell.parent,
            children: correspondingCell.children
          });
        });
      }

      return React.cloneElement(child, _extends({}, child.props, interpolatedProps, {
        data: data || child.props.data || null,
        // enforce re-rendering
        _animation: Math.random()
      }));
    };

    _this._updateInterpolator(props);
    return _this;
  }

  _createClass(Animation, [{
    key: 'componentWillUpdate',
    value: function componentWillUpdate(props) {
      this._updateInterpolator(this.props, props);
      if (props.onStart) {
        props.onStart();
      }
    }

    /**
     * Render the child into the parent.
     * @param {Number} i Number generated by the spring.
     * @returns {React.Component} Rendered react element.
     * @private
     */

  }, {
    key: '_updateInterpolator',


    /**
     * Update the interpolator function and assign it to this._interpolator.
     * @param {Object} oldProps Old props.
     * @param {Object} newProps New props.
     * @private
     */
    value: function _updateInterpolator(oldProps, newProps) {
      this._interpolator = interpolate(extractAnimatedPropValues(oldProps), newProps ? extractAnimatedPropValues(newProps) : null);
    }
  }, {
    key: 'render',
    value: function render() {
      var animationStyle = getAnimationStyle(this.props.animation);
      var defaultStyle = { i: 0 };
      var style = { i: spring(1, animationStyle) };
      // In order to make Motion re-run animations each time, the random key is
      // always passed.
      // TODO: find a better solution for the spring.
      var key = Math.random();
      return React.createElement(
        Motion,
        _extends({ defaultStyle: defaultStyle, style: style, key: key }, { onRest: this._motionEndHandler }),
        this._renderChildren
      );
    }
  }]);

  return Animation;
}(PureComponent);

Animation.propTypes = propTypes;
Animation.displayName = 'Animation';

export default Animation;

export var AnimationPropType = ANIMATION_PROPTYPES;