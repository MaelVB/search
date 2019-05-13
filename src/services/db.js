'use strict';

const Sequelize = require('sequelize');
const databaseName = process.env.DB_NAME;
const userName = process.env.DB_USER_NAME;
const userPass = process.env.DB_USER_PASS;
const databaseHost = process.env.DB_HOST;
const sequelize = new Sequelize(databaseName, userName, userPass, {
  host: databaseHost,
  dialect: 'mysql'
});

async function DB() {
  try {
    const connection = await connect();
    console.log(connection);
  } catch (e) {
    console.log(e);
  }
}

// function selectSites() {
//   sequelize.query("SELECT * FROM `sites`", { type: sequelize.QueryTypes.SELECT })
//     .then(sites => {
//       console.log(sites);
//     })
// }

module.exports = sequelize;