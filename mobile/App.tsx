import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, Pressable, useColorScheme, TextInput, I18nManager, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import './src/i18n';
import { useTranslation } from 'react-i18next';
import { darkTheme, lightTheme } from './src/theme/colors';

type Step = 'language' | 'gps' | 'summary' | 'privacy' | 'done';

export default function App() {
  const scheme = useColorScheme();
  const [theme, setTheme] = useState<'dark' | 'light'>(scheme === 'dark' ? 'dark' : 'dark');
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<Step>('language');
  const [language, setLanguage] = useState<string>('en');
  const [summary, setSummary] = useState<string>('');

  const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <Text style={{ backgroundColor: colors.surface, color: colors.textMuted, padding: 10, borderRadius: 8, borderColor: colors.border, borderWidth: 1 }}>
          {t('warning.noBackend')}
        </Text>
      </View>
      <View style={{ flex: 1, padding: 20, gap: 16 }}>{children}</View>
    </SafeAreaView>
  );

  const Button: React.FC<{ label: string; onPress: () => void; disabled?: boolean }> = ({ label, onPress, disabled }) => (
    <Pressable onPress={onPress} disabled={disabled} style={{
      backgroundColor: disabled ? colors.buttonDisabled : colors.button,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center'
    }}>
      <Text style={{ color: colors.buttonText, fontSize: 16, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );

  const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700' }}>{children}</Text>
  );

  const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 22 }}>{children}</Text>
  );

  const onSelectLang = async (code: string) => {
    setLanguage(code);
    const isRTL = code === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }
    await i18n.changeLanguage(code);
    setStep('gps');
  };

  const canContinueSummary = useMemo(() => summary.trim().length >= 20, [summary]);

  return (
    <Container>
      {step === 'language' && (
        <View style={{ gap: 16 }}>
          <Title>{t('onboarding.chooseLanguage')}</Title>
          <Body>{t('onboarding.languageHelp')}</Body>
          <View style={{ gap: 12 }}>
            <Button label="English" onPress={() => onSelectLang('en')} />
            <Button label="தமிழ் (Tamil)" onPress={() => onSelectLang('ta')} />
            <Button label="हिन्दी (Hindi)" onPress={() => onSelectLang('hi')} />
            <Button label="العربية (Arabic)" onPress={() => onSelectLang('ar')} />
          </View>
        </View>
      )}

      {step === 'gps' && (
        <View style={{ gap: 16 }}>
          <Title>{t('onboarding.gpsTitle')}</Title>
          <Body>{t('onboarding.gpsBody')}</Body>
          <Button label={t('actions.continue')} onPress={() => setStep('summary')} />
        </View>
      )}

      {step === 'summary' && (
        <View style={{ gap: 16 }}>
          <Title>{t('onboarding.summaryTitle')}</Title>
          <Body>{t('onboarding.summaryBody')}</Body>
          <TextInput
            placeholder={t('onboarding.summaryPlaceholder')}
            placeholderTextColor={colors.textFaint}
            value={summary}
            onChangeText={setSummary}
            multiline
            style={{
              minHeight: 120,
              backgroundColor: colors.surface,
              color: colors.text,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border
            }}
          />
          <Button label={t('actions.continue')} onPress={() => setStep('privacy')} disabled={!canContinueSummary} />
        </View>
      )}

      {step === 'privacy' && (
        <View style={{ gap: 16 }}>
          <Title>{t('privacy.tldrTitle')}</Title>
          <Body>{t('privacy.tldr')}</Body>
          <Pressable onPress={() => Linking.openURL('https://skillbridge.app/privacy')}>
            <Text style={{ color: colors.button }}>{t('privacy.readFull')}</Text>
          </Pressable>
          <Button label={t('actions.finish')} onPress={() => setStep('done')} />
        </View>
      )}

      {step === 'done' && (
        <View style={{ gap: 16 }}>
          <Title>{t('onboarding.doneTitle')}</Title>
          <Body>{t('onboarding.doneBody')}</Body>
        </View>
      )}
    </Container>
  );
}

