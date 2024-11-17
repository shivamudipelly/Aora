// import { View, Text, Image } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import { Redirect, router } from 'expo-router'
import { Redirect } from 'expo-router'

// import { images } from '../constants'
// import CustomButton from '../components/CustomButton'

const MainLayout = () => {
  return <Redirect href="home" />
  // return (
  //   <SafeAreaView className="flex-1  bg-primary">
  //     <View className="py-10 px-3 w-[95%] mx-auto">
  //       <View>
  //         <Image
  //           source={images.logo}
  //           resizeMode="contain"
  //           className="w-full h-12"
  //         />
  //       </View>
  //       <View className="my-10">
  //         <Image
  //           source={images.cards}
  //           resizeMode="contain"
  //           className="w-full h-[342px] border border-red-500"
  //         />
  //       </View>
  //       <View className="my-5 w-[95%]">
  //         <Text className="text-white text-[38px] font-pbold text-center">
  //           Empower Faculty with {' '}
  //           <Text className="text-secondary-100 font-black">Aora</Text>
  //         </Text>
  //       </View>
  //       <View>
  //         <Text className="text-gray-100 font-pmedium text-[20px] text-center">
  //           Experience seamless attendance tracking and empower faculty with intuitive management solutions through Aora.
  //         </Text>
  //       </View>
  //       <CustomButton
  //         title={<Text>continue with Email <Text className="text-[38px] w-10 h-10 ">→</Text></Text>}
  //         textStyles="font-psemibold text-xl"
  //         containerStyles="mt-10 mx-auto w-[90%] "
  //         handlePress={() => { router.navigate('/signin') }}
  //       />

  //     </View>
  //   </SafeAreaView>
  // )
}

export default MainLayout