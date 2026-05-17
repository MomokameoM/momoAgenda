const mysql = require('mysql2');

// conexión
const connection = mysql.createConnection({/*
  host: 'localhost',
  user: 'root',
  password: 'momo',
  database: 'momoAgenda'*/
  host: 'zj2x67aktl2o6q2n.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user: 'oiu1k0ag19b1z2nb',
  password: 'x4tjv25abzi5b4bj',
  database: 'u601ae9j9854yz56'
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