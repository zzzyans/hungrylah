// app/preferences/dietary.jsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import SelectableItem from "../../components/SelectableItem";
import { colourPalette } from "../../constants/Colors";
import { DIETARY_OPTIONS } from "../../constants/Preferences";
import { useAuth } from "../../context/authContext";
import PreferencesService from "../../services/PreferencesService";

export default function OnboardDietary() {
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
      if (res.success && res.data) setSel(res.data.dietaryRestrictions);
      setFetching(false);
    })();
  }, [service]);

  const toggle = (id) =>
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const next = async () => {
    if (!service) return;
    setLoading(true);
    await service.savePreferences({ dietaryRestrictions: sel });
    setLoading(false);
    router.replace("onboarding/price");
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
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={hp(3)} color={colourPalette.textDark} />
        </TouchableOpacity>
        <Text style={styles.header}>Step 2 of 3</Text>
        <Text style={styles.title}>Dietary Restrictions</Text>
        <View style={styles.items}>
          {DIETARY_OPTIONS.map((d) => (
            <SelectableItem
              key={d.id}
              label={d.label}
              isSelected={sel.includes(d.id)}
              onPress={() => toggle(d.id)}
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
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colourPalette.lightYellow,
  },
  back: {
    padding: wp(1),
    marginBottom: hp(1),
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