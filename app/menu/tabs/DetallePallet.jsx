import { StyleSheet, View, Text, StatusBar, Image, Platform, KeyboardAvoidingView, Alert } from "react-native";
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import React, { useRef, useState, useEffect, useContext } from "react";
import { useRouter } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useRoute } from '@react-navigation/native';
import { theme } from "@/constants/theme";
import BackButton from "@/components/BackButton";
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import Button from "@/components/Button";
import { ParametersContext } from "@/context/ParametersContext";
import { hp, wp } from "@/helpers/common";
import { API_URL } from '@/constants/constantes';
import { verificarRechazo, actualizarRechazo, verificarValidacion } from '@/services/validacionService';

const DetallePallet = () => {

    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();
    const route = useRoute();
    const userRef = useRef("")
    const passwordRef = useRef("")
    const { folio,especie,cajas } = route.params;
    const [data, setData] = useState([]);
    const [csg, setCsg] = useState("");
    const [variedad, setVariedad] = useState("");
    const [cuartel, setCuartel] = useState("");
    const [calibre, setCalibre] = useState("");
    const [cajasMix, setCajasMix] = useState("");
    const [loading, setLoading] = useState(false)
    const { selectedFrio, setSelectedFrio, selectedCamara, setSelectedCamara } = useContext(ParametersContext);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/existencias/mixexistencias/${folio}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                let data;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    data = await response.json();
                    console.log(data);
                    
                } else {
                    data = await response.text();
                    console.log('text', data);
                    
                }

                if (response.ok) {
                    setData(data);
                    // setCsg(data.CSG);
                    // setVariedad(data.Variedad);
                    // setCuartel(data.Cuartel);
                    // setCalibre(data.Calibre);
                    // setCajas(data.Cajas);
                    console.log(data);
                    
                } else if (response.status === 404) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Folio no encontrado'
                    });
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Ocurrió un error al buscar el folio'
                    });
                }
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Ocurrió un error al buscar el folio'
                });
            } finally {
                setLoading(false);
            }
        }

        fetchData();    }, [folio]);      const rechazarPallet = async () => {
        try {
            // Verificar si el pallet ya ha sido validado
            const respuestaValidacion = await verificarValidacion(folio);
            
            if (respuestaValidacion.data && respuestaValidacion.data.validado) {
                // Si está validado, mostrar un mensaje de error
                Alert.alert(
                    "No se puede rechazar",
                    "Este pallet ya ha sido validado y no puede ser rechazado.",
                    [
                        {
                            text: "Entendido",
                            style: "default"
                        }
                    ]
                );
                return;
            }
            
            // Si no está validado, proceder con el rechazo
            console.log('Enviando a rechazo con packing:', selectedFrio);
            
            // Asegurarnos de que todos los parámetros tengan valores válidos
            router.push({
                pathname: '/menu/tabs/RechazoPallet',
                params: { 
                    folio: folio || '',
                    especie: especie || '',
                    cajas: cajas ? cajas.toString() : '0',
                    camara: selectedCamara || '', 
                    packing: selectedFrio || '' // Usar el valor de selectedFrio como packing
                }
            });
        } catch (error) {
            console.error('Error verificando validación:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo verificar el estado del pallet',
                position: 'top',
                visibilityTime: 2000,
                autoHide: true,
            });
        }
    }
    
    const onSubmit = async () => {
        try {
            // Verificar si el pallet ha sido rechazado previamente
            const respuestaVerificacion = await verificarRechazo(folio);
            
            if (respuestaVerificacion.data && respuestaVerificacion.data.rechazado && respuestaVerificacion.data.estado === 'R') {
                // Si está rechazado, mostrar una alerta de confirmación
                Alert.alert(
                    "Pallet Rechazado",
                    "Este pallet ha sido rechazado previamente. ¿Desea validarlo de todas formas?",
                    [
                        {
                            text: "Cancelar",
                            style: "cancel"
                        },
                        {
                            text: "Validar",
                            onPress: () => realizarValidacion(true) // Validar y actualizar estado de rechazo
                        }
                    ]
                );
            } else {
                // Si no está rechazado, proceder con la validación normal
                realizarValidacion(false);
            }
        } catch (error) {
            console.error('Error verificando rechazo:', error);
            // En caso de error en la verificación, permitir validar de todas formas
            realizarValidacion(false);
        }
    }

    const realizarValidacion = async (esRechazoAprobado) => {
        const data = {
            Folio: folio,
            Especie: especie,
            Estado: true,
            Camara: selectedCamara,
            Usuario: 'jason',
            Packing: selectedFrio,
            Cajas: parseInt(cajas, 10),
        };
        
        try {
            // Si el pallet estaba rechazado y se aprueba, actualizar su estado primero
            if (esRechazoAprobado) {
                try {
                    const respuestaActualizacion = await actualizarRechazo(folio);
                    console.log('Resultado de actualización de rechazo:', respuestaActualizacion);
                } catch (errorActualizacion) {
                    console.error('Error actualizando estado de rechazo:', errorActualizacion);
                    // Continuar con la validación aunque falle la actualización
                }
            }
            
            // Realizar la validación
            const response = await fetch(`${API_URL}/validacion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            console.log('Response:', responseData);
            console.log('Status:', response.status);
            

            if (responseData.message == 'Folio ya fue validado'){
                Toast.show({
                    type: 'error',
                    text1: 'Error de validación',
                    text2: responseData.message,
                    position: 'top',
                    visibilityTime: 2000,
                    autoHide: true,
                })
            } else {
                let mensaje = responseData.message || 'Pallet validado correctamente';
                if (esRechazoAprobado) {
                    mensaje = 'Pallet validado correctamente (Aprobado después de rechazo)';
                }
                
                Toast.show({
                    type: 'success',
                    text1: 'Validación exitosa',
                    text2: mensaje,
                    position: 'top',
                    visibilityTime: 2000,
                    autoHide: true,
                });
            }
            
            setRefreshKey(oldKey => oldKey + 1);
            setTimeout(() => {
                router.push({ pathname: 'menu/validacion', params: { refreshKey: refreshKey + 1 } });
            }, 2000);
        } catch (error) {
            console.error('Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error de validación',
                text2: error.message || 'Error validando el pallet',
                position: 'top',
                visibilityTime: 2000,
                autoHide: true,
            });
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
                    <Text style={styles.welcomeText}>Folio: {folio}</Text>
                    <View style={styles.tableContainer}>
                        <Text style={styles.title}>Detalle de Pallet</Text>
                        <View style={styles.table}>
                            <View style={styles.tableRow}>
                                <Text style={styles.tableHeader}>CSG</Text>
                                <Text style={styles.tableHeader}>Variedad</Text>
                                <Text style={styles.tableHeader}>Cuartel</Text>
                                <Text style={styles.tableHeader}>Calibre</Text>
                                <Text style={styles.tableHeader}>Cajas</Text>
                            </View>
                            {data.map((item, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{item.CSG}</Text>
                                    <Text style={styles.tableCell}>{item.Variedad}</Text>
                                    <Text style={styles.tableCell}>{item.Cuartel}</Text>
                                    <Text style={styles.tableCell}>{item.Calibre}</Text>
                                    <Text style={styles.tableCell}>{item.Cajas}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button title="Rechazar" onPress={rechazarPallet} buttonStyle={[styles.redButton, styles.buttonPadding]} />
                        <Button title="Validar" loading={loading} onPress={onSubmit} buttonStyle={[styles.buttonPadding]} />
                    </View>
                </KeyboardAwareScrollView>
            </KeyboardAvoidingView>
            <Toast />

        </ScreenWrapper>
    )
}

export default DetallePallet;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        gap: 45,
        paddingHorizontal: wp(5)
    },
    headerImg: {
        width: 150,
        height: 100,
        alignSelf: 'center',
    },
    welcomeText: {
        fontSize: hp(4),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text
    },
    form: {
        gap: 25
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableRow: {
        flexDirection: 'row',        
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableHeader: {
        flex: 1,
        padding: 4,
        textAlign: 'center',
        fontWeight: 'bold', 
        backgroundColor: theme.colors.primary,
    },
    tableCell: {
        flex: 1,
        padding: 1,
        textAlign: 'center',
        fontSize: 11,
    },
    csgHeader: {
        padding: 4, // Adjust padding for CSG column header
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    redButton: {
        backgroundColor: 'red',
    },
    buttonPadding: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    

})
