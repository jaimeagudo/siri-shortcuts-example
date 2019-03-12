/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import { Platform } from "react-native";

const IS_SIRI_CAPABLE =
  parseInt(Platform.Version, 10) >= 12 && Platform.OS == "ios";

import type { ShortcutOptions } from "react-native-siri-shortcut";

import React, { Component } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import {
  SiriShortcutsEvent,
  donateShortcut,
  suggestShortcuts,
  clearAllShortcuts,
  clearShortcutsWithIdentifiers,
  presentShortcut
} from "react-native-siri-shortcut";

import AddToSiriButton, {
  SiriButtonStyles
} from "react-native-siri-shortcut/AddToSiriButton";

const BUNDLE_ID = "io.purepoint.siri.shortcuts";

type Props = {};
type State = {
  shortcutInfo: ?any,
  shortcutActivityType: ?string,
  addToSiriStyle: 0 | 1 | 2 | 3
};

const shorcutOptions = [
  {
    activityType: BUNDLE_ID + ".sayHello",
    title: "Shortcut 1, Say Hi",
    userInfo: {
      foo: 1,
      bar: "baz",
      baz: 34.5
    },
    keywords: ["kek", "foo", "bar"],
    persistentIdentifier: BUNDLE_ID + ".sayHello",
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
    suggestedInvocationPhrase: "Say something",
    needsSave: true
  },
  {
    activityType: BUNDLE_ID + ".somethingElse",
    title: "Shortcut 2, Something Else",
    persistentIdentifier: BUNDLE_ID + ".shortcut2",
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
    suggestedInvocationPhrase: "What's up?"
  }
];

export default class App extends Component<Props, State> {
  state = {
    shortcutInfo: null,
    shortcutActivityType: null,
    addToSiriStyle: SiriButtonStyles.blackOutline
  };

  componentDidMount() {
    SiriShortcutsEvent.addListener(
      "SiriShortcutListener",
      this.handleSiriShortcut.bind(this)
    );

    // This will suggest these two shortcuts so that they appear
    // in Settings > Siri & Search, even if they are not yet
    // donated. Suitable for shortcuts that you expect the user
    // may want to use. (https://developer.apple.com/documentation/sirikit/shortcut_management/suggesting_shortcuts_to_users)
    suggestShortcuts(shorcutOptions);
  }

  handleSiriShortcut({ userInfo, activityType }: any) {
    this.setState({
      shortcutInfo: userInfo,
      shortcutActivityType: activityType
    });
  }

  setupShortcut1() {
    donateShortcut(shorcutOptions[0]);
  }

  setupShortcut2() {
    donateShortcut(shorcutOptions[1]);
  }

  async clearShortcut(index: number) {
    try {
      await clearShortcutsWithIdentifiers([shorcutOptions[index].activityType]);
      alert("Cleared Shortcut " + index);
    } catch (e) {
      console.error(e);
      alert("error! Are you running iOS 12???");
    }
  }

  async clearShortcuts() {
    try {
      await clearAllShortcuts();
      alert("Deleted all the shortcuts");
    } catch (e) {
      alert("You're not running iOS 12!");
    }
  }

  swapSiriButtonTheme() {
    const { addToSiriStyle } = this.state;

    const styles = Object.keys(SiriButtonStyles).map(
      key => SiriButtonStyles[key]
    );

    const index = styles.findIndex(style => style === addToSiriStyle);
    if (index === styles.length - 1)
      this.setState({ addToSiriStyle: styles[0] });
    else this.setState({ addToSiriStyle: styles[index + 1] });
  }

  render() {
    const { shortcutInfo, shortcutActivityType, addToSiriStyle } = this.state;
    console.log(addToSiriStyle);

    if (!IS_SIRI_CAPABLE) {
      return (
        <View style={styles.container}>
          <Text>
            Sorry, you need to run an iOS version higher than 12 in order to use
            Siri shortcuts
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text>Shortcut Activity Type: {shortcutActivityType || "None"}</Text>
        <Text>
          Shortcut Info:{" "}
          {shortcutInfo ? JSON.stringify(shortcutInfo) : "No shortcut data."}
        </Text>

        <AddToSiriButton
          buttonStyle={addToSiriStyle}
          onPress={() => {
            presentShortcut(shorcutOptions[0], ({ status }) => {
              console.log(`I was ${status}`);
            });
          }}
          shortcut={shorcutOptions[0]}
        />
        <Button
          title="Swap Siri Button Theme"
          onPress={this.swapSiriButtonTheme.bind(this)}
        />

        <Button
          title="Donate Shortcut 1"
          onPress={() => donateShortcut(shorcutOptions[0])}
        />
        <Button
          title="Donate Shortcut 2"
          onPress={() => donateShortcut(shorcutOptions[1])}
        />
        <Button
          title="Clear Shortcut 1"
          onPress={this.clearShortcut.bind(this, 0)}
        />
        <Button
          title="Clear Shortcut 2"
          onPress={this.clearShortcut.bind(this, 1)}
        />
        <Button
          title="Clear Both Shortcuts"
          onPress={this.clearShortcuts.bind(this)}
        />
        {/* <Button
          title="Delete All Shortcuts"
          onPress={this.clearShortcuts.bind(this)}
        /> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
