import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

const ios = Platform.OS == 'ios';
export default function CustomKeyboardView({children, style}) {
  return (
    <KeyboardAvoidingView
        behavior={ios? 'padding': 'height'}
        style={styles.keyboardAvoidingView}
    >
        <ScrollView
            style={styles.ScrollView}
            contentContainerStyle={styles.contentContainer}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {
                children
            }
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
      flex: 1
    },
    scrollView: {
      flex: 1
    },
    contentContainer: {
      flexGrow: 1
    },
});