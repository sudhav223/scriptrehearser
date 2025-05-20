import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

const ChatBubble = ({ type, content, character, isUser, read, onPress }) => {
  // Determine background color based on type
  const getBackgroundColor = () => {
    if (type === 'action') return '#FFD6D6'; // Light red
    if (type === 'scene') return '#D6EFFF'; // Light blue
    return isUser ? '#075E54' : '#ECE5DD'; // WhatsApp colors
  };

  // Determine text color
  const getTextColor = () => {
    if (type === 'action') return '#990000'; // Dark red
    if (type === 'scene') return '#003366'; // Dark blue
    return isUser ? '#DCF8C6' : '#000';
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        style={{
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          backgroundColor: getBackgroundColor(),
          borderRadius: 12,
          padding: 10,
          marginVertical: 4,
          maxWidth: '80%',
          position: 'relative',
        }}
      >
        {character && (
          <Text style={{ fontWeight: 'bold', color: isUser ? '#fff' : '#000' }}>
            {character}
          </Text>
        )}
        <Text style={{ color: getTextColor() }}>{content}</Text>
        {read && (
          <Text
            style={{
              position: 'absolute',
              bottom: 4,
              right: 6,
              fontSize: 10,
              color: isUser ? '#fff' : '#000',
            }}
          >
            ✓✓
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ChatBubble;
