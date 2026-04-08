import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import { forwardRef, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useI18nStore, type Locale } from '../../i18n';
import { colors, fonts, radii, spacing } from '../../lib/theme';

const LANGUAGES: { key: Locale; flag: string; label: string }[] = [
	{ key: 'uz', flag: '🇺🇿', label: "O'zbekcha" },
	{ key: 'ru', flag: '🇷🇺', label: 'Русский' },
];

interface Props {
	onClose?: () => void;
}

const LanguageBottomSheet = forwardRef<BottomSheet, Props>(({ onClose }, ref) => {
	const { locale, setLocale } = useI18nStore();
	const snapPoints = useMemo(() => ['50%'], []);

	const handleSelect = (key: Locale) => {
		setLocale(key);
		if (ref && 'current' in ref && ref.current) {
			ref.current.close();
		}
		onClose?.();
	};

	const renderBackdrop = useCallback(
		(props: BottomSheetDefaultBackdropProps) => (
			<BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
		),
		[],
	);

	return (
		<BottomSheet
			ref={ref}
			index={-1}
			snapPoints={snapPoints}
			enablePanDownToClose
			backdropComponent={renderBackdrop}
			backgroundStyle={styles.sheetBg}
			handleIndicatorStyle={styles.indicator}
		>
			<BottomSheetView style={{ flex: 1 }}>
				<View style={styles.content}>
					<Text style={styles.title}>Til / Язык</Text>
					<View style={styles.options}>
						{LANGUAGES.map(lang => {
							const active = locale === lang.key;
							return (
								<Pressable
									key={lang.key}
									style={[styles.card, active && styles.cardActive]}
									onPress={() => handleSelect(lang.key)}
								>
									<Text style={styles.flag}>{lang.flag}</Text>
									<Text style={[styles.label, active && styles.labelActive]}>{lang.label}</Text>
									{active && (
										<View style={styles.check}>
											<Text style={styles.checkIcon}>✓</Text>
										</View>
									)}
								</Pressable>
							);
						})}
					</View>
				</View>
			</BottomSheetView>
		</BottomSheet>
	);
});

LanguageBottomSheet.displayName = 'LanguageBottomSheet';

export { LanguageBottomSheet };

const styles = StyleSheet.create({
	sheetBg: {
		backgroundColor: colors.surfaceContainerLowest,
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
	},
	indicator: {
		backgroundColor: colors.outline,
		width: 40,
		height: 4,
		borderRadius: 2,
	},
	content: {
		paddingHorizontal: spacing[6],
		paddingTop: spacing[2],
	},
	title: {
		fontFamily: fonts.bold,
		fontSize: 18,
		color: colors.onSurface,
		marginBottom: spacing[4],
	},
	options: {
		flexDirection: 'column',
		gap: spacing[3],
	},
	card: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.surfaceContainerHigh,
		borderRadius: radii.xl,
		paddingVertical: spacing[3],
		paddingHorizontal: spacing[4],
		gap: spacing[3],
	},
	cardActive: {
		backgroundColor: colors.secondaryContainer,
	},
	flag: {
		fontSize: 24,
	},
	label: {
		flex: 1,
		fontFamily: fonts.semiBold,
		fontSize: 15,
		color: colors.onSurfaceVariant,
	},
	labelActive: {
		color: colors.onSecondaryContainer,
	},
	check: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	checkIcon: {
		fontFamily: fonts.bold,
		fontSize: 14,
		color: colors.onPrimary,
	},
});
