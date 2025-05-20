import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  label: 'Original' | 'You';
  content: string;
  color?: string; //
};

const getColorFromCode = (code?: string) => {
  switch (code) {
    case 'green':
      return '#d4edda';
    case 'orange':
      return '#fff3cd';
    case 'red':
      return '#f8d7da';
    default:
      return '#eee'; 
  }
};

const ProgressBubble: React.FC<Props> = ({ label, content, color }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.bubble, { backgroundColor: getColorFromCode(color) }]}>
        <Text style={styles.text}>{content}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  bubble: {
    padding: 10,
    borderRadius: 10,
    maxWidth: '90%',
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
});

export default ProgressBubble;
