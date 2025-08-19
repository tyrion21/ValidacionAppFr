import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { ParametersProvider } from '../context/ParametersContext'


const _layout = () => {
  return (
    <ParametersProvider>
      <Stack
        screenOptions={{
          headerShown: false
        }}
      />
    </ParametersProvider>
  )
}

export default _layout
