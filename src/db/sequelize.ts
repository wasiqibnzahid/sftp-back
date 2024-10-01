// src/db/sequelize.ts
import path from "path";
import { Sequelize } from "sequelize-typescript";
// import { Product } from "../models/product-model";
console.log("IT IS ", __dirname)
export const sequelize = new Sequelize({
  dialect: "sqlite",
storage: path.join(__dirname, "database.sqlite"),
});
