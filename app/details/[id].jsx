import { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { PRODUCT_DETAIL } from "../../constants/api";

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Mount Detail", id);
    let active = true;
    fetch(PRODUCT_DETAIL(id))
      .then((r) => r.json())
      .then((d) => { if (!active) return; setItem(d); setError(null); })
      .catch((e) => { if (!active) return; setError(e.message); })
      .finally(() => { if (!active) return; setLoading(false); });
    return () => { active = false; console.log("Unmount Detail", id); };
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator /><Text>Loading…</Text></View>;
  if (error) return <View style={styles.center}><Text style={{ color:"red" }}>Error: {error}</Text></View>;
  if (!item) return <View style={styles.center}><Text>No data.</Text></View>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {item?.images?.[0] ? (
        <Image source={{ uri: item.images[0] }} style={{ width: "100%", height: 220, borderRadius: 12 }} />
      ) : null}
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.description}</Text>
      <Text style={styles.meta}>€ {item.price} · ⭐ {item.rating} · {item.category}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex:1, alignItems:"center", justifyContent:"center", gap:8 },
  title: { fontSize: 20, fontWeight: "bold" },
  meta: { marginTop: 6, color: "#333" },
});
