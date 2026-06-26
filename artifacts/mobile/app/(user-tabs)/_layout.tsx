import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

const G = "#20c55d";
const BG = "#050505";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workouts">
        <Icon sf={{ default: "dumbbell", selected: "dumbbell.fill" }} />
        <Label>Workout</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="nutrition">
        <Icon sf={{ default: "brain.head.profile", selected: "brain.head.profile" }} />
        <Label>AI Coach</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="challenges">
        <Icon sf={{ default: "heart.circle", selected: "heart.circle.fill" }} />
        <Label>Health</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: G,
        tabBarInactiveTintColor: "#6b7280",
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : BG,
          borderTopWidth: 1,
          borderTopColor: "#1e1e1e",
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: BG, borderTopWidth: 1, borderTopColor: "#1e1e1e" }]} />
          ),
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="house" tintColor={color} size={24} /> : <Feather name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workout",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="dumbbell" tintColor={color} size={24} /> : <Feather name="zap" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "AI Coach",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="brain.head.profile" tintColor={color} size={24} /> : <Feather name="cpu" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: "Health",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="heart.circle" tintColor={color} size={24} /> : <Feather name="heart" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="person" tintColor={color} size={24} /> : <Feather name="user" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function UserTabLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}
