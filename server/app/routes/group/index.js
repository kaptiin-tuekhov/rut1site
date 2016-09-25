var router = require('express').Router()
var Group = require('../../../db/models/group')
module.exports = router

router.get('/', function(req, res, next){
  Group.findAll()
  .then(foundGroups => res.send(foundGroups))
  .catch(next)
})

