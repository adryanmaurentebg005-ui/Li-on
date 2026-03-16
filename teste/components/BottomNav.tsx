import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname, Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NavItem = {
  id: string;
  label: string;
  href: Href;
  iconName: keyof typeof Ionicons.glyphMap;
};

const items: NavItem[] = [
  { id: "dashboard", label: "Inicio", href: "/", iconName: "home-outline" },
  { id: "children", label: "Filhos", href: "/filhas", iconName: "people-outline" },
  { id: "apps", label: "Apps", href: "/aplicacoes", iconName: "grid-outline" },
  { id: "reports", label: "Relatorios", href: "/relatorios", iconName: "bar-chart-outline" },
  { id: "profile", label: "Perfil", href: "/perfil", iconName: "person-outline" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 1) }]}>
      <View style={styles.container}>
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.id} href={item.href} asChild>
              <Pressable style={styles.item}>
                <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                  <Ionicons
                    name={item.iconName}
                    size={21}
                    color={isActive ? "#5856d6" : "#8e8e93"}
                  />
                </View>

                <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingTop: 5,
  },
  container: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 0,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 6,
    gap: 3,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconBoxActive: {
    backgroundColor: "#e8eaff",
  },
  label: {
    fontSize: 10,
    fontWeight: "400",
    color: "#8e8e93",
    letterSpacing: 0.1,
  },
  labelActive: {
    color: "#5856d6",
    fontWeight: "600",
  },
});