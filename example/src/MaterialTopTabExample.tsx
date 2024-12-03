import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { View, Text, Button } from 'react-native';



function Tab1() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Tab 1</Text>
        </View>
    );
}

function Tab2(props: any) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button
                title="Logout"
                onPress={props.onLogout}
            />
        </View>
    );
}

const PreAuthScreen = (props: any) => {

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Button
                title="Login"
                onPress={() => props.setIsSignedIn(true)}
            />
        </View>
    );

};

const PostAuthScreen = (props: any) => {
    const { Navigator, Screen } = createMaterialTopTabNavigator();


    const onLogout = () => {
        setTimeout(() => {
            props.setIsSignedIn(false);
        }, 0);
    };

    return (
        <View style={{ flex: 1 }}>
            <Navigator>
                <Screen name="Tab1" component={Tab1} />

                    <Screen
                        name="Tab2">
                        {(props: any) => <Tab2 {...props} onLogout={onLogout} />}
                    </Screen>
            </Navigator>
        </View>
    );

};

export function MaterialTopBarExample() {
    const { Screen, Navigator } = createNativeStackNavigator();
    const [isSignedIn, setIsSignedIn] = useState(false);

    return (

            <Navigator>
                {!isSignedIn ?
                    <Screen
                        name="Pre Auth Screen">
                        {(props: any) => <PreAuthScreen {...props} setIsSignedIn={setIsSignedIn} />}
                    </Screen>
                    :
                    <Screen
                        name="Post Auth Screen">
                        {(props: any) => <PostAuthScreen {...props} setIsSignedIn={setIsSignedIn} />}
                    </Screen>
                }
            </Navigator>
    );
}
