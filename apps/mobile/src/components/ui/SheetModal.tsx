import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Pinned below the scrolling content, e.g. the primary action. */
  footer?: ReactNode;
  children: ReactNode;
}

export function SheetModal({ visible, onClose, title, footer, children }: SheetModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable
          className="flex-1"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View
          className="max-h-[88%] rounded-t-3xl bg-surface"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="items-center pt-3">
            <View className="h-1.5 w-10 rounded-full bg-line" />
          </View>
          <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
            <Text className="flex-1 pr-3 text-xl font-bold text-ink" numberOfLines={2}>
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="h-10 w-10 items-center justify-center rounded-full bg-card active:bg-brand-50"
            >
              <Text className="text-base text-muted">✕</Text>
            </Pressable>
          </View>
          <ScrollView
            className="flex-shrink"
            contentContainerClassName="gap-4 px-5 pb-4 pt-2"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          {footer ? <View className="gap-2 px-5 pt-2">{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}
