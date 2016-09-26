app.factory('GroupFactory', function($http){
    var homeObj = {}
    homeObj.getAllGroups = function() {
        return $http.get('/api/groups')
        .then(gotGroups => {
            return gotGroups.data
        })
    }

    homeObj.getOne = function(id) {
    	return $http.get('/api/groups/' + id)
    	.then(foundGroup => {
    		return foundGroup.data
    	})
    }

    return homeObj
})