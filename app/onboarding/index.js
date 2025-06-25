// app/preferences/index.jsx
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import SelectableItem from "../../components/SelectableItem";
import { colourPalette } from "../../constants/Colors";
import { CUISINE_OPTIONS } from "../../constants/Preferences";
import { useAuth } from "../../context/authContext";
import PreferencesService from "../../services/PreferencesService";

export default function OnboardCuisines() {
  const router = useRouter();
  const { user } = useAuth();
  const service = useMemo(
    () => (user?.uid ? new PreferencesService(user.uid) : null),
    [user]
  );
  const [sel, setSel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      if (!service) return setFetching(false);
      const res = await service.fetchPreferences();
      if (res.success && res.data) setSel(res.data.cuisines);
      setFetching(false);
    })();
  }, [service]);

  const toggle = (id) =>
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const next = async () => {
    if (!service) return;
    if (sel.length === 0) {
      Alert.alert("Pick at least one cuisine");
      return;
    }
    setLoading(true);
    const res = await service.savePreferences({ cuisines: sel });
    setLoading(false);
    if (!res.success) {
      Alert.alert("Error", "Couldn't save. Try again.");
    } else {
      router.replace("onboarding/dietary");
    }
  };

  if (fetching) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colourPalette.lightBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Step 1 of 3</Text>
        <Text style={styles.title}>Favourite Cuisines</Text>
        <View style={styles.items}>
          {CUISINE_OPTIONS.map((c) => (
            <SelectableItem
              key={c.id}
              label={c.label}
              isSelected={sel.includes(c.id)}
              onPress={() => toggle(c.id)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextBtn}
          onPress={next}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colourPalette.white} />
          ) : (
            <Text style={styles.nextTxt}>Next</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colourPalette.lightYellow },
  container: {
    padding: wp(5),
    paddingTop: hp(4),
    paddingBottom: hp(2),
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colourPalette.lightYellow,
  },
  header: {
    fontSize: hp(2.5),
    fontWeight: "600",
    color: colourPalette.textDark,
    marginBottom: hp(1),
  },
  title: {
    fontSize: hp(3),
    fontWeight: "bold",
    color: colourPalette.textDark,
    marginBottom: hp(2),
  },
  items: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
  },
  nextBtn: {
    marginTop: hp(4),
    backgroundColor: colourPalette.lightBlue,
    paddingVertical: hp(1.8),
    borderRadius: wp(3),
    alignItems: "center",
  },
  nextTxt: {
    color: colourPalette.white,
    fontSize: hp(2),
    fontWeight: "600",
  },
});