const express = require("express");
const cors = require("cors");
const {PrismaClient} = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// List
app.get("/api/products", async(req, res) => {
    const items = prisma.product.findMany({orderBy: {id: "desc"}});
});

// Get One
app.get("/api/products/:id", async(req, res) => {
    const id =  Number(req.params.id);
    const item = await prisma.product.findUnique({where: {id}});
    if (!item) return res.status(400).json({message: "Not Found"});
    res.json(item);
});

// Create
app.post("/api/products", async(req, res) => {
    const {name, description, price} = req.body;
    if (!name || price == undefined){
        return res.status(400).json({message: "Name and price are required."});
    }

    const created = await prisma.product.create({
        data: {
            name: String(name).trim(),
            description: description ? String(description).trim() : null,
            price: Number(price),
        },
    });

    res.status(201).json(created);
});

// Update
app.put("/api/products/:id", async(req, res) => {
    const id =  Number(req.params.id);
    const {name, description, price} = req.body;

    const updated = await prisma.product.update({
        where: {id},
        data: {
            name: name === undefined ? undefined: String(name).trim(),
            description: description === undefined ? undefined: {description} ? String(description).trim() : null,
            price: price === undefined ? undefined: Number(price),
        },
    });

    res.json(updated);
});

// Delete
app.delete("/api/products/:id", async(req, res) => {
    const id =  Number(req.params.id);

    try {
        await prisma.product.delete({where: {id}});
        res.status(204).send();
    } catch (error) {
        res.status(404).json({message: "Not Found"});
    }
});