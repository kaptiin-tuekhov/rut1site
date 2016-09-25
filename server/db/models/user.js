'use strict';
var Sequelize = require('sequelize');
var watson = require('watson-developer-cloud')
var db = require('../_db');
var personalityInsights = watson.personality_insights({
  password: "ee5kIUt0cuwr",
  username: "225a4e90-13e6-417b-a6c9-a7343fda82d5",
  version: 'v2'
})
var Promise = require("bluebird");
var profile = Promise.promisify(personalityInsights.profile, {context: personalityInsights})

module.exports = db.define('user', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    text: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    watsonProfile: {
        type: Sequelize.JSON
    }
}, {
    hooks: {
        afterCreate: function(user) {
            return profile({text: user.text})
            .then(resolvedProfile => {
                user.watsonProfile = resolvedProfile
                console.log(user.watsonProfile)
            })
            .catch(err => console.log(err))
        }
    }
})

