'use strict';
var db = require('./_db');
module.exports = db;

// eslint-disable-next-line no-unused-vars
var User = require('./models/user');
var Group = require('./models/group')
// if we had more models, we could associate them in this file
// e.g. User.hasMany(Reports)
Group.hasMany(User)
User.belongsTo(Group)
