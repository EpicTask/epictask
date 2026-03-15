import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, Image, View, ActivityIndicator } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface XummQrModalProps {
  visible: boolean;
  qrUrl: string | null;
  onClose: () => void;
  title?: string;
}

export const XummQrModal: React.FC<XummQrModalProps> = ({
  visible,
  qrUrl,
  onClose,
  title = 'Connect with Xumm',
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modalContent}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons 
                name="close" 
                size={24} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <ThemedText style={styles.instructions}>
              Scan this QR code with the Xumm app on your mobile device to complete the sign in process.
            </ThemedText>

            <View style={styles.qrContainer}>
              {qrUrl ? (
                <Image 
                  source={{ uri: qrUrl }} 
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.light.tint} />
                  <ThemedText style={styles.loadingText}>Generating QR Code...</ThemedText>
                </View>
              )}
            </View>
            
            <ThemedText style={styles.waitingText}>
              Waiting for confirmation...
            </ThemedText>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  title: {
    fontSize: 20,
  },
  closeButton: {
    padding: 5,
  },
  body: {
    padding: 20,
    alignItems: 'center',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  qrContainer: {
    width: 250,
    height: 250,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 20,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    opacity: 0.7,
  },
  waitingText: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.6,
  },
});
