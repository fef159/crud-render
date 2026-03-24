const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();
app.use(express.json());

// 🔥 SERVIR ARCHIVOS HTML
app.use(express.static(path.join(__dirname, "public")));

// 🔥 FORZAR QUE "/" ABRA index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

// 🔹 CONEXIÓN A POSTGRESQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 🔹 CREAR TABLA AUTOMÁTICAMENTE
pool.query(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre TEXT
  );
`)
.then(() => console.log("Tabla usuarios lista"))
.catch(err => console.error("Error creando tabla:", err));


// 🔹 CREAR usuario
app.post("/usuarios", async (req, res) => {
  try {
    const { nombre } = req.body;

    const result = await pool.query(
      "INSERT INTO usuarios(nombre) VALUES($1) RETURNING *",
      [nombre]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// 🔹 LEER usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.json(result.rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// 🔹 ACTUALIZAR usuario
app.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    await pool.query(
      "UPDATE usuarios SET nombre=$1 WHERE id=$2",
      [nombre, id]
    );

    res.send("Usuario actualizado");
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// 🔹 ELIMINAR usuario
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM usuarios WHERE id=$1", [id]);

    res.send("Usuario eliminado");
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// 🚀 INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});