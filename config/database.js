const fs = require('fs');

module.exports ={
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "dialect": "postgres",
    "logging": true,
    "pool": {
         "max": 5,
         "min": 0,
         "acquire": 30000,
         "idle": 10000
    },
    'migrationStorageTableName': 'sequelize_meta'
  },
  "test": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "dialect": "postgres",
    'migrationStorageTableName': 'sequelize_meta'


  },
  "production": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "dialect": "postgres",
    'migrationStorageTableName': 'sequelize_meta'

  }
}
