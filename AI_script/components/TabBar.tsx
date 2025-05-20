import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {BottomTabBarProps}from '@react-navigation/bottom-tabs';
import {Feather} from '@expo/vector-icons';
import Profile from '@/app/(tabs)/profile';

export function TabBar({ state, descriptors, navigation }:BottomTabBarProps) {

  //https://feathericons.com/
  const icon ={
    index : (props: any) => (<Feather name ='upload' size={24}   {...props} />),
    profile : (props: any) => (<Feather name ='user' size={24}   {...props} />),
    explore : (props: any) => (<Feather name ='compass' size={24}   {...props} />),
    search : (props: any) => (<Feather name ='search' size={24}   {...props} />),

  };
  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
          key = {route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
          > 
            {icon [route.name]({
              color: isFocused ? '#0172B2' : '#222'
            })}    
            <Text style={{ color: isFocused ? '#0172B2' : '#222', fontWeight: isFocused ? 'bold': 'normal' }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
tabbar: {
    position: 'absolute',
    bottom : 40,
    flexDirection :'row',
    backgroundColor: '#fff',
    marginHorizontal: 40,
    paddingVertical: 15,
    justifyContent : 'space-between',
    borderRadius : 35,
    alignItems: 'center',
    shadowColor : '#000',
    shadowOffset : {width: 0, height: 10},
    shadowRadius: 20,
    shadowOpacity : 0.1
}    ,
tabbarItem: {
  flex : 1,
  justifyContent:'center',
  alignItems : 'center',
  gap : 5,
}

})