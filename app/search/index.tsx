import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";
import { supabase } from "../../constants/supabaseClient";

type SearchTab = "Users" | "Workouts";

const SearchScreen: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<SearchTab>("Users");
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 0) {
                performSearch();
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, activeTab]);

    const performSearch = async () => {
        setIsLoading(true);
        try {
            let data = [];
            let error = null;

            if (activeTab === "Users") {
                // Search Users
                // Now using the standard 'profiles' table
                const response = await supabase
                    .from("profiles")
                    .select("*")
                    .ilike("username", `%${searchQuery}%`) // Searching by username
                    .limit(20);

                data = response.data || [];
                error = response.error;
            } else {
                // Search Workouts
                const response = await supabase
                    .from("ejercicios") // Correct table name from screenshot
                    .select("*")
                    .ilike("nombre", `%${searchQuery}%`)
                    .limit(20);

                data = response.data || [];
                error = response.error;
            }

            if (error) {
                console.error("Search error:", error);
            } else {
                setResults(data);
            }
        } catch (e) {
            console.error("Unexpected search error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primaryText} />
            </TouchableOpacity>
            <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color={COLORS.secondaryText} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={activeTab === "Users" ? "Search Users" : "Search Workouts"}
                    placeholderTextColor={COLORS.secondaryText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={20} color={COLORS.secondaryText} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {(["Users", "Workouts"] as SearchTab[]).map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                    onPress={() => {
                        setActiveTab(tab);
                        setResults([]); // Clear results on tab switch
                        // Optional: trigger search immediately if query exists, handled by useEffect
                    }}
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

    const renderUserItem = ({ item }: { item: any }) => (
        <View style={styles.resultItem}>
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{(item.username || item.full_name || "?")[0]?.toUpperCase()}</Text>
            </View>
            <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>{item.username || item.full_name || "Unknown User"}</Text>
                <Text style={styles.resultSubtitle}>{item.full_name || "Athlete"}</Text>
            </View>
            <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Follow</Text>
            </TouchableOpacity>
        </View>
    );

    const renderWorkoutItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {
                // Navigate to exercise metrics or workout details
                router.push({
                    pathname: "/workout/exercise-metrics",
                    params: {
                        id: item.id,
                        name: item.nombre,
                        gifUrl: item.gif_url
                    }
                });
            }}
        >
            <View style={styles.workoutIconPlaceholder}>
                <MaterialCommunityIcons name="dumbbell" size={24} color={COLORS.accent} />
            </View>
            <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>{item.nombre || "Unknown Exercise"}</Text>
                <Text style={styles.resultSubtitle}>{item.grupo_muscular || "General"}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.secondaryText} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {renderHeader()}
            {renderTabs()}

            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={activeTab === "Users" ? renderUserItem : renderWorkoutItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        searchQuery.length > 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Type to search {activeTab.toLowerCase()}...</Text>
                            </View>
                        )
                    }
                />
            )}
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
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 10,
    },
    backButton: {
        padding: 4,
    },
    searchBarContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.inputBackground,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: COLORS.primaryText,
        fontSize: 16,
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
    listContent: {
        padding: 16,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        padding: 20,
        alignItems: "center",
    },
    emptyText: {
        color: COLORS.secondaryText,
        fontSize: 16,
    },
    resultItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.separator,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.separator,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    avatarText: {
        color: COLORS.primaryText,
        fontWeight: "bold",
        fontSize: 18,
    },
    workoutIconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: COLORS.inputBackground,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    resultInfo: {
        flex: 1,
    },
    resultTitle: {
        color: COLORS.primaryText,
        fontSize: 16,
        fontWeight: "bold",
    },
    resultSubtitle: {
        color: COLORS.secondaryText,
        fontSize: 14,
    },
    actionButton: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    actionButtonText: {
        color: COLORS.background, // Assuming accent is bright/light, text should be dark. Adjust if accent is dark.
        fontWeight: "bold",
        fontSize: 12,
    },
});

export default SearchScreen;
