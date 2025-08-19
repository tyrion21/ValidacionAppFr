import { StyleSheet, View, Text, StatusBar, Image, Platform, KeyboardAvoidingView } from "react-native";
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import React, { useRef, useState } from "react";
import { useRouter } from "expo-router";
import ScreenWrapper from "../components/ScreenWrapper";
import { theme } from "../constants/theme";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import Icon from '../assets/icons';
import Input from "../components/Input";
import { hp, wp } from "../helpers/common";
import  { API_URL } from '../constants/constantes'

const Login = () => {

    const router = useRouter();
    const userRef = useRef("")
    const passwordRef = useRef("")
    const [loading, setLoading] = useState(false)

    const onSubmit = async () => {

        if (userRef.current === "" || passwordRef.current === "") {
            Toast.show({
                type: 'info',
                text1: 'Advertencia',
                text2: 'Por favor, rellene todos los campos'
            });
            return
        }
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: userRef.current,
                    pass: passwordRef.current,
                }),
            });

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                data = await response.json();
            } else {
                data = await response.text();
            }


            if (response.ok) {
                // Manejar la respuesta exitosa
                console.log('Login successful:', data);
                // Toast.show({ type: 'success', text1: 'Exito', text2: 'Exito al iniciar sesión' });
                // Redirigir a otra pantalla o actualizar el estado de la aplicación
                router.push('/parameters');
            } else {
                // Manejar errores
                Toast.show({ type: 'error', text1: 'Error', text2: 'Error al iniciar sesión' });
            }
        } catch (error) {
            console.error('Error:', error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Error de conexión' });
        } finally {
            setLoading(false);
        }

    }

    return (

        <ScreenWrapper>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <KeyboardAwareScrollView
                    contentContainerStyle={styles.container}
                    enableOnAndroid={true}
                    extraScrollHeight={Platform.OS === 'ios' ? 20 : 100}
                >
                    <BackButton router={router} />

                    {/* Bienvenido */}
                    <Image source={require('../assets/images/logo_qf.webp')} style={styles.headerImg} />
                    <View>
                        <Text style={styles.welcomeText}>Hola,</Text>
                        <Text style={styles.welcomeText}>Bienvenido</Text>
                    </View>
                    {/* Formulario */}
                    <View style={styles.form}>
                        <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
                            Por favor, ingresa tus datos para continuar
                        </Text>
                        <Input
                            placeholder="Usuario SDT"
                            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
                            onChangeText={value => userRef.current = value}
                        />
                        <Input
                            secureTextEntry
                            placeholder="Contraseña SDT"
                            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
                            onChangeText={value => passwordRef.current = value}
                        />
                        <Button title="Ingresar" onPress={onSubmit} loading={loading} />
                    </View>
                </KeyboardAwareScrollView>
            </KeyboardAvoidingView>
            <Toast />

        </ScreenWrapper>
    )
}

export default Login;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        gap: 35,
        paddingHorizontal: wp(5)
    },
    headerImg: {
        width: 160,
        height: 120,
        alignSelf: 'center',
    },
    welcomeText: {
        fontSize: hp(4),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text
    },
    form: {
        gap: 15
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    },
    footerText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6)
    },

})
