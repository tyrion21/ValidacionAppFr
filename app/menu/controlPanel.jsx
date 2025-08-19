import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, StatusBar, Image, Platform, KeyboardAvoidingView, StyleSheet } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/ScreenWrapper";
import BackButton from "../../components/BackButton";
import { Dropdown } from 'react-native-element-dropdown';
import { ParametersContext } from "../../context/ParametersContext";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import { API_URL } from '@/constants/constantes'

const ControlPanel = () => {
    const { selectedFrio, setSelectedFrio, selectedCamara, setSelectedCamara } = useContext(ParametersContext);
    const [frios, setFrios] = useState([]);
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [camaras, setCamaras] = useState([]);
    const [isFocus1, setIsFocus1] = useState(false);
    const [isFocus2, setIsFocus2] = useState(false);
    const [packingData, setPackingData] = useState({
        totalFolios: 0,
        totalCajas: 0
    });
    const [validacionData, setValidacionData] = useState({
        totalFolios: 0,
        totalCajas: 0
    });
    const [desviacionData, setDesviacionData] = useState({
        totalFolios: 0,
        totalCajas: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Formato de fecha DD/MM/YYYY para SQL Server
    const formatDate = (date) => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Cargar datos cuando cambian los filtros
    useEffect(() => {
        if (selectedCamara && date) {
            fetchAllData();
        }
    }, [selectedCamara, date]);

    // Función para cargar todos los datos en paralelo
    const fetchAllData = async () => {
        try {
            if (!selectedCamara || !date) {
                console.warn('Se requiere seleccionar paletizado y fecha');
                return;
            }

            setIsLoading(true);
            const fechaFormateada = formatDate(date);
            const linea = selectedCamara;

            const requestId = Date.now();
            console.log(`[${requestId}] Iniciando solicitud con fecha=${formatDate(date)}, línea=${selectedCamara}`);

            // Codificar parámetros para URL
            const encodedFecha = encodeURIComponent(fechaFormateada);
            const encodedLinea = encodeURIComponent(linea);            // Construir URLs
            const packingUrl = `${API_URL}/validacion/cajas-packing/summary?fecha=${encodedFecha}&linea=${encodedLinea}`;
            const validacionUrl = `${API_URL}/validacion/cajas-validadas/summary?fecha=${encodedFecha}&linea=${encodedLinea}`;
            const desviacionUrl = `${API_URL}/validacion/cajas-desviaciones/summary?fecha=${encodedFecha}&linea=${encodedLinea}`;

            console.log('Consultando datos con fecha:', fechaFormateada, 'y línea:', linea);

            // Realizar todas las peticiones en paralelo para mejor rendimiento
            const [packingResponse, validacionResponse, desviacionResponse] = await Promise.all([
                fetch(packingUrl),
                fetch(validacionUrl),
                fetch(desviacionUrl)
            ]);

            const packingResult = await packingResponse.json();
            const validacionResult = await validacionResponse.json();
            const desviacionResult = await desviacionResponse.json();

            // Procesar datos de packing
            if (packingResult.success) {
                setPackingData({
                    totalFolios: packingResult.data.totalFolios || 0,
                    totalCajas: packingResult.data.totalCajas || 0
                });
            } else {
                setPackingData({ totalFolios: 0, totalCajas: 0 });
            }

            // Procesar datos de validación
            if (validacionResult.success) {
                setValidacionData({
                    totalFolios: validacionResult.data.totalFolios || 0,
                    totalCajas: validacionResult.data.totalCajas || 0
                });
            } else {
                setValidacionData({ totalFolios: 0, totalCajas: 0 });
            }

            // Procesar datos de desviación (ahora directamente del backend)
            if (desviacionResult.success) {
                setDesviacionData({
                    totalFolios: desviacionResult.data.totalFolios || 0,
                    totalCajas: desviacionResult.data.totalCajas || 0
                });
            } else {
                setDesviacionData({ totalFolios: 0, totalCajas: 0 });
            }

            setIsLoading(false);
            console.log(`[${requestId}] Solicitud completada`);
        } catch (error) {
            console.error('Error al obtener datos:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudieron cargar los datos.'
            });
            setIsLoading(false);
        }
    };

    // Manejador de cambio de fecha
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDate);
    };

    // Mostrar selector de fecha
    const showDatepicker = () => {
        setShow(true);
    };

    // Cargar cámaras cuando cambia el frigorífico
    useEffect(() => {
        if (selectedFrio) {
            fetch(`${API_URL}/camaras/${selectedFrio}`)
                .then(response => response.json())
                .then(data => setCamaras(data))
                .catch(error => console.error('Error fetching camaras:', error));
        }
    }, [selectedFrio]);

    // Manejador del botón aceptar
    const handleAccept = () => {
        if (!selectedFrio || !selectedCamara) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Debe seleccionar ambas opciones: Frigorifico y Paletizado.'
            });
            return;
        }
        router.push('/menu');
    };

    // Renderizado de etiquetas para dropdowns (actualmente no usado)
    const renderLabel = (value, isFocus) => {
        // La función está vacía por diseño, se puede implementar si es necesario
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
                    <BackButton router={router} />

                    {/* Título */}
                    <View>
                        <Text style={styles.welcomeText}>Panel de Control</Text>
                    </View>

                    {/* Contenedor para el Dropdown y el DateTimePicker */}
                    <View style={styles.controlsContainer}>
                        <View style={styles.dropdownContainer}>
                            {renderLabel(selectedCamara, isFocus2)}
                            <Dropdown
                                style={[styles.dropdown, isFocus2 && { borderColor: 'blue' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                data={camaras.map(camara => ({ label: camara.DES_CAM, value: camara.DES_CAM }))}
                                search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isFocus2 ? 'Seleccione Paletizado ' : '...'}
                                searchPlaceholder="Buscar..."
                                value={selectedCamara}
                                onFocus={() => setIsFocus2(true)}
                                onBlur={() => setIsFocus2(false)}
                                onChange={item => {
                                    setSelectedCamara(item.value);
                                    setIsFocus2(false);
                                }}
                            />
                        </View>
                        <View style={styles.dateContainer}>
                            <Button onPress={showDatepicker} title="Seleccionar fecha" />
                            {show && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={date}
                                    mode="date"
                                    is24Hour={true}
                                    display="default"
                                    onChange={onChange}
                                />
                            )}
                            <Text style={styles.dateText}>
                                {date.toLocaleDateString()}
                            </Text>
                        </View>
                    </View>

                    {/* Formulario con resultados */}
                    <View style={styles.form}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Packing</Text>
                            <View style={styles.row}>
                                <View style={[styles.card, styles.cardGreen]}>
                                    <Text style={styles.cardLabelLight}>Folio</Text>
                                    <Text style={styles.cardValueLight}>
                                        {isLoading ? '...' : packingData.totalFolios.toLocaleString()}
                                    </Text>
                                </View>
                                <View style={[styles.card, styles.cardGreen]}>
                                    <Text style={styles.cardLabelLight}>Cajas</Text>
                                    <Text style={styles.cardValueLight}>
                                        {isLoading ? '...' : packingData.totalCajas.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Validación Pallet</Text>
                            <View style={styles.row}>
                                <View style={styles.card}>
                                    <Text style={styles.cardLabelLight}>Folio</Text>
                                    <Text style={styles.cardValueLight}>
                                        {isLoading ? '...' : validacionData.totalFolios.toLocaleString()}
                                    </Text>
                                </View>
                                <View style={styles.card}>
                                    <Text style={styles.cardLabelLight}>Cajas</Text>
                                    <Text style={styles.cardValueLight}>
                                        {isLoading ? '...' : validacionData.totalCajas.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Desviación Pallet</Text>
                            <View style={styles.row}>
                                <View style={[styles.card, styles.cardOrange]}>
                                    <Text style={styles.cardLabelLight}>Folio</Text>
                                    <Text style={styles.cardValueLight}>
                                        {isLoading ? '...' : desviacionData.totalFolios.toLocaleString()}
                                    </Text>
                                </View>
                                <View style={[styles.card, styles.cardOrange]}>
                                    <Text style={styles.cardLabelLight}>Cajas</Text>
                                    <Text style={styles.cardValueLight}>
                                        {isLoading ? '...' : desviacionData.totalCajas.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Button
                            title={isLoading ? "Cargando..." : "Aceptar"}
                            onPress={handleAccept}
                            disabled={isLoading}
                        />
                    </View>
                </KeyboardAwareScrollView>
            </KeyboardAvoidingView>
            <Toast />
        </ScreenWrapper>
    );
};

export default ControlPanel;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        gap: 15,
        paddingHorizontal: wp(5)
    },
    headerImg: {
        width: 150,
        height: 100,
        alignSelf: 'center',
    },
    welcomeText: {
        fontSize: hp(3),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
        textAlign: 'center',
    },
    form: {
        gap: 8
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
    dropdown: {
        height: 50,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    icon: {
        marginRight: 5,
    },
    item: {
        padding: 17,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedTextStyle: {
        marginBottom: 8,
    },
    textSelectedStyle: {
        marginRight: 5,
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
        textAlign: 'center',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    card: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        margin: 5,
        borderRadius: 5,
        backgroundColor: '#f49f1d',
    },
    cardGreen: {
        backgroundColor: theme.colors.primary, // verde
    },
    cardOrange: {
        backgroundColor: theme.colors.rose, 
    },
    cardLabel: {
        fontSize: 16,
        color: '#333',
    },
    cardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    dateText: {
        marginTop: 5,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
    },
    dropdownContainer: {
        flex: 1,
        paddingRight: 10,
    },
    dateContainer: {
        width: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardLabelLight: {
        fontSize: 16,
        color: '#FFFFFF', // Color claro para mejor contraste con fondo naranja
    },
    cardValueLight: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF', // Color claro para mejor contraste con fondo naranja
    },
});