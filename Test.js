'use strict';

import React, {Component, PropTypes } from "react";

import {Animated, Image, StyleSheet, PanResponder, View, Easing } from "react-native";
import shallowCompare from 'react-addons-shallow-compare';
import styleEqual from 'style-equal';

const TRACK_SIZE = 4;
const THUMB_SIZE = 20;

function Initial(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Initial.prototype.containsPoint = function(x, y) {
  return (x >= this.x
          && y >= this.y
          && x <= this.x + this.width
          && y <= this.y + this.height);
};

const DEFAULT_ANIMATION_CONFIGS = {
  spring : {
    friction : 7,
    tension  : 100
  },
  timing : {
    duration : 150,
    easing   : Easing.inOut(Easing.ease),
    delay    : 0
  },
};

const Test = React.createClass({
  propTypes: {
    value: PropTypes.number,
    disabled: PropTypes.bool,
    minimumValue: PropTypes.number,
    maximumValue: PropTypes.number,
    step: PropTypes.number,
    minimumTrackColor: PropTypes.string,
    maximumTrackColor: PropTypes.string,
    thumbColor: PropTypes.string,
    thumbTouchSize: PropTypes.shape(
      {width: PropTypes.number, height: PropTypes.number}
    ),
    onValueChange: PropTypes.func,
    onSlidingStart: PropTypes.func,
    onSlidingComplete: PropTypes.func,
    style: View.propTypes.style,
    trackStyle: View.propTypes.style,
    thumbStyle: View.propTypes.style,
    animateTransitions : PropTypes.bool,
    animationType : PropTypes.oneOf(['spring', 'timing']),
    animationConfig : PropTypes.object,
  },

  getInitialState() {
    return {
      containerSize: {width: 0, height: 0},
      trackSize: {width: 0, height: 0},
      thumbSize: {width: 0, height: 0},
      allMeasured: false,
      value: new Animated.Value(this.props.value),
    };
  },
  getDefaultProps() {
    return {
      value: 0,
      minimumValue: 0,
      maximumValue: 1,
      step: 0,
      minimumTrackColor: 'red',
      maximumTrackColor: 'blue',
      thumbColor: 'green',
      thumbTouchSize: {width: 40, height: 40},
      animationType: 'timing'
    };
  },
  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminationRequest: this._handlePanResponderRequestEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
    });
  },
  componentWillReceiveProps (nextProps) {
    const newValue = nextProps.value;
    if (this.props.value !== newValue) {
      if (this.props.animateTransitions) {
        this._setCurrentValueAnimated(newValue);
      } else {
        this._setCurrentValue(newValue);
      }
    }
  },
  // shouldComponentUpdate (nextProps, nextState) {
  //   return shallowCompare(
  //     { props: this._getPropsForComponentUpdate(this.props), state: this.state },
  //     this._getPropsForComponentUpdate(nextProps),
  //     nextState
  //   ) || !styleEqual(this.props.style, nextProps.style)
  //     || !styleEqual(this.props.trackStyle, nextProps.trackStyle)
  //     || !styleEqual(this.props.thumbStyle, nextProps.thumbStyle);
  // },
  render() {
    const { minimumValue, maximumValue, minimumTrackColor, maximumTrackColor, thumbColor, styles, style, trackStyle, thumbStyle, ...other } = this.props;
    const {value, containerSize, trackSize, thumbSize, allMeasured} = this.state;
    const mainStyles = styles || defaultStyles;
    const thumbLeft = value.interpolate({
        inputRange: [minimumValue, maximumValue],
        outputRange: [0, containerSize.width - thumbSize.width],
      });
    const valueVisibleStyle = {};
    if (!allMeasured) {
      valueVisibleStyle.opacity = 0;
    }

    const minimumTrackStyle = {
      position: 'absolute',
      width: Animated.add(thumbLeft, thumbSize.width / 2),
      marginTop: -trackSize.height,
      backgroundColor: minimumTrackColor,
      ...valueVisibleStyle
    };

    const touchOverflowStyle = this._getTouchOverflowStyle();

    return (
      <View {...other} style={[mainStyles.container, style]} onLayout={this._measureContainer}>
        <View
          style={[{backgroundColor: maximumTrackColor,}, mainStyles.track, trackStyle]}
          onLayout={this._measureTrack} //maximum track view
           />
        <Animated.View style={[mainStyles.track, trackStyle, minimumTrackStyle]}// minimumview
         />
         
        <Animated.View  //marker view
          onLayout={this._measureThumb}
          style={[
            {backgroundColor: thumbColor},
            mainStyles.thumb, thumbStyle,
            {
              transform: [
                { translateX: thumbLeft },
              ],
              ...valueVisibleStyle
            }
          ]}
        >
         

        </Animated.View>
        <View // binding panresponder to the slider 
          style={[defaultStyles.touchArea, touchOverflowStyle]}
          {...this._panResponder.panHandlers}>
          
        </View>
      </View>
    );
  },

  // _getPropsForComponentUpdate(props) {
  //   const {
  //     value,
  //     onValueChange,
  //     onSlidingStart,
  //     onSlidingComplete,
  //     style,
  //     trackStyle,
  //     thumbStyle,
  //     ...otherProps,
  //   } = props;

  //   return otherProps;
  // },
   // PanResponder actions //
  _handleStartShouldSetPanResponder (e){
    return this._thumbHitTest(e);
  },

  _handleMoveShouldSetPanResponder () {
    return false;
  },

  _handlePanResponderGrant () {
    this._previousLeft = this._getThumbLeft(this._getCurrentValue());
    this._fireChangeEvent('onSlidingStart');
  },
  _handlePanResponderMove (e , gestureState) {
    if (this.props.disabled) {
      return;
    }
    this._setCurrentValue(this._getValue(gestureState));
    this._fireChangeEvent('onValueChange');
  },
  _handlePanResponderRequestEnd (e, gestureState ) {
    return false;
  },
  _handlePanResponderEnd (e, gestureState) {
    if (this.props.disabled) {
      return;
    }
    this._setCurrentValue(this._getValue(gestureState));
    this._fireChangeEvent('onSlidingComplete');
  },

   // action for view/task oriented 
  _measureContainer (x) {
    this._handleMeasure('containerSize', x);
  },

  _measureTrack (x) {
    this._handleMeasure('trackSize', x);
  },

  _measureThumb (x) {
    this._handleMeasure('thumbSize', x);
  },

  _handleMeasure (name, x) {
    const {width, height} = x.nativeEvent.layout;
    const size = {width: width, height: height};

    const storeName = `_${name}`;
    const currentSize = this[storeName];
    if (currentSize && width === currentSize.width && height === currentSize.height) {
      return;
    }
    this[storeName] = size;

    if (this._containerSize && this._trackSize && this._thumbSize) {
      this.setState({
        containerSize: this._containerSize,
        trackSize: this._trackSize,
        thumbSize: this._thumbSize,
        allMeasured: true,
      })
    }
  },

  _getRatio (value) {
    return (value - this.props.minimumValue) / (this.props.maximumValue - this.props.minimumValue);
  },

  _getThumbLeft (value) {
    const ratio = this._getRatio(value);
    return ratio * (this.state.containerSize.width - this.state.thumbSize.width);
  },

  _getValue (gestureState) {
    const length = this.state.containerSize.width - this.state.thumbSize.width;
    const thumbLeft = this._previousLeft + gestureState.dx;

    const ratio = thumbLeft / length;

    if (this.props.step) {
      return Math.max(this.props.minimumValue,
        Math.min(this.props.maximumValue,
          this.props.minimumValue + Math.round(ratio * (this.props.maximumValue - this.props.minimumValue) / this.props.step) * this.props.step
        )
      );
    } else {
      return Math.max(this.props.minimumValue,
        Math.min(this.props.maximumValue,
          ratio * (this.props.maximumValue - this.props.minimumValue) + this.props.minimumValue
        )
      );
    }
  },

  _getCurrentValue() {
    return this.state.value.__getValue();
  },

  _setCurrentValue (value) {
    this.state.value.setValue(value);
  },

  _setCurrentValueAnimated (value) {
    const animationType   = this.props.animationType;
    const animationConfig = Object.assign(
          {},
          DEFAULT_ANIMATION_CONFIGS[animationType],
          this.props.animationConfig,
          {toValue : value}
        );

    Animated[animationType](this.state.value, animationConfig).start();
  },

  _fireChangeEvent(event) {
    if (this.props[event]) {
      this.props[event](this._getCurrentValue());
    }
  },

  _getTouchOverflowSize() {
    const state = this.state;
    const props = this.props;

    const size = {};
    if (state.allMeasured === true) {
      size.width = Math.max(0, props.thumbTouchSize.width - state.thumbSize.width);
      size.height = Math.max(0, props.thumbTouchSize.height - state.containerSize.height);
    }

    return size;
  },

  _getTouchOverflowStyle() {
    const {width, height} = this._getTouchOverflowSize();

    const touchOverflowStyle = {};
    if (width !== undefined && height !== undefined) {
      const verticalMargin = -height / 2;
      touchOverflowStyle.marginTop = verticalMargin;
      touchOverflowStyle.marginBottom = verticalMargin;

      const horizontalMargin = -width / 2;
      touchOverflowStyle.marginLeft = horizontalMargin;
      touchOverflowStyle.marginRight = horizontalMargin;
    }

    return touchOverflowStyle;
  },

  _thumbHitTest (e) {
    const nativeEvent = e.nativeEvent;
    const thumbTouchInitial = this._getThumbTouchInitial();
    return thumbTouchInitial.containsPoint(nativeEvent.locationX, nativeEvent.locationY);
  },

  _getThumbTouchInitial() {
    const state = this.state;
    const props = this.props;
    const touchOverflowSize = this._getTouchOverflowSize();

    return new Initial(
      touchOverflowSize.width / 2 + this._getThumbLeft(this._getCurrentValue()) + (state.thumbSize.width - props.thumbTouchSize.width) / 2,
      touchOverflowSize.height / 2 + (state.containerSize.height - props.thumbTouchSize.height) / 2,
      props.thumbTouchSize.width,
      props.thumbTouchSize.height
    );
  }

});


const defaultStyles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_SIZE,
    borderRadius: TRACK_SIZE / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,    
  },
  touchArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

module.exports = Test;