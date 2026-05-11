import { View, Text, StyleSheet, Alert } from 'react-native'
import React, { useMemo } from 'react'
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetScrollView, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import StarRating from 'react-native-star-rating-widget'
import { colors, fonts, radii, spacing } from '../../lib/theme'
import { Button } from '../../components/ui'
import { Ionicons } from '@expo/vector-icons'
import { useCreateReview } from '../../hooks/useReviews'

interface ReviewBottomSheetProps {
    bottomSheetRef: React.RefObject<BottomSheet>;
    orderId: string;
    masterId: string;
    customerId: string;
}

const ReviewBottomSheet = ({ bottomSheetRef, orderId, masterId, customerId }: ReviewBottomSheetProps) => {
    const [rating, setRating] = React.useState(0)
    const [comment, setComment] = React.useState('')
    const snapPoints = useMemo(() => ['60%'], []);
    const { mutateAsync, isPending } = useCreateReview();

    const renderBackdrop = React.useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
        ),
        [],
    );

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('', 'Iltimos, yulduz bering');
            return;
        }

        try {
            await mutateAsync({
                order_id: orderId,
                customer_id: customerId,
                master_id: masterId,
                rating,
                comment: comment.trim() || undefined,
            });
            handleClear();
            Alert.alert('', 'Bahoyingiz qabul qilindi');
        } catch {
            Alert.alert('', 'Xatolik yuz berdi. Qayta urinib ko\'ring.');
        }
    }

    const handleClear = () => {
        setRating(0);
        setComment('');
        bottomSheetRef.current?.close();
    }

    return (
        <BottomSheet snapPoints={snapPoints} backdropComponent={renderBackdrop} enablePanDownToClose index={-1} ref={bottomSheetRef}>
            <BottomSheetView style={styles.container}>
                <BottomSheetScrollView style={{ flex: 1 }}>
                    <Text style={styles.title}>Xizmatni baholang</Text>
                    <View>
                        <Text style={styles.question}>Ustanining ish sifati sizga ma'qul keldimi?</Text>
                        <View style={styles.starContainer}>
                            <StarRating
                                rating={rating}
                                onChange={setRating}
                                maxStars={5}
                                starSize={32}
                                starStyle={styles.star}
                                emptyColor={colors.onSurfaceMuted}
                                color={colors.primary}
                                step={'full'}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <BottomSheetTextInput
                                placeholder='Fikringizni yozing...'
                                value={comment}
                                onChangeText={setComment}
                                style={styles.textArea}
                                multiline
                                numberOfLines={4}
                                textAlignVertical='top'
                            />
                        </View>
                    </View>
                </BottomSheetScrollView>
                <View style={{ marginTop: spacing[6], width: '100%' }}>
                    <Button
                        title='Yuborish'
                        onPress={handleSubmit}
                        loading={isPending}
                        style={styles.submitButton}
                        icon={<Ionicons name='send-outline' size={18} color={colors.onPrimary} />}
                    />
                </View>
            </BottomSheetView>
        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    star: {
        marginHorizontal: 4,
    },
    starContainer: {
        flexDirection: 'row',
        gap: spacing[6],
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing[6],
    },
    container: {
        flex: 1,
        padding: spacing[6],
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontFamily: fonts.bold,
        fontSize: 24,
        color: colors.onSurface,
        textAlign: 'center',
    },
    question: {
        fontFamily: fonts.medium,
        fontSize: 16,
        color: colors.onSurfaceVariant,
        textAlign: 'center',
        marginTop: spacing[2],
    },
    textArea: {
        backgroundColor: colors.surfaceContainerHigh,
        borderRadius: radii.lg,
        padding: spacing[4],
        marginTop: spacing[6],
        width: '100%',
        height: 100,
        fontFamily: fonts.regular,
        fontSize: 15,
        color: colors.onSurface,
    },
    submitButton: {
        borderRadius: radii.md,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
    }
})

export default ReviewBottomSheet
