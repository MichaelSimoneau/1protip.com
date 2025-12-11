import { View, Text, StyleSheet, Modal, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { X } from 'lucide-react-native';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  authorName?: string;
}

export function CommentModal({ visible, onClose, onSubmit, authorName }: CommentModalProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment.trim());
      setComment('');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Comment on {authorName}'s post</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666666" />
            </Pressable>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Write your comment..."
            placeholderTextColor="#999999"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            autoFocus
          />

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.submitButton, !comment.trim() && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!comment.trim()}
            >
              <Text style={styles.submitText}>Post Comment</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#0066cc',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
