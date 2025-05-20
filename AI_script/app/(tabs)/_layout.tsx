import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import {TabBar} from '@/components/TabBar'
const TabLayout = () => {
  return (
    <Tabs tabBar={props => <TabBar {...props}/>}>
      <Tabs.Screen name = "index" options ={{title: "Upload", headerShown: false}} />
      <Tabs.Screen name = "profile" options = {{title: "Profile", headerShown: false}}/>
      <Tabs.Screen name = "explore" options={{title: "Explore",headerShown: false}}/>
      <Tabs.Screen name="search" options={{title: "Search", headerShown : false}}/>
      
    </Tabs>

  )
}

export default TabLayout