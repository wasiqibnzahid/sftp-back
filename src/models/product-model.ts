import { Model, DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize";

export interface IProduct {
  product_id: string;
  company: string;
  available_quantity: number;
  available_next_date?: string;
  available_next_quantity?: number;
  description?: string;
  img_url?: string;
  price?: number;
}
class Product extends Model<IProduct> {}

Product.init(
  {
    product_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    available_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    available_next_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    available_next_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    img_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: false, // Assuming no createdAt or updatedAt fields
  }
);

export { Product };
