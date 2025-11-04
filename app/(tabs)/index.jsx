import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text>Home — List will appear here (FlashList + search/sort/filter).</Text>
      <Link href="/details/1">Go to detail example</Link>
    </View>
  );
}
