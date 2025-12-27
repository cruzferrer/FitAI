import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";

const { width } = Dimensions.get("window");

type TabType = "Summary" | "History" | "How to" | "Leaderboard";

const ExerciseMetricsScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, name, gifUrl } = params;

  const [activeTab, setActiveTab] = useState<TabType>("How to");

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primaryText} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{name || "Exercise Details"}</Text>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color={COLORS.primaryText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color={COLORS.primaryText} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {(["How to", "History", "Summary", "Leaderboard"] as TabType[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHowTo = () => {
    const imageSource = gifUrl
      ? { uri: gifUrl as string }
      : require("../../assets/images/icon.png"); // Fallback placeholder if you have one, or handle empty

    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Large Image Area - 70% of screen height roughly, or just large */}
        <View style={styles.imageContainer}>
          {gifUrl ? (
            <Image
              source={{ uri: gifUrl as string }}
              style={styles.exerciseImage}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.exerciseImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.inputBackground }]}>
              <MaterialCommunityIcons name="image-off-outline" size={50} color={COLORS.secondaryText} />
              <Text style={{ color: COLORS.secondaryText, marginTop: 10 }}>No image available</Text>
            </View>
          )}

        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>{name}</Text>
          {/* Placeholder instructions - in a real app these would come from the DB */}
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>1.</Text>
            <Text style={styles.stepText}>
              Prepare for the exercise by setting up the equipment.
            </Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>2.</Text>
            <Text style={styles.stepText}>
              Execute the movement with controlled form.
            </Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>3.</Text>
            <Text style={styles.stepText}>
              Return to the starting position and repeat.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderSummary = () => (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>102 kg <Text style={{ color: COLORS.accent, fontSize: 16 }}>Dec 18</Text></Text>
        <View style={styles.mockChart}>
          {/* Simple visual representation of a chart */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 150, paddingHorizontal: 10 }}>
            {[40, 60, 45, 80, 50, 90, 60, 100, 70, 85, 60, 95].map((h, i) => (
              <View key={i} style={{ width: 8, height: `${h}%`, backgroundColor: COLORS.accent, borderRadius: 4 }} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Text style={styles.chartLabel}>Sep 20</Text>
            <Text style={styles.chartLabel}>Oct 8</Text>
            <Text style={styles.chartLabel}>Oct 22</Text>
            <Text style={styles.chartLabel}>Nov 11</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <TouchableOpacity style={[styles.statButton, { backgroundColor: COLORS.accent }]}>
          <Text style={[styles.statButtonText, { color: COLORS.background }]}>Heaviest Weight</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statButton}>
          <Text style={styles.statButtonText}>One Rep Max</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recordsContainer}>
        <View style={styles.recordItem}>
          <Text style={styles.recordLabel}>Heaviest Weight</Text>
          <Text style={styles.recordValue}>115kg</Text>
        </View>
        <View style={styles.recordItem}>
          <Text style={styles.recordLabel}>Best 1RM</Text>
          <Text style={styles.recordValue}>115kg</Text>
        </View>
        <View style={styles.recordItem}>
          <Text style={styles.recordLabel}>Best Set Volume</Text>
          <Text style={styles.recordValue}>74.8kg x 9</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderHistory = () => (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      {[1, 2].map((item) => (
        <View key={item} style={styles.historyItem}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyDate}>5 Aug 2025, 12:41</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.secondaryText} />
          </View>
          <View style={styles.historyContent}>
            <View style={styles.setRow}>
              <Text style={styles.setLabel}>W</Text>
              <Text style={styles.setText}>9.07kg x 5 reps</Text>
            </View>
            <View style={styles.setRow}>
              <Text style={styles.setLabel}>W</Text>
              <Text style={styles.setText}>18.14kg x 4 reps</Text>
            </View>
            <View style={styles.setRow}>
              <Text style={styles.setLabel}>W</Text>
              <Text style={styles.setText}>27.22kg x 2 reps</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderLeaderboard = () => (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>Leaderboard - Heaviest Weight</Text>
        <MaterialCommunityIcons name="help-circle-outline" size={20} color={COLORS.secondaryText} />
      </View>

      {[
        { rank: 1, name: "You", weight: "115kg", color: COLORS.accent }

      ].map((user) => (
        <View key={user.name} style={styles.leaderboardRow}>
          <View style={[styles.rankBadge, { backgroundColor: user.rank <= 3 ? user.color : 'transparent' }]}>
            <Text style={[styles.rankText, { color: user.rank <= 3 ? COLORS.background : COLORS.primaryText }]}>{user.rank}</Text>
          </View>
          <View style={styles.userAvatar}>
            {/* Placeholder avatar */}
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userWeight}>{user.weight}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "How to":
        return renderHowTo();
      case "Summary":
        return renderSummary();
      case "History":
        return renderHistory();
      case "Leaderboard":
        return renderLeaderboard();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      {renderTabs()}
      <View style={styles.mainContent}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primaryText,
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabItem: {
    borderBottomColor: COLORS.accent,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.secondaryText,
    fontWeight: "500",
  },
  activeTabText: {
    color: COLORS.primaryText,
    fontWeight: "bold",
  },
  mainContent: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: width,
    height: width * 0.8, // Aspect ratio 4:5 or similar to be "large" but not full screen height
    backgroundColor: "#000", // Dark background for the image area
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
  },
  instructionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primaryText,
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: "row",
    marginBottom: 16,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primaryText,
    width: 24,
  },
  stepText: {
    fontSize: 16,
    color: COLORS.secondaryText,
    flex: 1,
    lineHeight: 24,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: COLORS.secondaryText,
    fontSize: 16,
  },
  // Summary Styles
  chartContainer: {
    padding: 20,
    backgroundColor: COLORS.inputBackground,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primaryText,
    marginBottom: 20,
  },
  mockChart: {
    height: 200,
    justifyContent: 'flex-end',
  },
  chartLabel: {
    color: COLORS.secondaryText,
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  statButtonText: {
    color: COLORS.secondaryText,
    fontWeight: '600',
  },
  recordsContainer: {
    paddingHorizontal: 20,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  recordLabel: {
    color: COLORS.primaryText,
    fontSize: 16,
  },
  recordValue: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // History Styles
  historyItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  historyDate: {
    color: COLORS.secondaryText,
    fontSize: 14,
  },
  historyContent: {
    gap: 10,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  setLabel: {
    color: COLORS.accent,
    fontWeight: 'bold',
    width: 20,
  },
  setText: {
    color: COLORS.primaryText,
    fontSize: 16,
  },
  // Leaderboard Styles
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  leaderboardTitle: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.separator,
    marginRight: 15,
  },
  userName: {
    flex: 1,
    color: COLORS.primaryText,
    fontSize: 16,
  },
  userWeight: {
    color: COLORS.secondaryText,
    fontSize: 14,
  },
});

export default ExerciseMetricsScreen;
