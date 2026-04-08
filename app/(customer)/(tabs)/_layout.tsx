import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { t } from '../../../i18n';
import { colors, fonts } from '../../../lib/theme';

type TabIcon = React.ComponentProps<typeof Ionicons>['name'];

const TAB_LIST: { name: string; title: string; icon: TabIcon; iconFocused: TabIcon }[] = [
	{ name: 'index', title: 'tab.home', icon: 'home-outline', iconFocused: 'home' },
	{
		name: 'orders',
		title: 'tab.orders',
		icon: 'document-text-outline',
		iconFocused: 'document-text',
	},
	{ name: 'profile', title: 'tab.profile', icon: 'person-outline', iconFocused: 'person' },
];

export default function CustomerTabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: styles.tabBar,
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.onSurfaceMuted,
				tabBarLabelStyle: styles.tabLabel,
			}}
		>
			{TAB_LIST.map(tab => (
				<Tabs.Screen
					key={tab.name}
					name={tab.name}
					options={{
						title: t(tab.title),
						tabBarIcon: ({ focused, color }) => (
							<Ionicons name={focused ? tab.iconFocused : tab.icon} size={24} color={color} />
						),
					}}
				/>
			))}
		</Tabs>
	);
}

const styles = StyleSheet.create({
	tabBar: {
		backgroundColor: colors.surfaceContainerLowest,
		borderTopWidth: 0,
		height: Platform.OS === 'ios' ? 88 : 64,
		paddingTop: 8,
		...Platform.select({
			ios: {
				shadowColor: colors.onSurface,
				shadowOffset: { width: 0, height: -4 },
				shadowOpacity: 0.04,
				shadowRadius: 12,
			},
			android: {
				elevation: 8,
			},
		}),
	},
	tabLabel: {
		fontFamily: fonts.medium,
		fontSize: 11,
		marginTop: 2,
	},
});
