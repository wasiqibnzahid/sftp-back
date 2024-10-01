// src/app.ts
import express, { Request, Response } from "express";
// import { Product } from "./models/product-model";

import { sequelize } from "./db/sequelize";
import { downloadAndProcessFiles } from "./sftp/process-data";
import { Product } from "./models/product-model";
import { Op } from "sequelize";
import cors from "cors";
const app = express();
const port = 3000;

app.use(
  cors({
    origin: "*",
  })
);
// cron.schedule("0 * * * *", downloadAndProcessFiles);
// Express route to retrieve product information by product_id
app.get("/product/:product_id", async (req: Request, res: Response) => {
  const { product_id } = req.params;

  try {
    const product = await Product.findAll({ where: { product_id } });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Database query failed", error });
  }
});
app.get("/", async (req: Request, res: Response) => {
  try {
    const product = await Product.findAll({
      where: {
        img_url: { [Op.ne]: null },
        description: { [Op.ne]: null },
        available_next_date: { [Op.ne]: "" },
      },
      limit: 8,
    });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Database query failed", error });
  }
});

app.listen(port, async () => {
  // Ensure DB connection
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    const products = await Product.findAll({
      attributes: ["product_id"], // Fetch only the product_id
      group: ["product_id"], // Group by product_id
      having: sequelize.literal("COUNT(company) > 2"), // Filter for product_ids that have more than one company
      limit: 3,
    });
    console.log(products.map((item) => item.dataValues));
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  console.log(`Server is running on port ${port}`);
});
