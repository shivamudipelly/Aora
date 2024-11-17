import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, FlatList, TouchableOpacity, Text } from "react-native";
import { icons } from "../../constants";
import EmptyState from "../../components/EmptyState";
import InfoBox from '../../components/InfoBox';


const Profile = () => {

  const [attendanceData, setAttendanceData] = useState([]);

  // Temporarily disable attendance data fetching
  useEffect(() => {

    const fetchAttendanceData = async () => {
      //logic for fectjing the attendance
    };

    fetchAttendanceData();
  }, []);


  const logout = async () => {
    //logic for logout using backend
  };

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="w-full flex justify-center items-center  px-4 ">
        <TouchableOpacity onPress={logout} className="flex w-full items-end my-[10px]">
          <Image source={icons.logout} resizeMode="contain" className="w-6 h-6" />
        </TouchableOpacity>


        <View className="w-[100px] h-[100px] border border-secondary rounded-full flex justify-center items-center overflow-hidden">
          <Image source={icons.profile} className="w-full h-full" resizeMode="cover" />
        </View>


        <InfoBox
          title="User"
          containerStyles="mt-5"
          titleStyles="text-lg text-white"
        />


        <View className="mt-[10px] flex flex-row justify-center">
          <InfoBox
            title={attendanceData.length || 0} // Total classes attended
            subtitle="Classes Attended"
            titleStyles="text-xl text-white"
            containerStyles="mr-10"
          />
          <InfoBox
            title="5" // Placeholder for total classes
            subtitle="Total Classes"
            titleStyles="text-xl text-white"
          />
        </View>


        <FlatList
          data={attendanceData}
          keyExtractor={(item) => item.id.toString()} // Ensure ID is a string
          renderItem={({ item }) => (
            <View className="flex-row justify-between w-full p-4 border-b border-gray-600">
              <Text className="text-white">{item.className}</Text>
              <Text className="text-gray-400">{item.date}</Text>
            </View>
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
