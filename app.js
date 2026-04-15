const express = require('express');
const db = require('./db/db');//db.js
/*-----------HASHEO----------- */
const bcrypt = require('bcrypt');

/*-----------HANDLEBARS----------- */
//const { engine } = require('express-handlebars');
const exphbs = require('express-handlebars');

/*-----------SESIÓN----------- */
const session = require('express-session');

/*-----------COMPILADOR MODOSCRIPT----------- */
const { procesarLinea } = require("./compilador");

/*------INICIALIZACIÓN----------- */
const app = express();


// CONFIGURACIÓN COMPLETA
app.engine('hbs', exphbs.engine({extname: '.hbs'}));

app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.static('public'));
//DB
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// SESIÓN
app.use(session({
    secret: 'momo',//secreto para firmar la cookie de sesión
    resave: false,
    saveUninitialized: false
}));

//verificamos si el usuario está logueado
app.use((req, res, next) => {
    res.locals.loggedIn = req.session.userId ? true : false;
    next();
});

// Middleware de autenticación
app.use((req, res, next) => {
    res.locals.loggedIn = !!req.session.userId;
    res.locals.username = req.session.username;
    res.locals.isAdmin = req.session.rol === 'admin';
    next();
});

// Middleware para proteger rutas, solo accesibles si el usuario está logueado
function auth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

//caso contrario, para evitar que un usuario logueado acceda a login o registro
function guest(req, res, next) {
    if (!req.session.userId) {
        next(); // No está logueado, puede acceder
    } else {
        res.redirect('/horario'); // ya está logueado lo sacamos
    }
}


// Middleware para proteger rutas solo para admin
function admin(req, res, next) {
    if (req.session.userId && req.session.rol === 'admin') {
        next();
    } else {
        res.send("Acceso denegado");
    }
}



/*---------------- VISTA PARA INICIO----------------- */
app.get('/', guest,(req, res) => {
    res.render('home', { titulo: 'Inicio' });
});
//---------------- VISTA PARA TABLA HORARIO-----------------

app.get('/horario', auth, (req, res) => {
  const usuario_id = req.session.userId;

  const query = `
    SELECT m.nombre, m.color, m.profesor, h.dia, h.hora_inicio, h.hora_fin
    FROM horarios h
    JOIN materias m ON h.materia_id = m.id
    WHERE m.usuario_id = ?
    ORDER BY h.dia, h.hora_inicio
  `;

  db.query(query, [usuario_id], (err, results) => {
    if (err) throw err;console.log(results);

    const dias = ['Lunes','Martes','Miercoles','Jueves','Viernes'];

    let horas = [];
    for (let i = 7; i <= 14; i++) {
      horas.push(`${i.toString().padStart(2,'0')}:00:00`);
    }

    let tabla = {};

    // inicializar
    horas.forEach(hora => {
      tabla[hora] = {};
      dias.forEach(dia => {
        tabla[hora][dia] = { materia: null, rowspan: 1, mostrar: true };
      });
    });

    // llenar datos
    results.forEach(item => {
      const dia = item.dia;

      let inicio = parseInt(item.hora_inicio.split(':')[0]);
      let fin = parseInt(item.hora_fin.split(':')[0]);

      let duracion = fin - inicio;

      let horaInicioKey = `${inicio.toString().padStart(2,'0')}:00:00`;

      // seguridad (evita errores si algo no coincide)
      if (!tabla[horaInicioKey] || !tabla[horaInicioKey][dia]) return;

      tabla[horaInicioKey][dia] = {
        materia: item.nombre,
        color: item.color,
        profesor: item.profesor,
        rowspan: duracion,
        mostrar: true
      };

      for (let i = inicio + 1; i < fin; i++) {
        let horaKey = `${i.toString().padStart(2,'0')}:00:00`;

        if (tabla[horaKey] && tabla[horaKey][dia]) {
          tabla[horaKey][dia] = {
            materia: null,
            rowspan: 0,
            mostrar: false
          };
        }
      }console.log(item.dia);
    });

    let filas = [];

      horas.forEach(hora => {
        let fila = {
          hora,
          dias: []
        };

        dias.forEach(dia => {
          fila.dias.push(tabla[hora][dia]);
        });

        filas.push(fila);
      });
      
      res.render('horario', {
        dias,
        filas
      });
  });
});


//---------------- VISTA PARA TABLA AGENDA-----------------
app.get('/agenda', auth, (req, res) => {
    const usuario_id = req.session.userId;

  db.query(
    `SELECT t.*, m.nombre AS materia
     FROM tareas t
     JOIN materias m ON t.materia_id = m.id
     WHERE t.usuario_id = ?
     ORDER BY t.fecha_entrega`,
    [usuario_id],
    (err, results) => {
      if (err) throw err;
      res.render('agenda', { titulo: 'Agenda', agenda: results });
    }
  );
});
//---------------- VISTA PARA TABLA MATERIAS-----------------
app.get('/materias', auth, (req, res) => {
    const usuario_id = req.session.userId;
    db.query(
    'SELECT * FROM materias WHERE usuario_id = ?', [usuario_id],
    (err, results) => {
      if (err) throw err;
      res.render('materias', { titulo: 'Materias', materias: results });
    }
  );
});
//--------------------------- VISTA PARA ADMIN------------------------
app.get('/admin', admin, (req, res) => {
    res.render('admin', { titulo: 'Panel de Administración' });
});

app.get('/admin/usuarios', admin, (req, res) => {
    db.query('SELECT id, nombre, email, rol FROM usuarios', (err, results) => {
        if (err) throw err;
        res.render('admin/admin_usuarios', { titulo: 'Gestionar Usuarios', usuarios: results });
    });
});

app.get('/admin/modoscript', admin, (req, res) => {
    res.render('admin/modoscript', { titulo: 'Gestionar Modoscript' });
});

app.post("/compilar", async (req, res) => {
  const codigo = req.body.codigo.split("\n");
  let resultado = "";

  const usuario_id =  req.session.userId; // o como lo manejes

  for (let i = 0; i < codigo.length; i++) {
    const resLinea = await procesarLinea(codigo[i].trim(), usuario_id);
    resultado += `Linea ${i + 1}: ${resLinea}\n`;
  }

  res.render("admin/modoscript", { resultado });
});

//--------------------------- VISTA PARA LOGIN------------------------
app.get('/login', guest, (req, res) => {
    res.render('login', { titulo: 'Login' });
});
/*------POST INICIO SESION DE USUARIOS------ */
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM usuarios WHERE nombre = ?';

    db.query(query, [username], async (err, results) => {
        if (err) {
            console.log(err);
            return res.send("Error");
        }

        if (results.length === 0) {
            return res.send("Usuario no existe");
        }

        const user = results[0];

        // Comparar contraseña
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // Login correcto
            req.session.userId = user.id;
            req.session.username = user.nombre;
            req.session.rol = user.rol;
            if (user.rol === 'admin') {
                return res.redirect('/admin'); // Redirige a panel admin
            }else {
                return res.redirect('/horario'); // Redirige a horario
            }
            
        } else {
            res.send("Contraseña incorrecta");
        }
    });
});
//---------------------------------- VISTA PARA REGISTRO---------------------------
app.get('/registro', guest, (req, res) => {
    res.render('registro', { titulo: 'Registro' });
});
/*------POST REGISTRO DE USUARIOS------ */
app.post('/registro', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 💾 Guardar en MySQL
        const query = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';
        
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.log(err);
                return res.send("Error al registrar");
            }

            res.redirect('/login');
        });

    } catch (error) {
        console.log(error);
        res.send("Error en servidor");
    }
});

/*-------------------CERRAR SESIÓN--------------------- */
app.get('/logout', auth, (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

/*-----------INICIAR SERVIDOR----------- */
app.listen(3000, () => {
    console.log('Servidor corriendo');
     console.log('Servidor en http://localhost:3000');
});
