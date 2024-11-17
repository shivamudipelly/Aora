import React, { useState, useRef } from 'react';
import { View, Text, Alert, ScrollView, Pressable, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { createDynamicAttendanceTable, insertIntoDynamicAttendanceTable, insertFacultyDetails, createFacultyTable } from '../../lib/class';

// Import the image
import CheckmarkImage from '../../assets/images/tick.png';
import { router } from 'expo-router';

const formFieldsData = [
  { id: 'studentPrefix', label: 'Roll Number Prefix (e.g: 22EG105J)' },
  { id: 'studentRollNo', label: 'Roll Number (e.g: 1-22,25-)' },
  { id: 'facultyBranch', label: 'Branch' },
  { id: 'facultySection', label: 'Section' },
  { id: 'facultySubject', label: 'Subject Teaching' },
];

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Function to generate roll numbers from ranges
const getNumbersFromRanges = (prefix, rollNumbers) => {
  let rollnumbers = [];
  const ranges = rollNumbers.split(",");
  for (let i = 0; i < ranges.length; i++) {
    const parts = ranges[i].trim().split("-");

    if (parts.length === 1) {
      const number = parseInt(parts[0]);
      rollnumbers.push(prefix + number.toString().padStart(2, '0'));
    } else if (parts.length === 2) {
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      for (let j = start; j <= end; j++) {
        rollnumbers.push(prefix + j.toString().padStart(2, '0'));
      }
    }
  }
  return rollnumbers;
};

const Schedule = () => {
  const initialFormValues = formFieldsData.reduce((acc, field) => {
    acc[field.id] = '';
    acc[`lateral${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`] = ''; // Add a separate field for lateral entry
    return acc;
  }, {});

  const [formFields, setFormFields] = useState(initialFormValues);
  const [selectedDays, setSelectedDays] = useState({});
  const [isLateralEntry, setIsLateralEntry] = useState(false);

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

  const addSchedule = async () => {
    const { studentPrefix, studentRollNo, facultyBranch, facultySection, facultySubject, lateralStudentPrefix, lateralStudentRollNo } = formFields;

    // Validate that all required fields are filled
    if (!facultyBranch || !facultySection || !facultySubject) {
      Alert.alert('Please fill all fields');
      return;
    }

    // Convert section and branch to lowercase
    const updatedStudentPrefix = studentPrefix.toUpperCase();
    const updatedLateralStudentPrefix = lateralStudentPrefix.toUpperCase();
    const updatedFacultySection = facultySection.toLowerCase();
    const updatedFacultyBranch = facultyBranch.toLowerCase();
    const updatedFacultySubject = facultySubject.toLowerCase();

    // Initialize roll numbers array
    let rollNumbers = [];

    try {
      // Get roll numbers (normal or lateral)
      rollNumbers = getNumbersFromRanges(updatedStudentPrefix, studentRollNo); // Normal roll numbers

      if (isLateralEntry) {
        // Get lateral entry roll numbers and add them to the existing list of roll numbers
        const lateralRollNumbers = getNumbersFromRanges(updatedLateralStudentPrefix, lateralStudentRollNo);
        rollNumbers = [...rollNumbers, ...lateralRollNumbers]; // Combine normal and lateral roll numbers
      }
      console.log(rollNumbers, updatedFacultySubject, updatedFacultyBranch, updatedFacultySection);

      // Create the dynamic attendance table
      await createDynamicAttendanceTable(updatedFacultySubject, updatedFacultyBranch, updatedFacultySection);

      // Insert the roll numbers into the dynamic attendance table
      await insertIntoDynamicAttendanceTable(updatedFacultySubject, updatedFacultyBranch, updatedFacultySection, rollNumbers);

      // Create the faculty table
      await createFacultyTable();

      // Insert faculty schedule for the selected days
      for (const day of weekdays) {
        if (selectedDays[day]) {
          await insertFacultyDetails(updatedFacultySubject, updatedFacultyBranch + updatedFacultySection, day);
        }
      }

      // Display success message
      Alert.alert('Student Roll Number and Faculty schedule added successfully');

      // Reset the form and selected days
      setFormFields(initialFormValues);
      setSelectedDays({});
      router.replace('/home');
    } catch (error) {
      // Handle errors gracefully
      console.error(error);
      Alert.alert('Error', 'There was an issue while adding the schedule. Please try again.');
    }
  };

  const handleLateralEntryChange = () => {
    setIsLateralEntry(!isLateralEntry); // Toggle lateral entry state
  };

  return (
    <SafeAreaView className="flex-1 bg-primary px-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="my-4">
          <Text className="text-xl text-center font-pblack leading-[30px] text-secondary">Schedule a Class</Text>

          {/* Form Fields */}
          {formFieldsData.map((field) => (
            <FormField
              key={field.id}
              title={field.label}
              value={formFields[field.id]}
              handleChangeText={(text) => handleChangeText(field.id, text)}
              otherStyles="mt-7"
              keyboardType={field.id.includes('RollNo') || field.id.includes('duration') ? 'numeric' : 'default'}
            />
          ))}

          {/* Option to toggle lateral entry, wrap checkbox and text in Pressable */}
          <Pressable onPress={handleLateralEntryChange} className="flex-row items-center mt-5">
            <View className={`w-[20px] h-[20px] rounded-full border-2 ${isLateralEntry ? 'border-green-500' : 'border-gray-300'} mx-2`}>
              {isLateralEntry && <View className="w-full h-full bg-green-500 rounded-full" />}
            </View>
            <Text className="text-base pl-3 text-gray-100 font-pmedium">Lateral Entry Student</Text>
          </Pressable>

          {/* Lateral Entry Roll Number Fields (shown last if selected) */}
          {isLateralEntry && (
            <>
              <FormField
                key="lateralStudentPrefix"
                title="Lateral Entry Prefix (e.g: 23EG505J)"
                value={formFields.lateralStudentPrefix}
                handleChangeText={(text) => handleChangeText('lateralStudentPrefix', text)}
                otherStyles="mt-7"
              />
              <FormField
                key="lateralStudentRollNo"
                title="Lateral Entry Roll Number (e.g: 1-5)"
                value={formFields.lateralStudentRollNo}
                handleChangeText={(text) => handleChangeText('lateralStudentRollNo', text)}
                otherStyles="mt-7"
              />
            </>
          )}

          <Text className="text-[16px] pl-3 mt-5 text-white">Select Days:</Text>

          {/* Weekdays Selection */}
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

          {/* Add Schedule Button */}
          <CustomButton
            title="Add Schedule"
            handlePress={addSchedule}
            containerStyles="mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Schedule;
