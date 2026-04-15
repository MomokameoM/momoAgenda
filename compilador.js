const db = require('./db/db'); 
const horario = [];

async function procesarLinea(linea, usuario_id) {
  if (linea === "") return "";

  // AGREGAR
  let match = linea.match(/^AGREGAR\("(.+?)","(.+?)"\);$/);
  if (match) {
    const [, nombre, profesor] = match;

    const [existe] = await db.promise().query(
    "SELECT * FROM materias WHERE nombre = ? AND usuario_id = ?",
    [nombre, usuario_id]
    );

    if (existe.length > 0) {
    return `Error: la materia "${nombre}" ya existe`;
    }


    try {
        await db.promise().query(
            "INSERT INTO materias (usuario_id, nombre, profesor) VALUES (?, ?, ?)",
            [usuario_id, nombre, profesor]
        );
        return `✔ Agregado: ${nombre}`;
        } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return `Error: la materia "${nombre}" ya existe`;
        }
        return "Error en base de datos";
    }

  }

  // ELIMINAR
  match = linea.match(/^ELIMINAR\("(.+?)"\);$/);
  if (match) {
    const [, nombre] = match;

    const [result] = await db.promise().query(
      "DELETE FROM materias WHERE nombre = ? AND usuario_id = ?",
      [nombre, usuario_id]
    );

    if (result.affectedRows === 0) {
      return "No existe la materia";
    }

    return `Eliminado correctamente: ${nombre}`;
  }

  // MOSTRAR
  if (/^MOSTRAR\(\);$/.test(linea)) {
    const [rows] = await db.promise().query(
      "SELECT nombre, profesor, color FROM materias WHERE usuario_id = ?",
      [usuario_id]
    );

    return rows
  .map(r => `* ${r.nombre} - ${r.profesor} (${r.color})`)
  .join("\n");
  }

  return "Error sintáctico";
}

module.exports = { procesarLinea };