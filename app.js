const express = require('express');
const { engine } = require('express-handlebars');

const app = express();

// CONFIGURACIÓN COMPLETA
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.static('public'));

// Rutas
app.get('/', (req, res) => {
    res.render('home', { titulo: 'Inicio' });
});
app.get('/horario', (req, res) => {
    res.render('horario', { titulo: 'Horario' });
});
app.get('/agenda', (req, res) => {
    res.render('agenda', { titulo: 'Agenda' });
});

app.listen(3000, () => {
    console.log('Servidor corriendo');
     console.log('Servidor en http://localhost:3000');
});