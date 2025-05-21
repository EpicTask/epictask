import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ParentButton: React.FC = () => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="people-outline" size={24} color="#5A67D8" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.boldText}>
          Parent <Text style={styles.arrow}>→</Text>{' '}
        </Text>
        <Text style={styles.regularText}>
          Manages tasks, sets rewards, and tracks progress.
        </Text>
      </View>
      <View style={styles.rightCircle} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderRadius: 20,
    paddingVertical: 15,
    paddingLeft: 15,
    paddingRight: 0,
    marginVertical: 10,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8ECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  boldText: {
    fontSize: 16,
    color: '#5A67D8',
    fontWeight: '700',
  },
  arrow: {
    fontSize: 16,
    color: '#5A67D8',
    fontWeight: '700',
  },
  regularText: {
    fontSize: 16,
    color: '#5A67D8',
    fontWeight: '400',
  },
  rightCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8ECFF',
    position: 'absolute',
    right: -15,
    bottom: -5,
    zIndex: -10
  },
});

export default ParentButton;