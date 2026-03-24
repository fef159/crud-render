const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Crear
app.post("/usuarios", async (req, res) => {
  const { nombre } = req.body;
  const result = await pool.query(
    "INSERT INTO usuarios(nombre) VALUES($1) RETURNING *",
    [nombre]
  );
  res.json(result.rows[0]);
});

// Leer
app.get("/usuarios", async (req, res) => {
  const result = await pool.query("SELECT * FROM usuarios");
  res.json(result.rows);
});

// Actualizar
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  await pool.query(
    "UPDATE usuarios SET nombre=$1 WHERE id=$2",
    [nombre, id]
  );
  res.send("Actualizado");
});

// Eliminar
app.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM usuarios WHERE id=$1", [id]);
  res.send("Eliminado");
});

app.listen(3000, () => console.log("Servidor corriendo"));