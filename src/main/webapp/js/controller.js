function GameDisplayCtrl($scope) {

	$scope.players = [{"name":"Player one"},{"name":"Test"},{"name":"Jack"}];


	updateData = function(){
		console.log("Call to update data bindings.");
		$scope.$apply();
	}

	  cast.receiver.logger.setLevelValue(0);

     // var canvas = document.getElementById("board");
      //var context = canvas.getContext("2d");
      //var mBoard = new board(context);
      var chromecastApp = new cast.receiver.Receiver("a5db9048-8024-476f-9b3d-73fad64f328c",
          [ cast.TicTacToe.PROTOCOL ], "", 5);
      var favIcon = document.getElementById("favIcon");

      //mBoard.clear();
      //mBoard.drawGrid();
      $scope.cahGame = new cast.TicTacToe(updateData);
      $scope.cahGame.mChannelHandler.addChannelFactory(chromecastApp.createChannelFactory(cast.TicTacToe.PROTOCOL));
      chromecastApp.start();
}