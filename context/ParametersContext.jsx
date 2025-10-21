import React, { createContext, useState } from 'react';

// Crea el contexto
export const ParametersContext = createContext();

// Proveedor del contexto
export const ParametersProvider = ({ children }) => {
    const [selectedFrio, setSelectedFrio] = useState('');
    const [selectedCamara, setSelectedCamara] = useState('');
    const [loggedUser, setLoggedUser] = useState('');

    // Función para reiniciar el contexto
    const resetParameters = () => {
        setSelectedFrio('');
        setSelectedCamara('');
        setLoggedUser('');
    };

    return (
        <ParametersContext.Provider value={{
            selectedFrio,
            setSelectedFrio,
            selectedCamara,
            setSelectedCamara,
            loggedUser,
            setLoggedUser,
            resetParameters
        }}>
            {children}
        </ParametersContext.Provider>
    );
};