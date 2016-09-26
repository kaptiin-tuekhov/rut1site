var router = require('express').Router()
var Group = require('../../../db/models/group')
module.exports = router


router.get('/:id', function(req, res, next){
	Group.findById(req.params.id)
	.then(foundGroup => res.send(foundGroup))
	.catch(next)
})

router.get('/', function(req, res, next){
  Group.findAll()
  .then(foundGroups => res.send(foundGroups))
  .catch(next)
})



