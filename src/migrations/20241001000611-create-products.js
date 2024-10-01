"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("products", {
      product_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      company: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      img_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      available_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      available_next_date: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      available_next_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      // availability_date: {
      //   type: Sequelize.STRING,
      //   allowNull: false,
      // },
      // availability_time: {
      //   type: Sequelize.TIME,
      //   allowNull: false,
      // },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("products");

    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
