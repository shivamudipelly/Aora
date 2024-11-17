import React from 'react';
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const AttendanceLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name='takeAttendance' options={{ headerShown: false }} />
        <Stack.Screen name='viewAttendance' options={{ headerShown: false }} />
        <Stack.Screen name='schedule' options={{ headerShown: false }} />
      </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  )
}

export default AttendanceLayout