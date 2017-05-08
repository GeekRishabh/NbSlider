import React, {Component} from 'react';
import { TouchableOpacity, Image,Platform, TouchableHighlight, } from 'react-native';
import getTheme from './native-base-theme/components';
import commonColor from './native-base-theme/variables/platform';

import { Container, Content, ListItem, Text, CheckBox, Header,Toast, StyleProvider, Footer, FooterTab, Button, InputGroup, Input, Icon, Fab, ActionSheet, Label, Item, Form, Card, CardItem, Body, Picker, Left,Right, Title, Badge,  Tab, Tabs, View} from 'native-base';
import styles from './styles';

export class DefaultMarker extends Component {
  
  render() {
    return (
       <TouchableHighlight>
        <View
          style={[styles.markerStyle, this.props.markerStyle, this.props.pressed && styles.pressedMarkerStyle, this.props.pressed && this.props.pressedMarkerStyle]}
        />
      </TouchableHighlight>
    );
  }
};

