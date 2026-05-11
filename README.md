# 📚 Momo Agenda Escolar

Aplicación web desarrollada con Node.js, Express, Handlebars, sesiones y MySQL para la gestión de tareas y actividades escolares.

---

# 📌 Descripción

Este proyecto consiste en una agenda escolar web donde los usuarios pueden:

✅ Registrarse e iniciar sesión 
✅ Tener un horario registrado
✅ Gestionar tareas escolares  
✅ Organizar actividades por fecha  
✅ Mantener sesiones activas  
✅ Administrar información almacenada en MySQL  

La aplicación está orientada a estudiantes y docentes que necesiten una plataforma sencilla para el control de actividades académicas.

---

# 🚀 Tecnologías utilizadas

- Node.js
- Express
- Handlebars
- MySQL
- express-session
- bcryptjs
- HTML5
- CSS3
- JavaScript

---

# 📂 Estructura del proyecto

---

# ⚙️ Instalación

## 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/MomokameoM/momoAgenda
```

---

## 2️⃣ Entrar al proyecto

```bash
cd momoAgenda
```

---

## 3️⃣ Instalar dependencias

```bash
npm install
```

---

## 4️⃣ Configurar variables de entorno

Editar archivo `db.js` por los datos de su instalacion de mySQL

```db
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'momo',
  database: 'momoAgenda'
});
```

---

## 5️⃣ Importar la base de datos

Ejecutar el archivo:

```txt
database/db.sql
```

en MySQL.

---

## 6️⃣ Ejecutar el proyecto

```bash
node app.js 
```

---

# 🔐 Funcionalidades

- Inicio de sesión
- Registro de usuarios
- Manejo de sesiones
- CRUD de tareas
- Protección de rutas
- Base de datos MySQL
- Plantillas dinámicas con Handlebars

---

# 🖼️ Capturas del sistema

## 🔑 Login


---

## 🏠 Panel principal


---

## 📝 Gestión de tareas



---

# 📚 Objetivo del proyecto

Desarrollar una aplicación web que permita mejorar la organización escolar mediante el registro y administración de actividades académicas utilizando tecnologías backend y bases de datos relacionales.

---

# 🔮 Mejoras futuras

- Calendario interactivo
- Notificaciones
- Roles de usuario
- Recuperación de contraseña
- Subida de archivos
- Diseño responsive
- API REST
- Implementación con JWT

---

# 👨‍💻 Autor

Desarrollado por Murphy Alexander

---

# 📄 Licencia

Este proyecto fue desarrollado con fines educativos.
