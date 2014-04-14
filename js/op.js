'use strict';

angular.module('op',
	['ngAnimate', 'ui.bootstrap', 'helperFunctions', 'piwik']
);

angular.module('op')
.controller('boardCtrl',
	['$scope',
	'$http',
	'$compile',
	'throttle',
	function(scope, http, compile, throttle) {
		scope.openings = {};
		http.get('openings.json').success(function(resp) {
			scope.openings = resp;
			scope.openings.name = 'Start Position';
			scope.openings.eco = '';
			scope.board.putAlternatives();
			console.log(scope.openings);
		});

		var cfg = {
			position: 'start',
			draggable: true,
			onDragStart: function(source, piece, position, orientation) {
				if (scope.game.game_over() === true ||
					(scope.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
					(scope.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
						return false;
				}
			},
			onDrop: function(source, target) {
				var move = scope.game.move({
					from: source,
					to: target,
					promotion: 'q'
				});

				if (move === null) return 'snapback';
			},
			onSnapEnd: function() {
				scope.$digest();
			}
		};
		
		var chessboard = new ChessBoard('board', cfg);
		scope.game = new Chess();

		scope.board = {
			last_opening: 'Start Position',
			last_eco: '',
			move: function(san) {
				var move = scope.game.move(san);

				if(move != null)
					chessboard.position(scope.game.fen());

				return move;
			},
			reset: function() {
				scope.game.reset();
				chessboard.position('start');
			},
			undo: function() {
				scope.game.undo();
				chessboard.position(scope.game.fen());
			},
			getOpening: function(moves, strict) {
				var len = moves.length;
				var ref = scope.openings;

				for(var i=0; i<len; i++) {
					if(ref[moves[i]]) {
						ref = ref[moves[i]];
					} else {
						if(strict) return null;
						break;
					}
				}
 
				return ref;
			},
			opening: function(strict) {
				var opening = scope.board.getOpening(scope.game.history(), strict);

				return opening;
			},
			fen: function() {
				return scope.game.fen();
			},
			putAlternativePiece: function(color, piece, square, title, san, castle) {
					var elem = $('<img/>')
						.attr({
							'src': 'img/chesspieces/wikipedia/' + color + piece + '.png',
							'height': '100%',
							'width': '100%',
							'ng-click': 'board.move("' + san + '")',
							'tooltip-placement': 'top',
							'tooltip': title,
							'tooltip-animation': 'false',
							'tooltip-append-to-body': 'true'
						})
						.addClass('move-alternative')
						.addClass(san.replace('+', ''));

					if(castle) elem.addClass('castle');

					elem = compile($(elem))(scope);
					elem.appendTo($('.square-' + square));
			},
			putAlternatives: function() {
				$('.move-alternative').remove();
				$('.tooltip').remove();

				var alternatives = scope.board.opening(true);

				if(!alternatives) return;

				angular.forEach(alternatives, function(v, i) {
					if(i == 'name' || i == 'eco') return;

					var color = scope.game.turn();
					var title = alternatives[i]['name'];
					var piece = '';
					var square = '';

					var san = i;
					san = san.replace('+', '');

					if(san == 'O-O') {
						square = (color == 'w' ? 'g1' : 'g8');
						piece = 'K';
						scope.board.putAlternativePiece(color, piece, square, title, i, true);

						square = (color == 'w' ? 'f1' : 'f8');
						piece = 'R';
						scope.board.putAlternativePiece(color, piece, square, title, i, true);
					} else if(san == 'O-O-O') {
						square = (color == 'w' ? 'c1' : 'c8');
						piece = 'K';
						scope.board.putAlternativePiece(color, piece, square, title, i, true);

						square = (color == 'w' ? 'd1' : 'd8');
						piece = 'R';
						scope.board.putAlternativePiece(color, piece, square, title, i, true);
					} else {
						switch(san.length) {
							case 2:
								piece = 'P';
								square = san[0] + san[1];
								break;
							case 3:
								piece = san[0];
								square = san[1] + san[2];
								break;
							case 4:
								piece = san[0];

								if(piece == piece.toLowerCase())
									piece = 'P';

								square = san[2] + san[3];
								break;
						}
						scope.board.putAlternativePiece(color, piece, square, title, i, false);
					}
				});
			}
		};

		scope.$watch('board.opening(true)', function() {
			scope.op = scope.board.opening(true);

			if(scope.op && scope.op['name'] != null) {
				scope.board.last_opening = scope.op['name'];
				scope.board.last_eco = scope.op['eco'];
			}
		});
		
		scope.$watch('game.fen()', function() {
			scope.board.putAlternatives();
		});

		angular.element(document).ready(function() {
			$(document).on('mouseover mouseout', '.castle', function(e) {
				if (e.type == 'mouseover') {
					$('.castle').css('opacity', 0.85);
				} else {
					$('.castle').css('opacity', 0.25);
				}
			});

			$(document).on('mouseover mouseout', '.move-row', function(e) {
				var move = $(this).data('move');
				if (e.type == 'mouseover') {
					$('.'+move).css('opacity', 0.85);
				} else {
					$('.'+move).css('opacity', 0.25);
				}
			});

			$(document).on('mouseover mouseout', '.move-alternative', function(e) {
				if (e.type == 'mouseover') {
					$(this).css('opacity', 0.85);
				} else {
					$(this).css('opacity', 0.25);
				}
			});

			$(window).on('resize', throttle(500, function() {
				chessboard.resize();
				scope.board.putAlternatives();
			}));

			$('.feninput').on('click', function() {
				this.select();
			});
		});
	}
]);