app.factory('GroupFactory', function($http){
    var homeObj = {}
    homeObj.getAllGroups = function() {
        return $http.get('/api/groups')
        .then(gotGroups => {
            return gotGroups.data
        })
    }

    return homeObj
})