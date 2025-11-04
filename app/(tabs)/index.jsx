import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import { PRODUCTS_URL } from "../../constants/api";

export default function HomeScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("title-asc");
  const [category, setCategory] = useState("all");     // simple filter

  useEffect(() => {
    console.log("Mount HomeScreen");
    let isActive = true;

    fetch(`${PRODUCTS_URL}?limit=100`)
      .then((res) => res.json())
      .then((data) => {
        if (!isActive) return;
        setItems(data.products || []);
        setError(null);
      })
      .catch((e) => {
        if (!isActive) return;
        setError(e.message);
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
      console.log("Unmount HomeScreen");
    };
  }, []);

  // unique categories for filter UI
  const categories = useMemo(() => {
    const set = new Set(items.map((p) => p.category));
    return ["all", ...Array.from(set)];
  }, [items]);

  // search + filter + sort pipeline
  const visible = useMemo(() => {
    let data = items;

    // search
    const q = query.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // filter
    if (category !== "all") {
      data = data.filter((p) => p.category === category);
    }

    // sort
    const sorted = [...data];
    if (sortKey === "title-asc") sorted.sort((a, b) => a.title.localeCompare(b.title));
    if (sortKey === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sortKey === "price-desc") sorted.sort((a, b) => b.price - a.price);

    return sorted;
  }, [items, query, sortKey, category]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Error: {error}</Text>
        <Pressable onPress={() => { setLoading(true); setError(null); /* quick retry */ 
          fetch(`${PRODUCTS_URL}?limit=100`)
            .then(r=>r.json()).then(d=>{ setItems(d.products||[]); setLoading(false); })
            .catch(e=>{ setError(e.message); setLoading(false);});
        }}>
          <Text style={{ textDecorationLine: "underline", marginTop: 8 }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (visible.length === 0) {
    return (
      <View style={styles.container}>
        <Controls
          query={query} setQuery={setQuery}
          sortKey={sortKey} setSortKey={setSortKey}
          category={category} setCategory={setCategory}
          categories={categories}
        />
        <Text>No results.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Controls
        query={query} setQuery={setQuery}
        sortKey={sortKey} setSortKey={setSortKey}
        category={category} setCategory={setCategory}
        categories={categories}
      />

      <FlashList
        data={visible}
        estimatedItemSize={84}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Link href={`/details/${item.id}`} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text numberOfLines={2} style={styles.desc}>{item.description}</Text>
              <Text style={styles.meta}>€ {item.price} · {item.category}</Text>
            </Pressable>
          </Link>
        )}
        ListFooterComponent={<View style={{ height: 24 }} />}
      />
    </View>
  );
}

function Controls({ query, setQuery, sortKey, setSortKey, category, setCategory, categories }) {
  return (
    <View style={{ gap: 8, marginBottom: 12 }}>
      <TextInput
        placeholder="Search…"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      <View style={styles.row}>
        <Pressable
          onPress={() => setSortKey("title-asc")}
          style={[styles.chip, sortKey === "title-asc" && styles.chipActive]}
        >
          <Text>Title A→Z</Text>
        </Pressable>
        <Pressable
          onPress={() => setSortKey("price-asc")}
          style={[styles.chip, sortKey === "price-asc" && styles.chipActive]}
        >
          <Text>Price ↑</Text>
        </Pressable>
        <Pressable
          onPress={() => setSortKey("price-desc")}
          style={[styles.chip, sortKey === "price-desc" && styles.chipActive]}
        >
          <Text>Price ↓</Text>
        </Pressable>
      </View>

      <View style={styles.rowWrap}>
        {categories.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.filter, category === c && styles.filterActive]}
          >
            <Text>{c}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8 },
  row: { flexDirection: "row", gap: 8 },
  rowWrap: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: "#ccc" },
  chipActive: { backgroundColor: "#e6f0ff", borderColor: "#80aaff" },
  filter: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: "#ccc" },
  filterActive: { backgroundColor: "#e6ffe6", borderColor: "#7acc7a" },
  card: { padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 12, marginBottom: 8 },
  title: { fontWeight: "bold", marginBottom: 4 },
  desc: { color: "#555" },
  meta: { marginTop: 6, color: "#333" },
});
