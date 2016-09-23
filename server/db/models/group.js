var Sequelize = require('sequelize');
var db = require('../_db');
module.exports = db.define('group', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
})