import Constants from 'expo-constants';

type Extra = {
	apiBaseUrl?: string;
};

const extra = (Constants?.expoConfig?.extra || {}) as Extra;

export const apiBaseUrl: string | undefined = extra.apiBaseUrl;

export const isBackendReady = (): boolean => {
	return typeof apiBaseUrl === 'string' && apiBaseUrl.length > 0;
};

