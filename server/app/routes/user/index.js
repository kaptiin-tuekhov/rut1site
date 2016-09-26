var router = require('express').Router()
var User = require('../../../db/models/user')
var watson = require('watson-developer-cloud')
var personalityInsights = watson.personality_insights({
  password: "ee5kIUt0cuwr",
  username: "225a4e90-13e6-417b-a6c9-a7343fda82d5",
  version: 'v2'
})
var Promise = require("bluebird");
var profile = Promise.promisify(personalityInsights.profile, {
  context: personalityInsights
})
var stablerms = require('./stableRoommate_js')
var similarity = require('../../utils').similarity
var pairing = require('../../utils').pairing
var _ = require('lodash')



module.exports = router

router.post('/', function(req, res, next) {
  User.create(req.body)
    .then(createdUser => res.send(createdUser))
    .catch(next)
})

router.get('/:groupId', function(req, res, next) {
  User.findAll({
      where: {
        groupId: req.params.groupId
      }
    })
    .then(foundUsers => {
      // create array of promises that resolve to watson personality analysis of each user
      var promArray = [];
      _.each(foundUsers, user => {
        promArray.push(profile({text: user.text}))
      })

      // run watson personality insights and set up preference table for matching users based on personality similarity
      var prefTable = {};
      Promise.all(promArray)
        .then(profiles => {
          // add watson profiles to user objects
          _.each(foundUsers, (user, index) => {
            user.watsonProfile = profiles[index];
          })

          // similarity analysis -> compare each user's personality to all other users' personalities and store results
          _.each(foundUsers, user => {
            user.dataValues.prefs = [];

            _.each(foundUsers, (otherUser) => {
              if (user.name !== otherUser.name){
                user.dataValues.prefs.push({
                  name: otherUser.name,
                  similarity: similarity(user.watsonProfile, otherUser.watsonProfile, 1)
                })
              }
            })

            // sort similarity results & add to preference table
            user.dataValues.prefs = _.chain(user.dataValues.prefs)
              .sort((userA, userB) => userB.similarity - userA.similarity)
              .map(similarityObj => similarityObj.name)
              .value();

            prefTable[user.name] = user.dataValues.prefs;
          })

          // run stable roommates algorithm on pref table created via watson + similarity comparison
          res.send(pairing(prefTable).map(pair => pair[0] + " + " + pair[1]))
        })
    })
    .catch(next)
})
