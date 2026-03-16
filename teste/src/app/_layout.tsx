import { View, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import BottomNav from "../../components/BottomNav";

export default function Layout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});