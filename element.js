import React, { PropTypes, Component } from 'react';
import { View, StyleSheet, Animated, Easing, PanResponder } from 'react-native';

const TRACK_SIZE = 4;
const THUMB_SIZE = 20;

var DEFAULT_ANIMATION_CONFIGS = {
  spring: {
    friction: 7,
    tension: 100,
  },
  timing: {
    duration: 150,
    easing: Easing.inOut(Easing.ease),
    delay: 0,
  },
};

function Initial(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Initial.prototype.containsPoint = function(x, y) {
  return (
    x >= this.x &&
    y >= this.y &&
    x <= this.x + this.width &&
    y <= this.y + this.height
  );
};

export default class Slider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSize: { width: 0, height: 0 },
      trackSize: { width: 0, height: 0 },
      thumbSize: { width: 0, height: 0 },
      allMeasured: false,
      value: new Animated.Value(props.value),
    };
  }

  componentWillMount() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder.bind(
        this
      ),
      onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder.bind(
        this
      ),
      onPanResponderGrant: this.handlePanResponderGrant.bind(this),
      onPanResponderMove: this.handlePanResponderMove.bind(this),
      onPanResponderRelease: this.handlePanResponderEnd.bind(this),
      onPanResponderTerminationRequest: this.handlePanResponderRequestEnd.bind(
        this
      ),
      onPanResponderTerminate: this.handlePanResponderEnd.bind(this),
    });
  }

  componentWillReceiveProps(nextProps) {
    var newValue = nextProps.value;

    if (this.props.value !== newValue) {
      if (this.props.animateTransitions) {
        this.setCurrentValueAnimated(newValue);
      } else {
        this.setCurrentValue(newValue);
      }
    }
  }

  setCurrentValue(value) {
    this.state.value.setValue(value);
  }

  setCurrentValueAnimated(value) {
    var animationType = this.props.animationType;
    var animationConfig = Object.assign(
      {},
      DEFAULT_ANIMATION_CONFIGS[animationType],
      this.props.animationConfig,
      {
        toValue: value,
      }
    );

    Animated[animationType](this.state.value, animationConfig).start();
  }

  handleMoveShouldSetPanResponder(/*e: Object, gestureState: Object*/) {
    // Should we become active when the user moves a touch over the thumb?
    return false;
  }

  handlePanResponderGrant(/*e: Object, gestureState: Object*/) {
    this._previousLeft = this.getThumbLeft(this.getCurrentValue());
    this.fireChangeEvent('onSlidingStart');
  }

  handlePanResponderMove(e, gestureState) {
    if (this.props.disabled) {
      return;
    }

    this.setCurrentValue(this.getValue(gestureState));
    this.fireChangeEvent('onValueChange');
  }

  handlePanResponderRequestEnd() {
    // Should we allow another component to take over this pan?
    return false;
  }

  handlePanResponderEnd(e, gestureState) {
    if (this.props.disabled) {
      return;
    }

    this.setCurrentValue(this.getValue(gestureState));
    this.fireChangeEvent('onSlidingComplete');
  }

  thumbHitTest(e) {
    var nativeEvent = e.nativeEvent;
    var thumbTouchInitial = this.getThumbTouchInitial();
    return thumbTouchInitial.containsPoint(
      nativeEvent.locationX,
      nativeEvent.locationY
    );
  }

  handleStartShouldSetPanResponder(e /*gestureState: Object*/) {
    // Should we become active when the user presses down on the thumb?
    return this.thumbHitTest(e);
  }

  fireChangeEvent(event) {
    if (this.props[event]) {
      this.props[event](this.getCurrentValue());
    }
  }

  getTouchOverflowSize() {
    var state = this.state;
    var props = this.props;

    var size = {};
    if (state.allMeasured === true) {
      size.width = Math.max(
        0,
        props.thumbTouchSize.width - state.thumbSize.width
      );
      size.height = Math.max(
        0,
        props.thumbTouchSize.height - state.containerSize.height
      );
    }

    return size;
  }

  getTouchOverflowStyle() {
    var { width, height } = this.getTouchOverflowSize();

    var touchOverflowStyle = {};
    if (width !== undefined && height !== undefined) {
      var verticalMargin = -height / 2;
      touchOverflowStyle.marginTop = verticalMargin;
      touchOverflowStyle.marginBottom = verticalMargin;

      var horizontalMargin = -width / 2;
      touchOverflowStyle.marginLeft = horizontalMargin;
      touchOverflowStyle.marginRight = horizontalMargin;
    }

    return touchOverflowStyle;
  }

  handleMeasure(name, x) {
    var { width, height } = x.nativeEvent.layout;
    var size = { width: width, height: height };

    var storeName = `_${name}`;
    var currentSize = this[storeName];
    if (
      currentSize &&
      width === currentSize.width &&
      height === currentSize.height
    ) {
      return;
    }
    this[storeName] = size;

    if (this._containerSize && this._trackSize && this._thumbSize) {
      this.setState({
        containerSize: this._containerSize,
        trackSize: this._trackSize,
        thumbSize: this._thumbSize,
        allMeasured: true,
      });
    }
  }

  measureContainer(x) {
    this.handleMeasure('containerSize', x);
  }

  measureTrack(x) {
    this.handleMeasure('trackSize', x);
  }

  measureThumb(x) {
    this.handleMeasure('thumbSize', x);
  }

  getValue(gestureState) {
    var length = this.state.containerSize.width - this.state.thumbSize.width;
    var thumbLeft = this._previousLeft + gestureState.dx;

    var ratio = thumbLeft / length;

    if (this.props.step) {
      return Math.max(
        this.props.minimumValue,
        Math.min(
          this.props.maximumValue,
          this.props.minimumValue +
            Math.round(
              ratio *
                (this.props.maximumValue - this.props.minimumValue) /
                this.props.step
            ) *
              this.props.step
        )
      );
    } else {
      return Math.max(
        this.props.minimumValue,
        Math.min(
          this.props.maximumValue,
          ratio * (this.props.maximumValue - this.props.minimumValue) +
            this.props.minimumValue
        )
      );
    }
  }

  getCurrentValue() {
    return this.state.value.__getValue();
  }

  getRatio(value) {
    return (
      (value - this.props.minimumValue) /
      (this.props.maximumValue - this.props.minimumValue)
    );
  }

  getThumbLeft(value) {
    var ratio = this.getRatio(value);
    return (
      ratio * (this.state.containerSize.width - this.state.thumbSize.width)
    );
  }

  getThumbTouchInitial() {
    var state = this.state;
    var props = this.props;
    var touchOverflowSize = this.getTouchOverflowSize();

    return new Initial(
      touchOverflowSize.width / 2 +
        this.getThumbLeft(this.getCurrentValue()) +
        (state.thumbSize.width - props.thumbTouchSize.width) / 2,
      touchOverflowSize.height / 2 +
        (state.containerSize.height - props.thumbTouchSize.height) / 2,
      props.thumbTouchSize.width,
      props.thumbTouchSize.height
    );
  }

  render() {
    const {
      minimumValue,
      maximumValue,
      minimumTrackColor,
      maximumTrackColor,
      thumbColor,
      containerStyle,
      style,
      trackStyle,
      thumbStyle,
      ...other
    } = this.props;

    var {
      value,
      containerSize,
      trackSize,
      thumbSize,
      allMeasured,
    } = this.state;

    var mainStyles = containerStyle || styles;
    var thumbLeft = value.interpolate({
      inputRange: [minimumValue, maximumValue],
      outputRange: [0, containerSize.width - thumbSize.width],
      //extrapolate: 'clamp',
    });

    var valueVisibleStyle = {};
    if (!allMeasured) {
      valueVisibleStyle.opacity = 0;
    }

    var minimumTrackStyle = {
      position: 'absolute',
      width: Animated.add(thumbLeft, thumbSize.width / 2),
      marginTop: -trackSize.height,
      backgroundColor: minimumTrackColor,
      ...valueVisibleStyle,
    };

    var touchOverflowStyle = this.getTouchOverflowStyle();
    return (
      <View
        {...other}
        style={[mainStyles.container, style]}
        onLayout={this.measureContainer.bind(this)}
      >
        <View
          style={[
            { backgroundColor: maximumTrackColor },
            mainStyles.track,
            trackStyle,
          ]}
          onLayout={this.measureTrack.bind(this)}
        />
        <Animated.View
          style={[mainStyles.track, trackStyle, minimumTrackStyle]}
        />
        <Animated.View
          onLayout={this.measureThumb.bind(this)}
          style={[
            { backgroundColor: thumbColor },
            mainStyles.thumb,
            thumbStyle,
            {
              transform: [
                { translateX: thumbLeft },
                { translateY: -(trackSize.height + thumbSize.height) / 2 },
              ],
              ...valueVisibleStyle,
            },
          ]}
        />
        <View
          style={[styles.touchArea, touchOverflowStyle]}
          {...this.panResponder.panHandlers}
        >
          
        </View>
      </View>
    );
  }
}

Slider.propTypes = {
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
};

Slider.defaultProps = {
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

const styles = StyleSheet.create({
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
    top: 22,
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