import React, {Component} from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import getTheme from './native-base-theme/components';
import commonColor from './native-base-theme/variables/platform';

import { Container, Content, ListItem, Text, CheckBox, Header,Toast, StyleProvider, Footer, FooterTab, Button, InputGroup, Input, Icon, Fab, ActionSheet, Label, Item, Form, Card, CardItem, Body, Picker, Left,Right, Title, Badge,  Tab, Tabs, View, Slider} from 'native-base';
import {Marker} from './Marker';
import {DefaultMarker} from './DefaultMarker';

// import Slider from './Slider'
import Test from './Test';

export default class App extends Component {
constructor(props) {
  super(props);

  this.state = {
    value: 0.0,
  };
}
  render() {
    console.disableYellowBox =true;
    
    return (
      <StyleProvider style={getTheme(commonColor)}>
      <Container>
      <Header searchBar rounded>
      <Item>
        <Icon name="ios-search" />
        <Input placeholder="Search"  />
       </Item>
     </Header>
        <Content padder>
      
<Slider />


          <Slider
            minimumValue={-25}
            maximumValue={50}
            minimumTrackTintColor='blue'
            maximumTrackColor='green'
            thumbColor='red'
            thumbStyle={{borderWidth: 2, borderColor: 'green', borderRadius : 0 }}
            //trackStyle ={{height: 10}}
          />  

        <Slider
          value={this.state.value}
          onValueChange={(value) => this.setState({value})} />
        <Text>Value: {this.state.value}</Text>


        </Content>
         <Footer >
            <FooterTab>
                <Button>
                    <Text>Apps</Text>
                </Button>
                <Button>
                    <Text>Camera</Text>
                </Button>
                <Button active>
                    <Text>Navigate</Text>
                </Button>
                <Button>
                    <Text>Contact</Text>
                </Button>
            </FooterTab>
        </Footer>
      </Container>
      </StyleProvider>
    );
  }
};

