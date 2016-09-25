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
module.exports = router
var stablerms = require('./stableRoommate_js')
var similarity = require('../../utils').similarity
var pairing = require('../../utils').pairing
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
      var promArray = [];
      foundUsers.forEach(foundUser => {
        promArray.push(profile({
          text: foundUser.text
        }))
      })
      var prefTable = {}
      Promise.all(promArray)
        .then(profileArray => {
          foundUsers.forEach((foundUser, i) => {
            foundUser.watsonProfile = profileArray[i]
          })
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
            foundUser.dataValues.similarityArray = foundUser.dataValues.similarityArray.sort((simuserA, simuserB) => {
              return simuserB.similarity - simuserA.similarity
            })
            foundUser.dataValues.similarityNameArray = [];
            foundUser.dataValues.similarityArray.forEach((simObj) => foundUser.dataValues.similarityNameArray.push(simObj.name))
            prefTable[foundUser.name] = foundUser.dataValues.similarityNameArray
          })
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
