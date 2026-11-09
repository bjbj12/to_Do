import { Pressable, StyleSheet, Text, View } from 'react-native';

import { STATUSES, STATUS_COLORS, STATUS_LABELS, type TodoStatus } from '@/todos';

export function StatusBadge({ status }: { status: TodoStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] }]}>
      <Text style={styles.badgeText}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

type StatusPickerProps = {
  value: TodoStatus | null;
  onChange: (status: TodoStatus) => void;
};

export function StatusPicker({ value, onChange }: StatusPickerProps) {
  return (
    <View style={styles.row}>
      {STATUSES.map((status) => {
        const selected = status === value;
        const color = STATUS_COLORS[status];
        return (
          <Pressable
            key={status}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(status)}
            style={[styles.option, { borderColor: color }, selected && { backgroundColor: color }]}
          >
            <Text style={[styles.optionText, { color: selected ? '#fff' : color }]}>
              {STATUS_LABELS[status]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  option: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  optionText: { fontWeight: '600' },
});
