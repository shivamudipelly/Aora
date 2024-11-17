import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter

const ScheduleCard = ({ item, handleAttendance, buttonDisabled }) => {
    const [isAttendanceTaken, setIsAttendanceTaken] = useState(false); // State to track if attendance has been taken
    const router = useRouter(); // Initialize router

    const handleTakeAttendance = () => {
        // Navigate to the attendance page and pass the necessary parameters
        router.push({
            pathname: '/takeAttendance',
            params: { id: item.id, subject: item.subject, section: item["branch_section"] }
        });
    };

    const capitalizeFirstLetter = (str) => {
        if (!str) return str; // Check for an empty string
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <View className="border border-red-500 m-5 p-4 rounded-lg shadow-lg bg-[#161622]">
            <Text className="text-[25px] text-center font-pbold text-white  mb-[10px]">{item.subject.charAt(0).toUpperCase() + item.subject.slice(1)}</Text>
            <Text className="text-md text-gray-300 mb-2">
                Section: {item["branch_section"].slice(0, -1).toUpperCase() + ' - '+ item["branch_section"].slice(-1).toUpperCase()}
            </Text>
            {/* <Text className="text-sm text-gray-400 mb-1">
                Time: {item.startTime} - {item.endTime}
            </Text>
            <Text className="text-sm text-gray-400 mb-1">
                Room: {item.room}
            </Text> */}
            <Text className="text-sm text-gray-400 mb-4">
                Day: {capitalizeFirstLetter(item.day)}
            </Text>


            <TouchableOpacity
                className={`py-2 px-4 rounded-lg transition-all duration-300 ${buttonDisabled || isAttendanceTaken ? 'bg-gray-700' : 'bg-green-600 hover:bg-green-700'}`}
                onPress={handleTakeAttendance}
                disabled={buttonDisabled || isAttendanceTaken}
            >
                <Text className="text-white text-[17px] font-semibold text-center">
                    {buttonDisabled || isAttendanceTaken ? 'Attendance Taken' : 'Take Attendance'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default ScheduleCard;
