app.factory('UserFactory', function($http){
    var userObj = {}
    userObj.createUser = function(data) {
        return $http.post('/api/users', data)
        .then(res => {
            return res.data
        })
    }
    userObj.getGroupUsers = function(groupId, categoryId) {
        return $http.get('/api/users/' + groupId + '/' + categoryId)
        .then(res => {
            return res.data
        })
    }

    return userObj
})
