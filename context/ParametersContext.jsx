import React, { createContext, useState } from 'react';

// Crea el contexto
export const ParametersContext = createContext();

// Proveedor del contexto
export const ParametersProvider = ({ children }) => {
    const [selectedFrio, setSelectedFrio] = useState('');
    const [selectedCamara, setSelectedCamara] = useState('');
    
    // Función para reiniciar el contexto
    const resetParameters = () => {
        setSelectedFrio('');
        setSelectedCamara('');
    };

    return (
        <ParametersContext.Provider value={{ 
            selectedFrio, 
            setSelectedFrio, 
            selectedCamara, 
            setSelectedCamara,
            resetParameters
        }}>
            {children}
        </ParametersContext.Provider>
    );
};