app.config(function($stateProvider) {
  $stateProvider
    .state('groupMembers', {
      url: '/group/:groupId',
      templateUrl: 'js/group/group.html',
      resolve: {
        groupUsers: function(UserFactory, $stateParams) {
          return UserFactory.getGroupUsers($stateParams.groupId)
        },
        group: function(GroupFactory, $stateParams){
          return GroupFactory.getOne($stateParams.groupId)
        }
      },
      controller: function(group, groupUsers, $scope) {
        $scope.groupUsers = groupUsers;
        $scope.group = group;
      }
    })
})