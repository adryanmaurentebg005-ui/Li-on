import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import {
	getUsageStats,
	hasUsageStatsPermission,
	openUsageAccessSettings,
	UsageStatItem,
} from "../native/usageStats";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function formatDuration(ms: number) {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	return `${hours}h ${minutes}min`;
}

export default function RelatoriosScreen() {
	const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [stats, setStats] = useState<UsageStatItem[]>([]);
	const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(false);

	const loadPermission = useCallback(async () => {
		try {
			const granted = await hasUsageStatsPermission();
			setPermissionGranted(granted);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Nao foi possivel verificar permissao.");
		}
	}, []);

	const loadUsage = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const end = Date.now();
			const start = end - ONE_DAY_MS;
			const data = await getUsageStats(start, end);
			setStats(data);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Falha ao buscar estatisticas.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadPermission();
	}, [loadPermission]);

	useEffect(() => {
		if (permissionGranted && autoRefreshEnabled) {
			loadUsage();
			const interval = setInterval(loadUsage, 10000);
			return () => clearInterval(interval);
		}
	}, [permissionGranted, autoRefreshEnabled, loadUsage]);

	const topFive = useMemo(() => stats.slice(0, 5), [stats]);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<Text style={styles.title}>Relatorios de Uso</Text>
				<Text style={styles.subtitle}>Ultimas 24 horas via UsageStatsManager</Text>

				{!permissionGranted ? (
					<View style={styles.card}>
						<Text style={styles.cardTitle}>Permissao necessaria</Text>
						<Text style={styles.cardText}>
							Ative "Acesso ao uso" para permitir a leitura de tempo de uso dos aplicativos.
						</Text>
						<Pressable style={styles.primaryButton} onPress={openUsageAccessSettings}>
							<Text style={styles.primaryButtonText}>Abrir configuracoes</Text>
						</Pressable>
						<Pressable style={styles.secondaryButton} onPress={loadPermission}>
							<Text style={styles.secondaryButtonText}>Ja ativei, verificar novamente</Text>
						</Pressable>
					</View>
				) : (
					<View style={styles.card}>
						<Text style={styles.cardTitle}>Acesso liberado</Text>
						<Pressable style={styles.primaryButton} onPress={loadUsage}>
							<Text style={styles.primaryButtonText}>Carregar estatisticas</Text>
						</Pressable>
						<Pressable
							style={[styles.secondaryButton, autoRefreshEnabled && styles.secondaryButtonActive]}
							onPress={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
						>
							<Text style={[styles.secondaryButtonText, autoRefreshEnabled && styles.secondaryButtonTextActive]}>
								{autoRefreshEnabled ? "⏸ Auto-atualizar (10s)" : "▶ Auto-atualizar (10s)"}
							</Text>
						</Pressable>
					</View>
				)}

				{loading && <ActivityIndicator size="large" color="#2a6fdb" style={styles.loader} />}

				{!!error && <Text style={styles.error}>{error}</Text>}

				<FlatList
					data={topFive}
					keyExtractor={(item) => item.packageName}
					contentContainerStyle={styles.list}
					ListEmptyComponent={
						!loading ? (
							<Text style={styles.emptyText}>Sem dados ainda. Carregue as estatisticas.</Text>
						) : null
					}
					renderItem={({ item, index }) => (
						<View style={styles.row}>
							<Text style={styles.rank}>#{index + 1}</Text>
							<View style={styles.info}>
								<Text style={styles.packageName}>{item.appName}</Text>
								<Text style={styles.duration}>{formatDuration(item.totalTimeInForeground)}</Text>
							</View>
						</View>
					)}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#f2f6fb",
	},
	container: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 12,
	},
	title: {
		fontSize: 24,
		fontWeight: "700",
		color: "#102a43",
	},
	subtitle: {
		marginTop: 4,
		marginBottom: 16,
		fontSize: 14,
		color: "#4f6d8a",
	},
	card: {
		backgroundColor: "#ffffff",
		borderRadius: 12,
		padding: 14,
		borderWidth: 1,
		borderColor: "#d9e2ec",
		marginBottom: 14,
	},
	cardTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: "#102a43",
	},
	cardText: {
		marginTop: 8,
		marginBottom: 12,
		fontSize: 14,
		color: "#486581",
	},
	primaryButton: {
		backgroundColor: "#2a6fdb",
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 12,
		alignItems: "center",
	},
	primaryButtonText: {
		color: "#ffffff",
		fontWeight: "600",
	},
	secondaryButton: {
		marginTop: 10,
		borderWidth: 1,
		borderColor: "#bcccdc",
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 12,
		alignItems: "center",
	},
	secondaryButtonText: {
		color: "#334e68",
		fontWeight: "600",
	},
	secondaryButtonActive: {
		backgroundColor: "#e8eaff",
		borderColor: "#5856d6",
	},
	secondaryButtonTextActive: {
		color: "#5856d6",
	},
	loader: {
		marginTop: 12,
		marginBottom: 6,
	},
	error: {
		color: "#ba2525",
		marginBottom: 8,
	},
	list: {
		paddingBottom: 24,
	},
	emptyText: {
		marginTop: 12,
		color: "#627d98",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#ffffff",
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#d9e2ec",
		paddingVertical: 10,
		paddingHorizontal: 12,
		marginBottom: 8,
	},
	rank: {
		width: 34,
		fontSize: 16,
		fontWeight: "700",
		color: "#2a6fdb",
	},
	info: {
		flex: 1,
	},
	packageName: {
		fontSize: 14,
		fontWeight: "600",
		color: "#102a43",
	},
	duration: {
		marginTop: 2,
		color: "#486581",
	},
});
