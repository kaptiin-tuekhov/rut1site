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
      // create array of promises returned by watson personality analysis of each user
      var promArray = [];
      foundUsers.forEach(foundUser => {
        promArray.push(profile({
          text: foundUser.text
        }))
      })

      // add watson profiles to user objects
      var prefTable = {}
      Promise.all(promArray)
        .then(profileArray => {
          foundUsers.forEach((foundUser, i) => {
            foundUser.watsonProfile = profileArray[i]
          })

          // determine similarity between users
          foundUsers.forEach(foundUser => {
            foundUser.dataValues.similarityArray = [];
            for (var index = 0; index < foundUsers.length; index++) {
              var simuser = foundUsers[index];
              if (foundUser.name !== simuser.name) {
                var sim = similarity(foundUser.watsonProfile, simuser.watsonProfile, 1)
                foundUser.dataValues.similarityArray.push({
                  name: simuser.name,
                  similarity: sim
                })
              }
            }

            foundUser.dataValues.similarityArray = _.chain(foundUser.dataValues.similarityArray)
              .sort((simuserA, simuserB) => simuserB.similarity - simuserA.similarity)
              .map(similarityObj => similarityObj.name)
              .value();

            prefTable[foundUser.name] = foundUser.dataValues.similarityArray;
          })

          // run stable roommates algorithm on pref table created via watson + similarity comparison
          var results = pairing(prefTable)
          var resultsJSON = {}
          for (var index = 0; index < results.length; index++) {
            var pair = results[index];
            resultsJSON[index] = pair.join(' + ')
          }
          res.send(resultsJSON)
        })
    })
    .catch(next)
})
