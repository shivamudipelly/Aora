import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import ScheduleCard from '../../components/ScheduleCard';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import { getAllFaculties } from '../../lib/class';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import plus from "../../assets/icons/plus.png";
import { useFocusEffect } from '@react-navigation/native'; // For React Navigation (or expo-router as shown below)

// Function to get the current day of the week
export const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()]; // Get current day name
};

// Function to fetch attendance data from AsyncStorage
const fetchAttendance = async (section, subject) => {
    try {
        const today = new Date().toDateString(); // Get today's date
        const key = `attendance_${section}_${subject}_lastDate`; // Unique key based on section and subject
        const savedDate = await AsyncStorage.getItem(key);
        return today === savedDate; // Return true if today's date matches the saved date

    } catch (error) {
        console.error('Error saving/fetching attendance data:', error);
        return false;
    }
};

const Home = () => {
    const user = null; // Replace with actual user data when available
    const [scheduleData, setScheduleData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch schedule data and filter by the current day
    const fetchScheduleData = async () => {
        setLoading(true);
        setRefreshing(true);

        try {
            const fetchedData = await getAllFaculties();
            const currentDay = getCurrentDay(); // Get the current day of the week

            // Filter schedule data for the current day
            const filteredData = fetchedData.filter(
                item => item.day.toLowerCase() === currentDay.toLowerCase()
            );

            // Iterate over each schedule item and check if attendance has been taken
            const updatedData = await Promise.all(filteredData.map(async (item) => {
                const isAttendanceTaken = await fetchAttendance(item["branch_section"], item.subject);
                return {
                    ...item,
                    attendanceTaken: isAttendanceTaken // Set attendance status for this item
                };
            }));

            // Set the updated schedule data with attendance statuses
            setScheduleData(updatedData);
        } catch (error) {
            console.error('Error fetching schedule data:', error);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    // Re-fetch schedule data when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            fetchScheduleData();
        }, [])
    );

    useEffect(() => {
        fetchScheduleData(); // Initial fetch when the component is first mounted
    }, []);

    const RenderScheduleCard = ({ item }) => (
        <ScheduleCard
            item={item}
            handleAttendance={() => fetchAttendance(item.section, item.subject)}
            buttonDisabled={item.attendanceTaken}
        />
    );

    const Header = () => (
        <View className="pt-4 flex-row justify-between items-center">
            <View>
                <Text className="text-gray-200">Welcome Back</Text>
                <Text className="font-black text-secondary text-2xl">{user ? user.username : 'User'}!</Text>
            </View>
            <Image
                source={images.logoSmall}
                className="w-10 h-10"
                resizeMode="contain"
            />
        </View>
    );

    if (loading) {
        return <Loader />; // Display loader while fetching data
    }

    return (
        <SafeAreaView className="flex-1 relative bg-primary">
            <FlatList
                data={scheduleData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <RenderScheduleCard item={item} />}
                ListHeaderComponent={() => (
                    <View className="px-4">
                        <Header />
                        <Text className="text-2xl font-semibold text-white pt-5">Today's Schedule</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <EmptyState
                        title="No Classes Scheduled"
                        subtitle="You don't have any classes scheduled for today."
                        button={false}
                    />
                )}
                onRefresh={fetchScheduleData}
                refreshing={refreshing}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
            />

            {/* Floating Action Button (FAB) */}
            <View className="absolute bottom-[70px] right-[20px] rounded-full justify-center items-center shadow-lg z-50">
                <TouchableOpacity onPress={() => router.push("/schedule")}>
                    <Image
                        source={plus}
                        resizeMode="contain"
                        className="w-[45px] h-[45px] text-white"
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Home;
