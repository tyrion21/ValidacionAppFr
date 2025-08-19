import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { useContext, React } from 'react'
import Icon from '../assets/icons'
import { theme } from '../constants/theme'
import { wp, hp } from '../helpers/common'
import { ParametersContext } from '../context/ParametersContext'
import { useRouter } from 'expo-router'

const Menu = () => {

    const router = useRouter();
    const { selectedFrio, setSelectedFrio, selectedCamara, setSelectedCamara, resetParameters } = useContext(ParametersContext);

    const handleLogout = () => {
        // Lógica para cerrar sesión
        console.log('Cerrar sesión');
        
        // Utilizar la función del contexto para limpiar todo
        if (resetParameters) {
            resetParameters();
        } else {
            // Fallback en caso de que no exista la función
            setSelectedFrio('');
            setSelectedCamara('');
        }
        
        // Usar setTimeout para asegurar que el contexto se actualice antes de navegar
        setTimeout(() => {
            // Navegar a welcome en lugar de directamente a login para restablecer el flujo
            router.replace('/welcome');
        }, 100);
    };

    const handleValidation = () => {
        // Redirigir a la pantalla de validación
        router.push('/menu/validacion');
    }

    const handlePanel = () => {
        // Redirigir a la pantalla de validación
        router.push('/menu/controlPanel');
    }

    const handleReport = () => {
        // Redirigir a la pantalla de validación
        router.push('/menu/report');
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>MENU</Text>
            <View style={styles.cardsContainer}>
                <TouchableOpacity style={[styles.card, { backgroundColor: '#FFCDD2' }]} onPress={handlePanel}>
                    <Icon name="home" size={hp(5)} />
                    <Text style={styles.cardText}>Panel de Control</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.card, { backgroundColor: '#C8E6C9' }]} onPress={handleValidation}>
                    <Icon name="camera" size={hp(5)} />
                    <Text style={styles.cardText}>Validación</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.card, { backgroundColor: '#BBDEFB' }]} onPress={handleReport}>
                    <Icon name="share" size={hp(5)} />
                    <Text style={styles.cardText}>Informe</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.card, { backgroundColor: '#FFECB3' }]} onPress={handleLogout}>
                    <Icon name="logout" size={hp(5)} />
                    <Text style={styles.cardText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Menu

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: wp(4),
    },
    title: {
        fontSize: hp(5),
        textAlign: 'center',
        color: theme.colors.text,
        fontWeight: 'bold',
        marginBottom: hp(3),
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        width: '100%',
    },
    card: {
        width: wp(40),
        height: hp(20),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        margin: wp(2),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    cardText: {
        marginTop: hp(1),
        fontSize: hp(2),
        color: theme.colors.text,
        textAlign: 'center',
    },
})