import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#6200ee' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#6200ee',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Basic' }} />
      <Tabs.Screen name="imperative" options={{ title: 'Imperative' }} />
      <Tabs.Screen name="events" options={{ title: 'Events' }} />
      <Tabs.Screen name="hook" options={{ title: 'Hook' }} />
    </Tabs>
  );
}
