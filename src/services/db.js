import { connect } from 'net';

'use strict';

const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_UR); //'postgres://user:pass@example.com:5432/dbname'


async function DB() {
  try {
    const connection = await connect();
    console.log(connection);
  } catch (e) {
    console.log(e);
  }
}

function connect() {
  const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');
}
/*
// http://docs.sequelizejs.com/manual/getting-started.html
// Option 1: Passing parameters separately

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: // one of 'mysql' | 'mariadb' | 'postgres' | 'mssql'
});

// Option 2: Using a connection URI
const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');
*/
module.exports = sequelize;