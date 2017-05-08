import React, {Component} from 'react';
import { TouchableOpacity, Image } from 'react-native';
import getTheme from './native-base-theme/components';
import commonColor from './native-base-theme/variables/platform';

import { Container, Content, ListItem, Text, CheckBox, Header,Toast, StyleProvider, Footer, FooterTab, Button, InputGroup, Input, Icon, Fab, ActionSheet, Label, Item, Form, Card, CardItem, Body, Picker, Left,Right, Title, Badge,  Tab, Tabs, View} from 'native-base';
import styles from './styles';

export class Marker extends Component {
  
  render() {
    return (
      <Image
        style={styles.image}
        source={this.props.pressed ? require('./images/a.png') : require('./images/b.png')}
        resizeMode='contain'
      />
    );
  }
};

