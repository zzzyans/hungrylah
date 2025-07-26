import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import ScreenHeader from "../../../components/ScreenHeader";
import { colourPalette } from "../../../constants/Colors";

const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = React.useState(false); 

  return (
    <View style={faqStyles.itemContainer}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={faqStyles.questionButton}>
        <Text style={faqStyles.questionText}>{question}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={wp(5)}
          color={colourPalette.textDark}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={faqStyles.answerContainer}>
          <Text style={faqStyles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

const faqStyles = StyleSheet.create({
  itemContainer: {
    backgroundColor: colourPalette.white,
    borderRadius: wp(3),
    marginBottom: hp(2),
    overflow: 'hidden', 
    elevation: 2,
  },
  questionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
  },
  questionText: {
    fontSize: hp(2),
    fontWeight: 'bold',
    color: colourPalette.textDark,
    flexShrink: 1,
    paddingRight: wp(2), 
  },
  answerContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: colourPalette.lightMint, 
  },
  answerText: {
    fontSize: hp(1.8),
    color: colourPalette.textMedium,
    lineHeight: hp(2.5),
  },
});


export default function HelpSupportScreen() {
  const router = useRouter();

  // FAQ data
  const faqData = [
    {
      question: "How do recommendations work?",
      answer: "HungryLah recommends restaurants based on your selected 'Taste Preferences' (cuisines and price range). We're working on advanced machine learning to provide even more personalized suggestions based on your activity!",
    },
    {
      question: "How do I save a restaurant?",
      answer: "On the 'Explore' screen, simply tap the 'Save This Place' button on any restaurant card or swipe right. It will then appear on your 'Favourites' tab.",
    },
    {
      question: "Where can I see my saved restaurants?",
      answer: "All your saved restaurants can be found on the 'Favourites' tab in the bottom navigation bar.",
    },
    {
      question: "How do I write a review?",
      answer: "Go to your 'Favourites' tab, select a restaurant you've saved, and tap the 'Write Review' button. You can give a star rating and leave a comment.",
    },
    {
      question: "How do I change my profile picture?",
      answer: "Go to your 'Profile' tab and tap on your current profile picture (or the placeholder icon). You'll be prompted to select a new image from your gallery.",
    },
    {
      question: "My password change failed. What should I do?",
      answer: "For security, changing your password often requires recent authentication. If you encounter an error, try logging out, logging back in, and then attempt to change your password again. If issues persist, contact support.",
    },
    {
      question: "Why are some reviews 'Unknown Restaurant'?",
      answer: "This happens if the restaurant data for that particular review couldn't be loaded or isn't in our current database. We are continually expanding our restaurant data.",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Help & Support" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.descriptionText}>
          Find answers to common questions about HungryLah.
        </Text>

        {faqData.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}

        <Text style={styles.contactPrompt}>
          Can't find what you're looking for?
        </Text>
        <TouchableOpacity style={styles.emailButton} onPress={() => Linking.openURL('mailto:support@hungrylah.com?subject=HungryLah Support Request')}>
          <Text style={styles.emailButtonText}>Email Support</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colourPalette.lightYellow },
  container: { padding: wp(5) },
  descriptionText: {
    fontSize: hp(2),
    color: colourPalette.textMedium,
    textAlign: 'center',
    marginBottom: hp(3),
  },
  contactPrompt: {
    fontSize: hp(2),
    color: colourPalette.textDark,
    textAlign: 'center',
    marginTop: hp(4),
    marginBottom: hp(1.5),
  },
  emailButton: {
    backgroundColor: colourPalette.lightBlue,
    padding: hp(1.8),
    borderRadius: wp(3),
    alignItems: 'center',
  },
  emailButtonText: {
    color: colourPalette.white,
    fontSize: hp(2.2),
    fontWeight: 'bold',
  },
});