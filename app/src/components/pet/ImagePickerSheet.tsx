import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../../lib/constants'
import * as Haptics from 'expo-haptics'

interface Props {
  visible: boolean
  onClose: () => void
  onCamera: () => void
  onLibrary: () => void
}

export function ImagePickerSheet({ visible, onClose, onCamera, onLibrary }: Props) {
  async function handleCamera() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onClose()
    onCamera()
  }

  async function handleLibrary() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onClose()
    onLibrary()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Προσθήκη φωτογραφίας</Text>

        <TouchableOpacity style={styles.option} onPress={handleCamera}>
          <View style={styles.iconWrapper}>
            <Ionicons name="camera" size={24} color={Colors.primary} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Τράβηξε φωτογραφία</Text>
            <Text style={styles.optionSub}>Άνοιγμα κάμερας</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleLibrary}>
          <View style={styles.iconWrapper}>
            <Ionicons name="images" size={24} color={Colors.secondary} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Επιλογή από gallery</Text>
            <Text style={styles.optionSub}>Από τις φωτογραφίες σου</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelText}>Άκυρο</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl + 16,
    paddingTop: Spacing.md,
    ...Shadow.lg,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  optionSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  cancelText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
})
