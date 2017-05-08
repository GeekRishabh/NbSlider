import React, { Component } from 'react';
import { Container, Content, Tab, Tabs, Item, Label, Input } from 'native-base';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

​export default class Tab1 extends Component {
    render() {
        return (
            <View>
            <Item floatingLabel>
              <Label>Frnamn</Label>
              <Input keyboardType='default'
              returnKeyType='next'
              autoFocus={false}
              autoCorrect={false}
              multiline={false}
             />
            </Item>
            </View>

        );
    }
}