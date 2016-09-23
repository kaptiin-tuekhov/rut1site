var router = require('express').Router()
var User = require('../../../db/models/user')
module.exports = router

router.post('/', function(req, res, next){
  User.create(req.body)
  .then(createdUser => res.send(createdUser))
  .catch(next)
})
