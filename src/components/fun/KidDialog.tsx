import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { KidModal } from './KidModal';
import { ClayButton } from '../clay/ClayButton';
import { KidTone, kidPalette } from '../../theme/kidTheme';

export interface KidConfirmOptions {
  title: string;
  message?: string;
  emblem?: string;
  tone?: KidTone;
  confirmText: string;
  cancelText?: string;
  /** Destructive actions get a coral confirm button. */
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

export interface KidNotifyOptions {
  title: string;
  message?: string;
  emblem?: string;
  tone?: KidTone;
  okText?: string;
  onClose?: () => void;
}

type DialogState =
  | ({ kind: 'confirm' } & KidConfirmOptions)
  | ({ kind: 'notify' } & KidNotifyOptions)
  | null;

/**
 * Kid-styled replacement for Alert.alert / window.confirm / window.alert.
 * Alert.alert is a silent no-op on react-native-web, so confirmations built on it
 * did nothing in the web build; this works identically on web, iOS and Android.
 *
 *   const { dialog, confirm, notify } = useKidDialog();
 *   ...
 *   confirm({ title, message, confirmText, onConfirm });
 *   return (<>{...screen}{dialog}</>);
 */
export function useKidDialog() {
  const [state, setState] = useState<DialogState>(null);
  const [busy, setBusy] = useState(false);

  const confirm = useCallback((opts: KidConfirmOptions) => setState({ kind: 'confirm', ...opts }), []);
  const notify = useCallback((opts: KidNotifyOptions) => setState({ kind: 'notify', ...opts }), []);

  const close = () => {
    if (state?.kind === 'notify') state.onClose?.();
    setState(null);
  };

  const dialog = (
    <KidModal
      visible={state !== null}
      onClose={busy ? undefined : close}
      emblem={state?.emblem || (state?.kind === 'confirm' && state.destructive ? '⚠️' : '💬')}
      tone={state?.tone || (state?.kind === 'confirm' && state.destructive ? 'coral' : 'sky')}
      title={state?.title}
      subtitle={state?.message}
      maxWidth={400}
    >
      {state?.kind === 'confirm' ? (
        <View style={styles.row}>
          <ClayButton
            tone="white"
            size="md"
            style={styles.btn}
            disabled={busy}
            title={state.cancelText || 'Cancel'}
            textStyle={{ color: kidPalette.inkSoft }}
            onPress={close}
          />
          <ClayButton
            tone={state.destructive ? 'coral' : 'mint'}
            size="md"
            style={styles.btn}
            loading={busy}
            title={state.confirmText}
            onPress={async () => {
              const run = state.onConfirm;
              setBusy(true);
              try {
                await run();
              } finally {
                setBusy(false);
                setState((cur) => (cur && cur.kind === 'confirm' && cur.onConfirm === run ? null : cur));
              }
            }}
          />
        </View>
      ) : state?.kind === 'notify' ? (
        <ClayButton tone={state.tone || 'sky'} size="md" style={styles.full} title={state.okText || 'OK'} onPress={close} />
      ) : null}
    </KidModal>
  );

  return { dialog, confirm, notify };
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  btn: {
    flexGrow: 1,
    flexBasis: 130,
  },
  full: {
    width: '100%',
    marginTop: 4,
  },
});
