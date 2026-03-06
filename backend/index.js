const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Categories

app.get("/api/categories", async (req, res) => {
  const items = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(items);
});

app.post("/api/categories", async (req, res) => {
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ message: "El nombre es requerido." });
  try {
    const created = await prisma.category.create({
      data: { name: String(name).trim() },
    });
    res.status(201).json(created);
  } catch {
    res
      .status(409)
      .json({ message: "Ya existe una categoría con ese nombre." });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  if (!name) return res.status(400).json({ message: "Name is required." });

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: { name: String(name).trim() },
    });
    res.json(updated);
  } catch {
    res.status(404).json({ message: "Categoría no encontrada." });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ message: "Categoría no encontrada." });
  }
});

// Products

// List
app.get("/api/products", async (req, res) => {
  const items = await prisma.product.findMany({
    orderBy: { id: "desc" },
    include: { category: true },
  });
  res.json(items);
});

// Get One
app.get("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const item = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!item) return res.status(404).json({ message: "Not Found" });
  res.json(item);
});

// Create
app.post("/api/products", async (req, res) => {
  const { name, description, price, categoryId } = req.body;
  if (!name || price == undefined) {
    return res.status(400).json({ message: "Nombre y precio son requeridos." });
  }

  const created = await prisma.product.create({
    data: {
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
      price: Number(price),
      categoryId: categoryId ? Number(categoryId) : null,
    },
    include: { category: true },
  });

  res.status(201).json(created);
});

// Update
app.put("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, description, price, categoryId } = req.body;

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name === undefined ? undefined : String(name).trim(),
        description:
          description === undefined
            ? undefined
            : description
              ? String(description).trim()
              : null,
        price: price === undefined ? undefined : Number(price),
        categoryId: categoryId === undefined ? undefined : categoryId ? Number(categoryId) : null,
      },
      include: { category: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(404).json({ message: "Not Found" });
  }
});

// Delete
app.delete("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: "Not Found" });
  }
});

app.listen(4000, () => console.log("Api en http://localhost:4000"));
