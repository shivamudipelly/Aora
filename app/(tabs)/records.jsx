import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllFaculties } from '../../lib/class'; // Fetch dynamic data
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // For adding icons

const Records = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [refreshing, setRefreshing] = useState(false); // Refresh state

  const fetchData = async () => {
    try {
      const facultyData = await getAllFaculties(); // Fetch faculty data
      setFaculty(facultyData);
    } catch (error) {
      console.error('Error fetching data:', error); // Handle error
    } finally {
      setLoading(false); // Data fetching completed
      setRefreshing(false); // End refreshing
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data on component mount
  }, []);

  const onRefresh = () => {
    setRefreshing(true); // Show loading spinner
    fetchData(); // Fetch the latest data
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#161622] justify-center items-center">
        <Text className="text-lg text-white">Loading data...</Text>
      </SafeAreaView>
    );
  }

  // Extract unique sections from faculty data
  const uniqueSections = Array.from(new Set(faculty.map(f => f.branch_section)));

  return (
    <SafeAreaView className="flex-1 bg-[#161622] px-4">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {uniqueSections.length > 0 ? (
          <View className="pt-[20px] px-[10px] gap-[10px]">
            {uniqueSections.map((section) => {
              // Find the faculty member for the current section
              const facultyForSection = faculty.find(f => f.branch_section === section);

              // Check if facultyForSection is defined to prevent errors when no match is found
              if (!facultyForSection) return null;

              return (
                <View
                  key={facultyForSection.id}
                  className="p-6 mb-6 bg-black rounded-[25px] z-10 shadow-xl shadow-white shadow-offset-0 shadow-opacity-50 shadow-radius-[25px] elevation-10"
                >
                  <Text className="text-xl font-bold  text-center text-secondary-100 mb-3"> {facultyForSection.branch_section.slice(0,-1).toUpperCase()+' - '+facultyForSection.branch_section.slice(-1).toUpperCase()}</Text>
                  <View className="flex-row mb-[15px]">
                    <Text className="text-md text-gray-300 ">Subject:{"   "}</Text><Text className="text-md text-gray-300">{facultyForSection.subject[0].toUpperCase() + facultyForSection.subject.slice(1)}</Text>
                  </View>
                  {/* Navigation to "View Attendance" page with parameters */}
                  <TouchableOpacity
                    className="bg-teal-800 p-[10px] rounded-[10px] flex flex-row items-center justify-center"
                    onPress={() => {
                      router.navigate({ pathname: "/viewAttendance", params: { ...facultyForSection } });
                    }}
                  >
                    <View className="mr-[10px]">
                      <Ionicons name="eye-outline" size={20} color="#fff"  />
                    </View>
                    <Text className="text-white font-bold text-center">View Attendance</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="flex h-[91.6vh] justify-center items-center">
            <Text className="text-gray-400 font-psemibold text-[25px]">No sections found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Records;
