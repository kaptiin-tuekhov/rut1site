app.config(function($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        resolve: {
            groups: function(GroupFactory) {
                return GroupFactory.getAllGroups()
            }
        },
        controller: function(groups, $scope, UserFactory) {
            $scope.groups = groups

            function parsePosts(user) {
                var posts = '';
                user.data.forEach(post => {
                    if (post.message) posts += post.message + '.';
                })
                return posts
            }
            $scope.postUser = function() {
                $scope.user.groupId = 1
                $scope.user.text = $scope.user.text.replace(/\n/g, '')
                var text = JSON.parse($scope.user.text)
                $scope.user.text = parsePosts(text)
                UserFactory.createUser($scope.user)
                    .then(() => $scope.submitted = true)
            }
        }
    });
});