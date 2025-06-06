// Profile.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList, Image, TouchableOpacity, View } from 'react-native';
import { icons } from "../../constants";
import EmptyState from "../../components/EmptyState";
import InfoBox from '../../components/InfoBox';
import { getAllFaculties } from '../../lib/class';
import ProfileCard from '../../components/ProfileCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
  const [totalClasses, setTotalClasses] = useState([]);
  const [dropdownIndex, setDropdownIndex] = useState(null);  // To track the index of the currently open dropdown

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const data = await getAllFaculties();
        const uniqueData = Array.from(
          new Map(data.map(item => [
            `${item.branch_section}_${item.subject}`, item
          ])).values()
        );
        setTotalClasses(uniqueData);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchAttendanceData();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      // Redirect to login screen, assuming you're using navigation
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDropdownToggle = (index) => {
    setDropdownIndex(dropdownIndex === index ? null : index);  // Toggle dropdown visibility
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="w-full flex justify-center items-center px-4 pt-[30px]">
        {/* Logout Button */}
        <TouchableOpacity onPress={logout} className="flex w-full items-end my-[10px]">
          <Image source={icons.logout} resizeMode="contain" className="w-6 h-6" />
        </TouchableOpacity>

        {/* Profile Picture */}
        <View className="w-[100px] h-[100px] border border-secondary rounded-full flex justify-center items-center overflow-hidden">
          <Image source={icons.profile} className="w-full h-full" resizeMode="cover" />
        </View>

        {/* InfoBox - User */}
        <InfoBox
          title="User"
          containerStyles="mt-5"
          titleStyles="text-lg text-white"
        />

        {/* Total Classes InfoBox */}
        <View className="mt-[10px] flex flex-row justify-center">
          <InfoBox
            title={totalClasses.length || 0}
            subtitle="Total Classes"
            titleStyles="text-xl text-white"
          />
        </View>
      </View>

      {/* FlatList for Classes */}
      <View className="flex-1 w-full flex justify-center items-center px-4 pt-[30px]">
        <FlatList
          data={totalClasses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <ProfileCard
              title={item.subject}
              subtitle={item["branch_section"]}
              id={item.id}
              isDropdownOpen={dropdownIndex === index}  // Check if dropdown for this item is open
              onDropdownToggle={() => handleDropdownToggle(index)}  // Toggle dropdown for this item
            />
          )}
          ListEmptyComponent={() => (
            <EmptyState
              title="No Attendance Records"
              subtitle="You have not attended any classes yet."
            />
          )}
        />
      </View>

    </SafeAreaView>
  );
};

export default Profile;
