import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import ScreenWrapper from '../components/ScreenWrapper'
import { enableScreens } from 'react-native-screens';

enableScreens();
const Index = () => {
    const router = useRouter()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (isMounted) {
            router.push('welcome')
        }
    }, [isMounted])

    return (
        <ScreenWrapper>
            <Text>conectando...</Text>
            <Pressable title="Bienvenido" onPress={() => router.push('welcome')}></Pressable>
        </ScreenWrapper>
    )
}


export default Index

const styles = StyleSheet.create({})