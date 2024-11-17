import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { getAttendanceData } from '../../lib/class'; // Ensure this is correctly imported and implemented
import { useGlobalSearchParams } from 'expo-router'; // Ensure this is configured in your project
import { SafeAreaView } from 'react-native-safe-area-context';

const ViewAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [dateFields, setDateFields] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
  const flatListRef = useRef(null);

  const { branch_section, subject } = useGlobalSearchParams();

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      const data = await getAttendanceData(subject, branch_section);
      setAttendanceData(data);

      if (data.length > 0) {
        const fields = Object.keys(data[0]).filter((key) => key.startsWith('date_'));
        setDateFields(fields);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAttendanceData();
  }, [branch_section, subject]);

  // Format the attendance data for the selected date
  const filteredAttendance = attendanceData.map((item) => ({
    ...item,
    attendance: item['date_' + selectedDate], // Correct dynamic key access
  }));

  const renderAttendanceItem = ({ item }) => {
    console.log(item); // Log the 'item' to the console
  
    return (
      <View className="bg-gray-800 rounded-lg p-4 flex-row justify-between items-center my-2">
        <Text className="min-w-20 text-white font-bold text-center">{item.roll_number}</Text>
        <Text className={`w-20 text-center ${item.attendance === 1 ? 'text-green-500' : 'text-red-400'}`}>
          {item.attendance === 1 ? 'Present' : 'Absent'}
        </Text>
      </View>
    );
  };
  

  const renderDateItem = ({ item: dateField }) => {
    const day = dateField.slice(11, 13);
    const month = dateField.slice(9, 11);
    const year = dateField.slice(5, 9);

    // Get the day of the week
    const date = new Date(`${year}-${month}-${day}`);
    const weekDay = date.toLocaleString('default', { weekday: 'short' });

    console.log(date, weekDay);

    // Apply conditional styles for selected item
    const isSelected = selectedDate === dateField.replace('date_', '');
    const containerStyle = isSelected
      ? 'bg-white h-[50px]   opacity-100  rounded-[10px] justify-center items-center ' // Larger height and scale for selected
      : 'bg-transparent h-[35px]  mt-[9px]  opacity-50 justify-center items-center '; // Colorless for unselected items

    return (
      <TouchableOpacity
        key={dateField}
        onPress={() => setSelectedDate(dateField.replace('date_', ''))}
        className={` py-[5px] px-[10px] ${containerStyle}`}
      >
        <Text
          className={`font-bold ${isSelected ? 'text-blue-500' : 'text-gray-300'}`}
        >
          {weekDay}
        </Text>
        <Text className="text-xs font-bold text-gray-400">{`${day}/${month}/${year}`}</Text>
      </TouchableOpacity>
    );
  };



  // Ensure date scroll stays persistent and highlight selected date
  useEffect(() => {
    if (flatListRef.current && dateFields.length > 0) {
      const index = dateFields.findIndex((dateField) => dateField.replace('date_', '') === selectedDate);
      if (index !== -1) {
        flatListRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [selectedDate, dateFields]);

  // getItemLayout for fixed-size items
  const getItemLayout = (data, index) => ({
    length: 100, // Item width for horizontal FlatList
    offset: 100 * index, // Offset for each item (width * index)
    index,
  });

  // Handle failed scrollToIndex
  const onScrollToIndexFailed = (error) => {
    const offset = error.averageItemLength * error.index;
    flatListRef.current.scrollToOffset({ offset, animated: true });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="p-4">
        {/* Header */}
        <Text className="text-[20px] text-center font-bold mb-4 text-white">Attendance Records</Text>
        <View className="flex flex-row justify-between items-center mb-4">
          <Text className="text-white text-[14px]">Subject: {subject[0].toUpperCase() + subject.slice(1)}</Text>
          <Text className="text-white text-[14px]">Branch: {branch_section.slice(0, -1).toUpperCase() + ' - ' + branch_section.slice(-1).toUpperCase()}</Text>
        </View>

        {/* Date Selector with Horizontal Scroll */}
        <View>
          {dateFields.length > 0 && (
            <FlatList
              ref={flatListRef}
              horizontal
              data={dateFields}
              keyExtractor={(item) => item}
              renderItem={renderDateItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
              getItemLayout={getItemLayout}
              onScrollToIndexFailed={onScrollToIndexFailed}
            />
          )}
        </View>

        {/* Attendance List */}
        <View className="mb-[285px]">
          {filteredAttendance.length > 0 ? (
            <FlatList
              data={filteredAttendance.filter((item) => item.attendance !== undefined)}
              renderItem={renderAttendanceItem}
              keyExtractor={(item) => item.roll_number.toString()}
            />
          ) : (
            <Text className="text-center text-gray-500 mt-6">No attendance records available for this date.</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ViewAttendance;
