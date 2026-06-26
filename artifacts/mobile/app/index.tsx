import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function RootIndex() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0A0A", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#20c55d" size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  if (user.role === "gym_owner") {
    return <Redirect href="/(gym-tabs)" />;
  }

  return <Redirect href="/(user-tabs)" />;
}
