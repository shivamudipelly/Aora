import { useEffect } from "react";
import { useFonts } from "expo-font";
import "react-native-url-polyfill/auto";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
    // Load fonts
    const [fontsLoaded, error] = useFonts({
        "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
        "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
        "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
        "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
        "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
        "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
        "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
        "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
        "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    });

    // Add logging to debug state changes and renders
    useEffect(() => {
        if (error) {
            console.error("Font loading error:", error);
            throw error; 
        }

        if (fontsLoaded) {
            console.log("Hiding splash screen, fonts are loaded.");
            SplashScreen.hideAsync(); // Only hide the splash screen once fonts are loaded
        }
    }, [fontsLoaded, error]);

    // Log renders for further debugging
    console.log("Rendering RootLayout component");

    // Don't render the app until fonts are loaded
    if (!fontsLoaded) {
        console.log("Fonts are not loaded, returning null...");
        return null; // Prevent rendering if fonts are still loading
    }
    
    // The main return statement once fonts are loaded
    return (
        <>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(attendance)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>

            <StatusBar backgroundColor="#161622" style="light" />
        </>
    );
};

export default RootLayout;
