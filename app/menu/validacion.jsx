
import { StyleSheet, View, Text, StatusBar, Platform, KeyboardAvoidingView, TouchableOpacity } from "react-native";
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import React, { useRef, useState, useContext, useEffect } from "react";
import { useRouter } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { hp, wp } from "@/helpers/common";
import { ParametersContext } from "@/context/ParametersContext";
// import ForwardButton from "../../components/ForwardButton";
import { API_URL } from '@/constants/constantes'

const validacion = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();
    const folioRef = useRef("");
    const folioInputRef = useRef(null);
    const [exportadora, setExportadora] = useState("");
    const [embalaje, setEmbalaje] = useState("");
    const [etiqueta, setEtiqueta] = useState("");
    const [categoria, setCategoria] = useState("");
    const [calibre, setCalibre] = useState("");
    const [cajas, setCajas] = useState("");
    const [especie, setEspecie] = useState("");
    const [loading, setLoading] = useState(false);
    const [datosVinculados, setDatosVinculados] = useState(false); // Controla si se mostraron los datos
    const { selectedFrio, setSelectedFrio, selectedCamara, setSelectedCamara } = useContext(ParametersContext);


    const resetFields = () => {
        folioRef.current = "";
        setExportadora("");
        setEmbalaje("");
        setEtiqueta("");
        setCategoria("");
        setCalibre("");
        setCajas("");
        setEspecie("");
        setDatosVinculados(false);
    };

    useEffect(() => {
        resetFields();
    }, [refreshKey]);

    useEffect(() => {
        // Auto-focus on the Folio input when component mounts
        const timer = setTimeout(() => {
            if (folioInputRef.current) {
                folioInputRef.current.focus();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);
    const onSubmit = async () => {

        if (folioRef.current === "") {
            Toast.show({
                type: 'info',
                text1: 'Advertencia',
                text2: 'Por favor, ingrese numero de pallet',
                position: 'top',
                visibilityTime: 2000,
                autoHide: true,
                topOffset: 50,
                bottomOffset: 40,
                style: { height: '150%', width: '150%', padding: 90 },
                textStyle: { fontSize: 20 }
            });
            return
        }
        setLoading(true);
        try {

            const validationResponse = await fetch(`${API_URL}/validaciones/folio/${folioRef.current}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (validationResponse.ok) {
                const validationData = await validationResponse.json();
                Toast.show({
                    type: 'info',
                    text1: 'Advertencia',
                    text2: `Folio ${folioRef.current} validado el ${validationData.createdAt}`,
                    position: 'top',
                    visibilityTime: 2000,
                    autoHide: true,
                    topOffset: 50,
                    bottomOffset: 40,
                    style: { height: '150%', width: '150%', padding: 90 },
                    textStyle: { fontSize: 20 }
                });
                setLoading(false);
                return;
            } else if (validationResponse.status === 404) {
                // Folio no encontrado, continuar con la lógica
            } else {
                throw new Error('Error al validar el folio');
            }
            console.log(folioRef.current); // Asegúrate de que folioRef.current tenga el valor correcto

            // Primero verificar qué tipo de folio es (normal o mix)
            const verificarResponse = await fetch(`${API_URL}/existencias/verificar-folio/${folioRef.current}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!verificarResponse.ok) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Error al verificar el folio'
                });
                setLoading(false);
                return;
            }

            const verificarData = await verificarResponse.json();
            console.log('Verificación de folio:', verificarData);

            if (!verificarData.existe) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Folio no encontrado'
                });
                setLoading(false);
                return;
            }

            // Llamar al endpoint correcto según el tipo
            const endpoint = verificarData.tipo === 'mix'
                ? `${API_URL}/existencias/${folioRef.current}` // Para mix, usar normal para obtener Especie
                : `${API_URL}/existencias/${folioRef.current}`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log(response);
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (response.ok) {
                console.log('Data:', data);

                // Si es un array (mix), tomar el primer elemento para obtener datos generales
                const dataObj = Array.isArray(data) ? data[0] : data;

                setExportadora(dataObj.Exportadora || 'N/A');
                setEmbalaje(dataObj.Embalaje || 'N/A');
                setEtiqueta(dataObj.Marca || dataObj.Etiqueta || 'N/A');
                setCategoria(dataObj.Categoria || 'N/A');
                setCalibre(dataObj.Calibre || 'N/A');

                // Para cajas, si es mix sumar todas las cajas del array
                if (Array.isArray(data)) {
                    const totalCajas = data.reduce((sum, item) => sum + (item.Cajas || 0), 0);
                    setCajas(totalCajas);
                } else {
                    setCajas(dataObj.Cajas || 0);
                }

                setEspecie(dataObj.Especie || 'N/A');
                setDatosVinculados(true); // Habilitar el botón "Detalle Pallet"

            } else if (response.status === 404) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Folio no encontrado'
                });
            }
            else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Ocurrió un error al buscar el folio'
                });
            }
        } catch (error) {
            // console.error('Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Error al buscar el folio'
            });
        } finally {
            setLoading(false);
        }
    };

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
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.push({ pathname: 'menu' })}>
                            <Text style={styles.headerText}>Volver al Menú</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={() => router.push({ pathname: 'menu/tabs/DetallePallet', params: { folio: folioRef.current, especie, cajas } })}> */}
                        {/* <Text style={styles.headerText}>Detalle de Pallet</Text>
                        </TouchableOpacity> */}
                    </View>
                    <View style={styles.form}>
                        <Text style={styles.welcomeText}>{selectedCamara}</Text>
                        <Input
                            inputRef={folioInputRef}
                            placeholder="Folio"
                            onChangeText={value => folioRef.current = value}
                            required
                            maxLength={10}
                            style={{ color: theme.colors.text, fontSize: hp(3), fontWeight: 'bold' }}
                        />
                        <Input
                            placeholder="Exportadora"
                            value={exportadora}
                            readOnly
                            style={{ color: theme.colors.text, fontSize: hp(2.1) }}
                        />
                        <Input
                            placeholder="Embalaje"
                            value={embalaje}
                            readOnly

                            style={{ color: theme.colors.text, fontSize: hp(2.1) }}
                        />
                        <Input
                            placeholder="Etiqueta"
                            value={etiqueta}
                            readOnly

                            style={{ color: theme.colors.text, fontSize: hp(2.1) }}
                        />
                        <Input
                            placeholder="Categoria"
                            value={categoria}
                            readOnly

                            style={{ color: theme.colors.text, fontSize: hp(2.1) }}
                        />
                        <Input
                            placeholder="Calibre"
                            value={calibre}
                            readOnly
                            style={{ color: theme.colors.text, fontSize: hp(2.1) }}
                        />
                        <Input
                            placeholder="Cajas"
                            value={cajas.toString()}
                            readOnly

                            style={{ color: theme.colors.text, fontSize: hp(2.1) }}
                        />
                        <View style={styles.buttonContainer}>
                            <Button title="Mostrar" loading={loading} onPress={onSubmit} buttonStyle={[styles.buttonPadding]} />
                            <Button
                                title="Detalle Pallet"
                                buttonStyle={[styles.blueButton, styles.buttonPadding, !datosVinculados && styles.disabledButton]}
                                onPress={() => router.push({ pathname: 'menu/tabs/DetallePallet', params: { folio: folioRef.current, especie, cajas } })}
                                disabled={!datosVinculados} />
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </KeyboardAvoidingView>
            <Toast />
        </ScreenWrapper >
    );
};

export default validacion;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        gap: 20,
        paddingHorizontal: wp(5)
    },
    headerImg: {
        width: 150,
        height: 50,
        alignSelf: 'center',
    },
    welcomeText: {
        fontSize: hp(3),
        fontWeight: theme.fonts.bold,
        color: theme.colors.secondary,
        marginTop: -10,

    },
    form: {
        gap: 15,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3
    },
    footerText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6)
    },
    header: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerText: {
        color: theme.colors.primary,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    blueButton: {
        backgroundColor: 'blue'
    },
    disabledButton: {
        backgroundColor: '#cccccc',
        opacity: 0.6
    },
    buttonPadding: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
});