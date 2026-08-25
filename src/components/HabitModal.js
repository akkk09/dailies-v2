import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';

const HabitModal = ({ visible, onClose, onSave, onDelete, habitToEdit }) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle(habitToEdit ? habitToEdit.title : '');
    }
  }, [visible, habitToEdit]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), habitToEdit?.id);
      setTitle('');
    }
  };

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {habitToEdit ? 'Edit Habit ✏️' : 'Add New Habit ✨'}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="e.g. Drink 2L water"
            placeholderTextColor="#ffb3c6"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addButton} onPress={handleSave}>
              <Text style={styles.addButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          {habitToEdit && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(habitToEdit.id)}>
              <Text style={styles.deleteButtonText}>🗑️ Delete Habit</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 179, 198, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    shadowColor: '#ff7eb3',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff4d85',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff0f5',
    borderRadius: 15,
    padding: 18,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ffcce0',
    marginBottom: 25,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: '#ffe6f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ff4d85',
    fontWeight: '600',
    fontSize: 16,
  },
  addButton: {
    flex: 1,
    padding: 16,
    borderRadius: 15,
    marginLeft: 10,
    backgroundColor: '#ff4d85',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  deleteButtonText: {
    color: '#f43f5e',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HabitModal;
