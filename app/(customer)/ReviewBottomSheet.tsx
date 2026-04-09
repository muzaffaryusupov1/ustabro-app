import { View, Text, StyleSheet, Alert } from 'react-native'
import React, { useRef } from 'react'
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetScrollView, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import StarRating from 'react-native-star-rating-widget'
import { colors, radii, spacing } from '../../lib/theme'
import { useMemo } from 'react'
import { TextInput } from 'react-native-gesture-handler'
import { Button } from '../../components/ui'
import { Ionicons } from '@expo/vector-icons'

interface ReviewBottomSheetProps {
    bottomSheetRef: React.RefObject<BottomSheet>;
}

const ReviewBottomSheet = ({ bottomSheetRef }: ReviewBottomSheetProps) => {
    const [rating, setRating] = React.useState(0)
    const snapPoints = useMemo(() => ['60%'], []);
    const [review, setReview] = React.useState('')

    const renderBackdrop = React.useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
        ),
        [],
    );

    const handleSubmit = () => {
        console.log(rating, review);
        Alert.alert('Muvaffaqiyatli', `${rating} yulduz va ${review} fikr yuborildi`);
        handleClear();
    }

    const handleClear = () => {
        setRating(0);
        setReview('');
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
                                value={review}
                                onChangeText={setReview}
                                style={styles.textArea}
                                multiline
                                numberOfLines={4}
                                autoFocus={true}
                            />
                        </View>
                    </View>
                </BottomSheetScrollView>
                <View style={{ marginTop: spacing[6], width: '100%' }}>
                    <Button title='Yuborish' onPress={handleSubmit} style={styles.submitButton} icon={<Ionicons name='send-outline' size={18} color={colors.onPrimary} />} />
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
        fontSize: 24,
        fontWeight: 'bold',
        color: "#000",
        textAlign: 'center',
    },
    question: {
        fontSize: 16,
        fontWeight: '500',
        color: "#000",
        textAlign: 'center',
    },
    textArea: {
        backgroundColor: colors.surfaceContainerHigh,
        borderRadius: radii.lg,
        padding: spacing[4],
        marginTop: spacing[6],
        width: '100%',
        borderWidth: 0,
        height: 100,
        textAlignVertical: 'top',
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