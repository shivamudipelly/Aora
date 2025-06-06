import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Image, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';

const ProfileCard = ({ title, subtitle, id, isDropdownOpen, onDropdownToggle }) => {
  const [dropdownAnimation] = useState(new Animated.Value(0));  // For the dropdown animation
  const router = useRouter();
  const image = [
    require("../assets/images/classroom.png"),
    require("../assets/images/classroom1.png"),
    require("../assets/images/classroom2.png"),
    require("../assets/images/classroom3.png"),
  ];

  // Animation to show or hide the dropdown
  useEffect(() => {
    Animated.timing(dropdownAnimation, {
      toValue: isDropdownOpen ? 1 : 0,  // Slide up when true, slide down when false
      duration: 300, // Adjust the speed here
      useNativeDriver: true,
    }).start();
  }, [isDropdownOpen]);

  // Handle Edit, Delete, and Update actions
  const handleEdit = () => {
    console.log(id, title, subtitle, "Edit Pressed");
    router.push({
      pathname: '/editSchedule',
      params: { id: id, subject: title, section: subtitle }
  });
  };

  const handleDelete = () => {
    console.log("Delete Pressed");
  };

  const handleUpdate = () => {
    console.log("Update Pressed");
  };

  return (
    <TouchableWithoutFeedback onPress={() => onDropdownToggle(false)}>

      <View className="relative bg-[#26394D] w-[300px] h-[100px] my-5 mx-2 rounded-lg flex-row items-center px-5">
        <Image
          source={image[id % image.length]} // Cycle through images
          resizeMode="contain"
          className="w-[70px] h-[70px]"
        />

        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-[24px] font-black">{title}</Text>
          <Text className="text-gray-300 mt-2 font-semibold">{subtitle}</Text>
        </View>

        {/* Animated dropdown options */}
        <Animated.View
          style={{
            opacity: dropdownAnimation,
            zIndex: 999,  // Ensure it's above other content
            transform: [{
              translateY: dropdownAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 10], // Adjust the dropdown's movement
              }),
            }],
          }}
          className="absolute left-0 w-[250px] bg-[#26394D] rounded-lg shadow-lg mt-[100px]" // Adjust top margin to position the dropdown
        >
          {isDropdownOpen && (
            <>
              <TouchableOpacity
                onPress={handleEdit}
                className="bg-slate-700 py-3 mb-1 rounded-t-lg"
              >
                <Text className="text-white text-center font-semibold">Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                className="bg-slate-700 py-3 mb-1"
              >
                <Text className="text-white text-center font-semibold">Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdate}
                className="bg-slate-700 py-3 mb-1 rounded-b-lg"
              >
                <Text className="text-white text-center font-semibold">Update</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>

    </TouchableWithoutFeedback>
  );
};

export default ProfileCard;
