import { ActivityIndicator, Pressable, Text } from 'react-native';
import { colors } from '@/lib/colors';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  /** Optional leading emoji. */
  icon?: string;
  className?: string;
  accessibilityHint?: string;
}

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-brand-700 active:bg-brand-800',
  secondary: 'bg-card border border-line active:bg-brand-50',
  ghost: 'bg-transparent active:bg-brand-50',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-ink',
  ghost: 'text-brand-700',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  className = '',
  accessibilityHint,
}: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      className={`min-h-[52px] flex-row items-center justify-center gap-2 rounded-2xl px-5 ${CONTAINER[variant]} ${inactive ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.brand700} />
      ) : (
        <>
          {icon ? <Text className="text-lg">{icon}</Text> : null}
          <Text className={`text-base font-semibold ${LABEL[variant]}`}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
