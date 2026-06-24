// interprete.js

// ==============================================================================
// 1. ANALIZADOR LÉXICO (Scanner)
// Convierte el flujo de caracteres (texto) en un flujo de Tokens.
// ==============================================================================
function analizadorLexico(codigoFuente) {
    const tokens = [];
    
    // Esta Expresión Regular es nuestro "Autómata Finito" que reconoce:
    // 1. Palabras reservadas (AGREGAR|ELIMINAR|MOSTRAR)
    // 2. Cadenas de texto entre comillas dobles
    // 3. Símbolos especiales: (, ), , y ;
    const regex = /\s*(AGREGAR|ELIMINAR|MOSTRAR|"([^"]*)"|\(|\)|,|;)\s*/g;
    let match;

    while ((match = regex.exec(codigoFuente)) !== null) {
        if (match[1] === 'AGREGAR' || match[1] === 'ELIMINAR' || match[1] === 'MOSTRAR') {
            tokens.push({ tipo: 'RESERVADA', valor: match[1] });
        } else if (match[1] === '(') {
            tokens.push({ tipo: 'PAREN_IZQ', valor: '(' });
        } else if (match[1] === ')') {
            tokens.push({ tipo: 'PAREN_DER', valor: ')' });
        } else if (match[1] === ',') {
            tokens.push({ tipo: 'COMA', valor: ',' });
        } else if (match[1] === ';') {
            tokens.push({ tipo: 'PUNTO_COMA', valor: ';' });
        } else if (match[1].startsWith('"')) {
            // Guardamos el contenido de la cadena sin las comillas (match[2])
            tokens.push({ tipo: 'CADENA', valor: match[2] }); 
        } else {
            throw new Error(`Error Léxico: Símbolo no reconocido cerca de '${match[0]}'`);
        }
    }
    return tokens;
}

// ==============================================================================
// 2. ANALIZADOR SINTÁCTICO (Parser)
// Verifica que el orden de los tokens cumpla con la Gramática Libre de Contexto (BNF).
// ==============================================================================
function analizadorSintactico(tokens) {
    let posicion = 0;
    let arbolDeInstrucciones = []; // Ahora devolvemos un arreglo de instrucciones

    function obtenerTokenActual() {
        return tokens[posicion];
    }

    // Función auxiliar para "consumir" tokens si coinciden con lo esperado
    function coincidir(tipoEsperado) {
        let token = obtenerTokenActual();
        if (token && token.tipo === tipoEsperado) {
            posicion++;
            return token;
        } else {
            let encontrado = token ? token.tipo : 'Fin de archivo';
            throw new Error(`Error Sintáctico: Se esperaba ${tipoEsperado} pero se encontró ${encontrado}`);
        }
    }

    // Bucle para procesar múltiples instrucciones (ej. MOSTRAR(); ELIMINAR("POO");)
    while (posicion < tokens.length) {
        let nodoInstruccion = {};
        
        let comando = coincidir('RESERVADA');
        nodoInstruccion.accion = comando.valor;
        
        coincidir('PAREN_IZQ');

        // Construcción del Árbol de Sintaxis Abstracta (AST) según el comando
        if (comando.valor === 'AGREGAR') {
            let materia = coincidir('CADENA');
            coincidir('COMA'); // Exigimos la coma que separa los parámetros
            let profesor = coincidir('CADENA'); 
            nodoInstruccion.parametros = { materia: materia.valor, profesor: profesor.valor };
        } 
        else if (comando.valor === 'ELIMINAR') {
            let materia = coincidir('CADENA');
            nodoInstruccion.parametros = { materia: materia.valor };
        }
        else if (comando.valor === 'MOSTRAR') {
            // MOSTRAR() no recibe parámetros dentro de los paréntesis
            nodoInstruccion.parametros = {};
        }

        coincidir('PAREN_DER');
        coincidir('PUNTO_COMA');

        arbolDeInstrucciones.push(nodoInstruccion);
    }

    return arbolDeInstrucciones; // Devolvemos el árbol validado
}

// ==============================================================================
// 3. ANALIZADOR SEMÁNTICO Y EJECUCIÓN (Intérprete)
// Verifica el significado (ej. ¿Existe la materia?) y ejecuta la acción en la BD.
// ==============================================================================
async function ejecutarInstruccion(arbolDeInstrucciones, usuario_id, db) {
    const dbPromise = db.promise();
    let resultados = []; // Guardaremos el resultado de cada instrucción

    // Procesamos cada instrucción validada en el árbol sintáctico
    for (let instruccion of arbolDeInstrucciones) {
        
        // --- COMANDO AGREGAR ---
        if (instruccion.accion === 'AGREGAR') {
            const { materia, profesor } = instruccion.parametros;
            
            // Análisis Semántico: Verificar que no haya duplicados
            const [filas] = await dbPromise.query('SELECT * FROM materias WHERE usuario_id = ? AND nombre = ?', [usuario_id, materia]);
            if (filas.length > 0) {
                throw new Error(`Error Semántico: La materia '${materia}' ya está registrada.`);
            }

            // Ejecución
            await dbPromise.query('INSERT INTO materias (usuario_id, nombre, profesor, color) VALUES (?, ?, ?, ?)', 
                           [usuario_id, materia, profesor, '#007bff']); // Azul por defecto
            resultados.push(`✅ Éxito: Materia '${materia}' agregada correctamente.`);
        }
        
        // --- COMANDO ELIMINAR ---
        else if (instruccion.accion === 'ELIMINAR') {
            const { materia } = instruccion.parametros;
            
            // Análisis Semántico: Verificar que la materia exista antes de borrarla
            const [filas] = await dbPromise.query('SELECT id FROM materias WHERE usuario_id = ? AND nombre = ?', [usuario_id, materia]);
            if (filas.length === 0) {
                throw new Error(`Error Semántico: No puedes eliminar '${materia}' porque no existe en tu agenda.`);
            }

            // Ejecución
            await dbPromise.query('DELETE FROM materias WHERE id = ?', [filas[0].id]);
            resultados.push(`🗑️ Éxito: Materia '${materia}' eliminada.`);
        }

        // --- COMANDO MOSTRAR ---
        else if (instruccion.accion === 'MOSTRAR') {
            // Análisis Semántico: No hay validación especial, solo ejecutar.
            // Ejecución: Obtenemos las materias del usuario
            const [filas] = await dbPromise.query('SELECT nombre, profesor FROM materias WHERE usuario_id = ? ORDER BY nombre ASC', [usuario_id]);
            
            if (filas.length === 0) {
                resultados.push("ℹ️ MOSTRAR: Tu agenda está vacía, no hay materias registradas.");
            } else {
                let listaMaterias = "📚 TUS MATERIAS: ";
                filas.forEach(fila => {
                    listaMaterias += `[${fila.nombre} con ${fila.profesor}] `;
                });
                resultados.push(listaMaterias);
            }
        }
    }

    // Si se ejecutaron varias instrucciones, unimos los resultados en un solo texto
    return resultados.join(' | '); 
}

// Exportar las funciones para usarlas en app.js
module.exports = {
    analizadorLexico,
    analizadorSintactico,
    ejecutarInstruccion
};