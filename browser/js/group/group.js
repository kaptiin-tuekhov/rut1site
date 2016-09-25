app.config(function($stateProvider) {
  $stateProvider
    .state('groupMembers', {
      url: '/group/:groupId',
      templateUrl: 'js/group/group.html',
      resolve: {
        group: function(UserFactory, $stateParams) {
          return UserFactory.getGroupUsers($stateParams.groupId)
        }
      },
      controller: function(group, $scope) {
        console.log(group)
        $scope.group = group;
      }
    })
})
