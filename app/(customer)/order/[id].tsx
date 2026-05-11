import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
	ActivityIndicator,
	Alert,
	Image,
	Linking,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { useOrder } from '../../../hooks/useOrder';
import { useOrderReview } from '../../../hooks/useReviews';
import { queryClient } from '../../../lib/queryClient';
import { colors, fonts, radii, shadows, spacing } from '../../../lib/theme';
import { cancelOrder } from '../../../services/orders';
import { useAuthStore } from '../../../store/authStore';
import ReviewBottomSheet from '../ReviewBottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';
import { useRef } from 'react';

const STATUS_STEPS = [
	{ key: 'pending', label: 'Kutilmoqda', icon: 'time-outline' as const },
	{ key: 'accepted', label: 'Qabul qilindi', icon: 'checkmark-circle-outline' as const },
	{ key: 'on_the_way', label: "Usta yo'lda", icon: 'car-outline' as const },
	{ key: 'arrived', label: 'Usta yetib keldi', icon: 'location-outline' as const },
	{ key: 'completed', label: 'Bajarildi', icon: 'checkmark-done-outline' as const },
];

const STATUS_TITLES: Record<string, string> = {
	pending: 'Kutilmoqda',
	accepted: 'Qabul qilindi',
	on_the_way: "Usta yo'lda",
	arrived: 'Usta yetib keldi',
	completed: 'Bajarildi',
	cancelled: 'Bekor qilindi',
};

const STATUS_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
	pending: 'time-outline',
	accepted: 'checkmark-circle-outline',
	on_the_way: 'car-outline',
	arrived: 'location-outline',
	completed: 'checkmark-done-outline',
	cancelled: 'close-circle-outline',
};

export default function CustomerOrderDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: order, isLoading } = useOrder(id);
	const { data: existingReview } = useOrderReview(id);
	const { profile } = useAuthStore();
	const bottomSheetRef = useRef<BottomSheet>(null);

	const currentStatus = order?.status ?? 'pending';
	const master = order?.master as any;
	const category = order?.category as any;
	const isCancelled = currentStatus === 'cancelled';
	const isCompleted = currentStatus === 'completed';
	const canCancel = currentStatus === 'pending';
	const alreadyReviewed = !!existingReview;

	const stepIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);

	const handleOpenBottomSheet = () => {
		bottomSheetRef.current?.expand();
	};

	const handleCancel = () => {
		if (!id) return;
		Alert.alert('Bekor qilish', 'Buyurtmani bekor qilmoqchimisiz?', [
			{ text: "Yo'q", style: 'cancel' },
			{
				text: 'Ha, bekor qilish',
				style: 'destructive',
				onPress: async () => {
					try {
						await cancelOrder(id);
						queryClient.invalidateQueries({ queryKey: ['order', id] });
						queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
					} catch {
						Alert.alert('', 'Xatolik yuz berdi');
					}
				},
			},
		]);
	};

	const handleCall = () => {
		if (master?.phone) {
			Linking.openURL(`tel:+998${master.phone}`);
		}
	};

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container} edges={['top']}>
				<View style={styles.header}>
					<Pressable onPress={() => router.back()} style={styles.backBtn}>
						<Ionicons name='arrow-back' size={24} color={colors.primary} />
					</Pressable>
					<Text style={styles.headerTitle}>Buyurtma holati</Text>
				</View>
				<ActivityIndicator size='large' color={colors.primary} style={{ marginTop: 40 }} />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			<View style={styles.header}>
				<Pressable onPress={() => router.back()} style={styles.backBtn}>
					<Ionicons name='arrow-back' size={24} color={colors.primary} />
				</Pressable>
				<Text style={styles.headerTitle}>Buyurtma holati</Text>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
				{/* Status icon & title */}
				<View style={styles.statusSection}>
					<View style={[styles.statusIcon, isCancelled && styles.statusIconCancelled]}>
						<Ionicons
							name={STATUS_ICONS[currentStatus] ?? 'time-outline'}
							size={40}
							color={isCancelled ? colors.onSurfaceMuted : colors.primary}
						/>
					</View>
					<Text style={styles.statusTitle}>{STATUS_TITLES[currentStatus]}</Text>
					{category && <Text style={styles.statusSub}>{category.name_uz}</Text>}
				</View>

				{/* Status steps (hide for cancelled) */}
				{!isCancelled && (
					<View style={styles.steps}>
						{STATUS_STEPS.map((step, i) => {
							const done = i <= stepIndex;
							return (
								<View key={step.key} style={styles.stepRow}>
									<View style={[styles.stepDot, done && styles.stepDotDone]}>
										{done && <Ionicons name='checkmark' size={14} color={colors.onPrimary} />}
									</View>
									<Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{step.label}</Text>
								</View>
							);
						})}
					</View>
				)}

				{/* Photos */}
				{order?.photo_urls && order.photo_urls.length > 0 && (
					<View style={styles.photosSection}>
						<Text style={styles.sectionLabel}>Rasmlar</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.photosRow}
						>
							{order.photo_urls.map((url: string, i: number) => {
								return (
									<Image
										key={i}
										source={{ uri: url }}
										style={styles.photo}
										onLoad={() => console.log('Rasm yuklandi!')}
										onError={error => console.log('Image Load Error:', error.nativeEvent.error)}
									/>
								);
							})}
						</ScrollView>
					</View>
				)}

				{/* Description */}
				{order?.description && (
					<View style={styles.infoSection}>
						<Text style={styles.sectionLabel}>Tavsif</Text>
						<Text style={styles.infoText}>{order.description}</Text>
					</View>
				)}

				{/* Address */}
				{order?.address && (
					<View style={styles.infoSection}>
						<Text style={styles.sectionLabel}>Manzil</Text>
						<Text style={styles.infoText}>{order.address}</Text>
					</View>
				)}

				{/* Master info (when assigned) */}
				{master && (
					<View style={styles.masterCard}>
						<View style={styles.masterInfoContainer}>
							<Avatar uri={master.avatar_url} name={master.full_name} size={48} />
							<View style={styles.masterInfo}>
								<Text style={styles.masterName}>{master.full_name ?? 'Usta'}</Text>
								<Text style={styles.masterPhone}>{master.phone}</Text>
								<Text style={styles.masterPhone}>{master.rating}</Text>
							</View>
						</View>
						<View>
							<Button title="Qo'ng'iroq qilish" onPress={handleCall} icon={<Ionicons name='call-outline' size={20} color={colors.primary} />} />
						</View>
					</View>
				)}

				{/* No master yet message */}
				{!master && !isCancelled && !isCompleted && (
					<View style={styles.waitingCard}>
						<Ionicons name='hourglass-outline' size={24} color={colors.onSurfaceMuted} />
						<Text style={styles.waitingText}>Usta hali topilmagan. Kutib turing...</Text>
					</View>
				)}

				{isCompleted && !alreadyReviewed && (
					<View style={{ paddingHorizontal: spacing[6], marginTop: spacing[6] }}>
						<Button title='Izohni qoldirish' onPress={handleOpenBottomSheet} />
					</View>
				)}
				{isCompleted && alreadyReviewed && (
					<View style={styles.reviewedBadge}>
						<Ionicons name='star' size={16} color={colors.primary} />
						<Text style={styles.reviewedText}>
							Siz {existingReview.rating} yulduz berdingiz
						</Text>
					</View>
				)}
			</ScrollView>

			{/* Cancel button (only for pending) */}
			{canCancel && (
				<View style={styles.bottomFixed}>
					<Button title='Bekor qilish' variant='secondary' onPress={handleCancel} />
				</View>
			)}


			<ReviewBottomSheet
				bottomSheetRef={bottomSheetRef as any}
				orderId={id ?? ''}
				masterId={master?.id ?? ''}
				customerId={profile?.id ?? ''}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.surface },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: spacing[6],
		paddingVertical: spacing[3],
		gap: spacing[3],
	},
	backBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerTitle: {
		flex: 1,
		fontFamily: fonts.semiBold,
		fontSize: 16,
		color: colors.onSurface,
	},
	scrollContent: { paddingBottom: 100 },
	statusSection: {
		alignItems: 'center',
		paddingVertical: spacing[6],
		gap: spacing[2],
	},
	statusIcon: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: colors.surfaceContainerLowest,
		alignItems: 'center',
		justifyContent: 'center',
		...shadows.ambient,
		marginBottom: spacing[3],
	},
	statusIconCancelled: {
		backgroundColor: colors.surfaceContainerHigh,
	},
	statusTitle: {
		fontFamily: fonts.bold,
		fontSize: 22,
		color: colors.onSurface,
	},
	statusSub: {
		fontFamily: fonts.regular,
		fontSize: 14,
		color: colors.onSurfaceMuted,
	},
	steps: {
		paddingHorizontal: spacing[6],
		gap: spacing[4],
		marginBottom: spacing[6],
	},
	stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
	stepDot: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: colors.surfaceContainerHigh,
		alignItems: 'center',
		justifyContent: 'center',
	},
	stepDotDone: { backgroundColor: colors.primary },
	stepLabel: {
		fontFamily: fonts.medium,
		fontSize: 15,
		color: colors.onSurfacePlaceholder,
	},
	stepLabelDone: { fontFamily: fonts.semiBold, color: colors.onSurface },
	photosSection: { paddingLeft: spacing[6], marginBottom: spacing[4] },
	photosRow: { gap: spacing[3], paddingRight: spacing[6] },
	photo: {
		width: 160,
		height: 120,
		borderRadius: radii.lg,
		backgroundColor: colors.surfaceContainerHigh,
	},
	infoSection: { paddingHorizontal: spacing[6], marginBottom: spacing[4] },
	sectionLabel: {
		fontFamily: fonts.semiBold,
		fontSize: 13,
		color: colors.onSurfacePlaceholder,
		marginBottom: spacing[1],
	},
	infoText: {
		fontFamily: fonts.regular,
		fontSize: 15,
		color: colors.onSurfaceVariant,
		lineHeight: 22,
	},
	masterCard: {
		flexDirection: 'column',
		marginHorizontal: spacing[6],
		backgroundColor: colors.surfaceContainerLowest,
		borderRadius: radii.xl,
		padding: spacing[4],
		gap: spacing[3],
		...shadows.ambient,
	},
	masterInfoContainer: {
		flexDirection: 'row',
		gap: spacing[3],
	},
	masterInfo: { flex: 1, gap: 2 },
	masterName: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.onSurface },
	masterPhone: { fontFamily: fonts.regular, fontSize: 13, color: colors.onSurfaceMuted },
	callBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: colors.surfaceContainerHigh,
		alignItems: 'center',
		justifyContent: 'center',
	},
	waitingCard: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: spacing[6],
		backgroundColor: colors.surfaceContainerLowest,
		borderRadius: radii.xl,
		padding: spacing[4],
		gap: spacing[3],
		...shadows.ambient,
	},
	waitingText: {
		flex: 1,
		fontFamily: fonts.medium,
		fontSize: 14,
		color: colors.onSurfaceMuted,
	},
	reviewedBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing[2],
		marginHorizontal: spacing[6],
		marginTop: spacing[6],
		backgroundColor: colors.surfaceContainerLowest,
		borderRadius: radii.xl,
		padding: spacing[4],
		...shadows.ambient,
	},
	reviewedText: {
		fontFamily: fonts.semiBold,
		fontSize: 14,
		color: colors.primary,
	},
	bottomFixed: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: spacing[6],
		paddingBottom: spacing[6],
		paddingTop: spacing[3],
		backgroundColor: colors.surface,
	},
});
