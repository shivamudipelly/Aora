import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useGlobalSearchParams } from 'expo-router';

import { getAllRollNumbers, markAttendance } from '../../lib/class'; // Assuming markAttendance is the method to store data
import { getCurrentDay } from '../(tabs)/home';

const CustomAlert = ({ visible, title, message, onClose, onConfirm }) => (
    <Modal transparent visible={visible} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white rounded-lg p-4 w-80">
                <Text className="text-lg font-bold">{title}</Text>
                <Text className="mt-2">{message}</Text>
                <View className="flex-row justify-between mt-4">
                    <TouchableOpacity onPress={onClose} className="bg-gray-500 p-2 rounded">
                        <Text className="text-white text-center">Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onConfirm} className="bg-blue-500 p-2 rounded">
                        <Text className="text-white text-center">Confirm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

const TakeAttendance = () => {
    const { subject, section } = useGlobalSearchParams();
    const [rollNumbers, setRollNumbers] = useState([]);
    const [attendanceStatus, setAttendanceStatus] = useState(''); // Track selected status (Present/Absent)
    const [selectedRolls, setSelectedRolls] = useState([]); // Track selected roll numbers
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchRollNumbers = async () => {
        setRefreshing(true);
        try {
            const data = await getAllRollNumbers(subject, section);
            if (Array.isArray(data)) {
                setRollNumbers(data);
            } else {
                console.error('Unexpected data format:', data);
                showAlert('Error', 'Unexpected data format received');
            }
        } catch (error) {
            console.error('Error fetching roll numbers:', error);
            showAlert('Error', 'Failed to fetch roll numbers');
        } finally {
            setRefreshing(false);
        }
    };

    const showAlert = (title, message) => {
        setModalTitle(title);
        setModalMessage(message);
        setModalVisible(true);
    };

    const handleRollClick = (rollNumber) => {
        // Toggle the selection of roll numbers
        if (selectedRolls.includes(rollNumber)) {
            setSelectedRolls((prev) => prev.filter((num) => num !== rollNumber));
        } else {
            setSelectedRolls((prev) => [...prev, rollNumber]);
        }
    };

    const handleStatusChange = (status) => {
        setAttendanceStatus(status);
        setSelectedRolls([]); // Clear selections when changing status
    };

    const handleSubmit = () => {
        if (attendanceStatus === '') {
            showAlert("Error", "Please select a status (Present/Absent).");
            return;
        }

        // Check if roll numbers have been selected
        if (selectedRolls.length === 0) {
            showAlert("Error", "No roll numbers selected.");
            return;
        }

        const message = `Marking as ${attendanceStatus}: ${selectedRolls.join(', ')}`;
        showAlert("Confirm Submission", message);
    };



    // Save attendance for a specific section, subject, and attendance taken status
    const saveAttendance = async (section, subject) => {
        console.log("Saving attendance for:", section, subject, attendanceStatus);
    
        const dayOfWeek = getCurrentDay(); // Get the current day name (e.g., 'Monday', 'Tuesday')
        console.log("Current day of week:", dayOfWeek);
    
        try {
            const today = new Date().toDateString(); // Get today's date
            const key = `attendance_${section}_${subject}_lastDate`; // Unique key based on section and subject
            await AsyncStorage.setItem(key, today); // Save the date to AsyncStorage
            console.log(`Attendance saved for ${section} - ${subject} on ${today}`);
    
            // Optionally fetch and log the saved data to verify
            const data = await AsyncStorage.getItem(key);
            console.log('Parsed Attendance Data from AsyncStorage:', key, today === data); // Log the parsed data for debugging
    
        } catch (error) {
            console.error('Error saving attendance data:', error);
        }
    };    


    const handleConfirmSubmit = async () => {
        try {
            // Validate the presence of roll numbers for submission
            if (selectedRolls.length === 0) {
                showAlert("Error", "No roll numbers selected.");
                return;
            }

            // Check attendance status and mark accordingly
            if (attendanceStatus === 'Present') {
                await markAttendance(subject, section, selectedRolls, new Date(), 'Present');

                // Mark remaining rolls as Absent
                const allRollNumbersSet = new Set(rollNumbers.map((roll) => roll.roll_number));
                const remainingRollNumbers = Array.from(allRollNumbersSet).filter(
                    (rollNumber) => !selectedRolls.includes(rollNumber)
                );

                if (remainingRollNumbers.length > 0) {
                    await markAttendance(subject, section, remainingRollNumbers, new Date(), 'Absent');
                }

            } else if (attendanceStatus === 'Absent') {
                await markAttendance(subject, section, selectedRolls, new Date(), 'Absent');

                // Mark remaining rolls as Present if needed
                const allRollNumbersSet = new Set(rollNumbers.map((roll) => roll.roll_number));
                const remainingRollNumbers = Array.from(allRollNumbersSet).filter(
                    (rollNumber) => !selectedRolls.includes(rollNumber)
                );

                // In this case, remaining students can be marked as present if needed.
                // (This part is optional and depends on your requirements. Adjust accordingly.)
                if (remainingRollNumbers.length > 0) {
                    await markAttendance(subject, section, remainingRollNumbers, new Date(), 'Present');
                }
            }

            saveAttendance(section, subject)
            // Navigate to home after successful submission
            router.navigate({ pathname: "/home" });

        } catch (error) {
            console.error("Error saving attendance:", error);
            showAlert("Error", "Failed to submit attendance.");
        } finally {
            // Clear selections and reset state after submission
            setSelectedRolls([]);
            setAttendanceStatus('');
            setModalVisible(false);
        }
    };



    const handleReset = () => {
        setSelectedRolls([]);
        setAttendanceStatus('');
        showAlert("Attendance Reset", "Attendance has been reset.");
    };

    const RenderRollItem = ({ item }) => {
        const rollNumber = item.roll_number;
        const isSelected = selectedRolls.includes(rollNumber);
        let backgroundColor;

        if (attendanceStatus === 'Present') {
            backgroundColor = isSelected ? 'bg-green-500' : 'bg-gray-700'; // Selected: Green, Unselected: Gray
        } else if (attendanceStatus === 'Absent') {
            backgroundColor = isSelected ? 'bg-red-500' : 'bg-gray-700'; // Selected: Red, Unselected: Gray
        } else {
            backgroundColor = 'bg-gray-700'; // Default color
        }

        return (
            <TouchableOpacity
                onPress={() => handleRollClick(rollNumber)}
                className={`p-2 rounded-[10px]  ${backgroundColor} m-1 flex-1`}
            >
                <Text className="text-white text-sm text-center">{rollNumber}</Text>
            </TouchableOpacity>
        );
    };

    const RenderRollRow = ({ item }) => {
        return (
            <View className="flex-row justify-between mb-2">
                {item.map((rollNumber) => (
                    <RenderRollItem key={rollNumber.roll_number} item={rollNumber} />
                ))}
            </View>
        );
    };

    const groupRollNumbers = () => {
        const grouped = [];
        for (let i = 0; i < rollNumbers.length; i += 2) {
            grouped.push(rollNumbers.slice(i, i + 2));
        }
        return grouped;
    };

    useEffect(() => {
        fetchRollNumbers();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-primary p-4">
            <Text className="text-[20px] text-center font-bold mb-4 text-white">
                Mark Attendance
            </Text>
            <View className="flex flex-row justify-between items-center">
                <Text className="text-white mb-4 text-[14px] font-pmedium">Subject:{"   "}{subject[0].toUpperCase() + subject.slice(1)}</Text>
                <Text className="text-white mb-4 text-[14px] font-pmedium">Branch:{"   "}{section.slice(0, -1).toUpperCase() + '-' + section.slice(-1).toUpperCase()}</Text>
            </View>

            <View className="flex-row justify-between mb-4 gap-[10px]">
                <TouchableOpacity
                    onPress={() => handleStatusChange('Present')}
                    className={`flex-1 p-2 rounded-[10px] ${attendanceStatus === 'Present' ? 'bg-green-500' : 'bg-gray-700'}`}
                >
                    <Text className="text-white text-center text-sm">Present</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleStatusChange('Absent')}
                    className={`flex-1 p-2 rounded-[10px] ${attendanceStatus === 'Absent' ? 'bg-red-500' : 'bg-gray-700'}`}
                >
                    <Text className="text-white text-center text-sm">Absent</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={groupRollNumbers()}
                renderItem={({ item }) => <RenderRollRow item={item} />}
                keyExtractor={(item, index) => index.toString()}
                refreshing={refreshing}
                onRefresh={fetchRollNumbers}
            />

            <View className="flex-row justify-between mt-4">
                <TouchableOpacity onPress={handleReset} className="bg-gray-500 p-2 rounded">
                    <Text className="text-white text-center">Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} className="bg-blue-500 p-2 rounded">
                    <Text className="text-white text-center">Submit</Text>
                </TouchableOpacity>
            </View>

            <CustomAlert
                visible={modalVisible}
                title={modalTitle}
                message={modalMessage}
                onClose={() => setModalVisible(false)}
                onConfirm={handleConfirmSubmit}
            />
        </SafeAreaView>
    );
};

export default TakeAttendance;
