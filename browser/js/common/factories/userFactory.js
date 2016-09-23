app.factory('UserFactory', function($http){
    var userObj = {}
    userObj.createUser = function(data) {
        return $http.post('/api/users', data)
        .then(res => {
            return res.data
        })
    }

    return userObj
})