import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  return (
    <View style={{ padding: 16 }}>
      <Text>Detail for item #{id}</Text>
    </View>
  );
}
