const mysql = require('mysql2');

// conexión
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'momo',
  database: 'momoAgenda'
});

// conectar
connection.connect(err => {
  if (err) {
    console.error('Error de conexión:', err);
    return;
  }
  console.log('Conectado a MySQL');
});

module.exports = connection;