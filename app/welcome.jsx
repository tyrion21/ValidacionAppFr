import { Image, StyleSheet, Text, View } from 'react-native'
// import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { wp, hp } from '../helpers/common'
import { theme } from '../constants/theme'
// import { FontDisplay } from 'expo-font'
import Button from '../components/Button'
import { useRouter } from 'expo-router'

const Welcome = () => {
    const router = useRouter()
    return (
        <ScreenWrapper>
            <StatusBar style="dark" />
            <View style={styles.container}>
                {/* <Text>Bienvenido</Text> */}
                <Image style={styles.welcomeImage} resizeMode='contain' source={require('../assets/images/logo-4.png')} />
                {/* Title */}
                <View style={{ gap: 20 }}>
                    <Text style={styles.title}>Quelen Fruit Movil App</Text>
                    <Text></Text>
                </View>
                {/* footer */}
                <View style={styles.footer}>
                    <Button
                        title='Comenzar'
                        buttonStyle={{ marginHorizontal: wp(5) }}
                        onPress={() => { router.push('login') }}
                    />
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default Welcome

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        backgroundColor: 'white',
        alignItems: 'center',
        paddingHorizontal: wp(4)
    },
    welcomeImage: {
        width: wp(100),
        height: hp(50),
        alignSelf: 'center'
    },
    title: {
        fontSize: hp(5),
        // fontWeight: theme.colors.extraBold,
        textAlign: 'center',
        color: theme.colors.text,
        fontWeight: 'bold'
    },
    footer: {
        gap: 15,
        width: '100%',
        marginBottom: hp(8),
    }

})