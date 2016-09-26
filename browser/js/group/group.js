app.config(function($stateProvider) {
  $stateProvider
    .state('groupMembers', {
      url: '/group/:groupId/:categoryId',
      templateUrl: 'js/group/group.html',
      resolve: {
        groupUsers: function(UserFactory, $stateParams) {
          return UserFactory.getGroupUsers($stateParams.groupId, $stateParams.categoryId)
        },
        group: function(GroupFactory, $stateParams){
          return GroupFactory.getOne($stateParams.groupId)
        }
      },
      controller: function(group, groupUsers, $scope, $stateParams, $state) {
        $scope.groupUsers = groupUsers;
        $scope.group = group;
        $scope.categories = [{
          id: 0,
          label: 'Personality',
        }, {
          id: 1,
          label: 'Needs'
        }, {
          id: 2,
          label: 'Values'
        }];
        $scope.selected = $scope.categories[Number($stateParams.categoryId)]
        $scope.categoryName = $scope.categories[Number($stateParams.categoryId)].label
        $scope.submit = function() {
          console.log($scope.selected)
          return $state.go('groupMembers', {groupId: 1, categoryId: $scope.selected.id})
        }
      }
    })
})
