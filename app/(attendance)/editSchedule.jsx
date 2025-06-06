import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { getAllFaculties, updateSchedule, updateAttendance } from '../../lib/class';

// Import the checkmark image for selected days
import CheckmarkImage from '../../assets/images/tick.png';
import { useGlobalSearchParams } from 'expo-router';

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const EditSchedule = ({ route }) => {
  const { subject, section } = useGlobalSearchParams(); // Parameters for identifying the schedule to edit

  // Form field values initialized based on current schedule
  const [formFields, setFormFields] = useState({
    studentPrefix: '',
    studentRollNo: '',
    facultyBranch: section.slice(0, -1) || '',
    facultySection: section.slice(-1) || '',
    facultySubject: subject || '',
    lateralStudentPrefix: '',
    lateralStudentRollNo: '',
  });
 console.log(formFields)
  const [selectedDays, setSelectedDays] = useState({});
  const [isLateralEntry, setIsLateralEntry] = useState(false);

  // Fetch existing schedule details when component mounts
  useEffect(() => {
    const loadScheduleDetails = async () => {
      try {
        // Call the function to fetch schedule details for a specific subject and section
        const data = await getAllFaculties();

        // Ensure that data is valid
        if (data && data.length > 0) {
          console.log(data);
          const scheduleData = data.find((item) => item.subject === subject && item.branch_section === section);

          // If the schedule data is found, set form fields and selected days
          if (scheduleData) {
            setFormFields({
              studentPrefix: scheduleData.studentPrefix || '',
              studentRollNo: scheduleData.studentRollNo || '',
              facultyBranch: scheduleData.facultyBranch || '',
              facultySection: scheduleData.facultySection || '',
              facultySubject: scheduleData.facultySubject || '',
              lateralStudentPrefix: scheduleData.lateralStudentPrefix || '',
              lateralStudentRollNo: scheduleData.lateralStudentRollNo || '',
            });

            setSelectedDays(scheduleData.selectedDays || {});
            setIsLateralEntry(!!scheduleData.lateralStudentPrefix);
          } else {
            Alert.alert('Error', 'No schedule found for the given subject and section.');
          }
        } else {
          Alert.alert('Error', 'Could not load faculties data.');
        }
      } catch (error) {
        Alert.alert('Error', 'Could not load schedule details');
      }
    };

    loadScheduleDetails();
  }, [subject, section]);

  const handleChangeText = (id, value) => {
    setFormFields((prevFields) => ({
      ...prevFields,
      [id]: value,
    }));
  };

  const toggleDaySelection = (day) => {
    setSelectedDays((prevSelectedDays) => ({
      ...prevSelectedDays,
      [day]: !prevSelectedDays[day],
    }));
  };
 

  const handleUpdateSchedule = async () => {
    try {
      // Update the schedule using the updateSchedule function
      await updateSchedule(formFields, selectedDays);
      Alert.alert('Success', 'Schedule updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update schedule');
    }
  };

  const handleUpdateAttendance = async () => {
    try {
      // Update the attendance using the updateAttendance function
      await updateAttendance(formFields.facultySubject, formFields.facultyBranch, formFields.facultySection);
      Alert.alert('Success', 'Attendance updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update attendance');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary px-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="my-4">
          <Text className="text-xl text-center font-pblack leading-[30px] text-secondary">Edit Schedule or Attendance</Text>

          {/* Editable Form Fields */}
          {Object.keys(formFields).map((key) => (
            <FormField
              key={key}
              title={key.replace(/([A-Z])/g, ' $1')}
              value={formFields[key]}
              handleChangeText={(text) => handleChangeText(key, text)}
              otherStyles="mt-7"
              keyboardType={key.includes('RollNo') ? 'numeric' : 'default'}
            />
          ))}

          {/* Lateral Entry Toggle */}
          <Pressable onPress={() => setIsLateralEntry(!isLateralEntry)} className="flex-row items-center mt-5">
            <View className={`w-[20px] h-[20px] rounded-full border-2 ${isLateralEntry ? 'border-green-500' : 'border-gray-300'} mx-2`}>
              {isLateralEntry && <View className="w-full h-full bg-green-500 rounded-full" />}
            </View>
            <Text className="text-base pl-3 text-gray-100 font-pmedium">Lateral Entry Student</Text>
          </Pressable>

          {/* Weekday Selection */}
          <Text className="text-[16px] pl-3 mt-5 text-white">Select Days:</Text>
          {weekdays.map((day) => (
            <Pressable key={day} onPress={() => toggleDaySelection(day)} className="flex-row items-center my-2 px-10">
              <View className="w-[40px] h-[40px] mr-[10px]">
                {selectedDays[day] ? (
                  <Image source={CheckmarkImage} className="w-full h-full" alt="tick image" />
                ) : (
                  <View className="m-[8px] w-[25px] h-[25px] rounded-[5px] border-2 border-[#1c8c5e]" />
                )}
              </View>
              <Text className="text-base text-gray-500">{day}</Text>
            </Pressable>
          ))}

          {/* Update Schedule and Attendance Buttons */}
          <CustomButton title="Update Schedule" handlePress={handleUpdateSchedule} containerStyles="mt-7" />
          <CustomButton title="Update Attendance" handlePress={handleUpdateAttendance} containerStyles="mt-3" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditSchedule;
