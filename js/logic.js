//unifying Chess.js and ChessBoard.js for Angular
angular.module('op').factory('Logic', [
	'$rootScope',
	'$http',
	'$compile',
	function($rootScope, $http, $compile) {
		//load openings
		var openings;
		$http.get('openings.json').success(function(response) {
			openings = response;
			putAlternatives();
		});

		//init Chess
		var game = new Chess();

		//config for ChessBoard & init
		var cfg = {
			position: 'start',
			draggable: true,
			onDragStart: function(source, piece, position, orientation) {
				if (game.game_over() === true ||
					(game.turn() === 'w' && piece.search(/^b/) !== -1) ||
					(game.turn() === 'b' && piece.search(/^w/) !== -1)) {
						return false;
				}
			},
			onDrop: function(source, target) {
				var move = Logic.move({
					from: source,
					to: target,
					promotion: 'q'
				});

				if (move === null)
					return 'snapback';

				$rootScope.$digest();
			}
		};
		var board = new ChessBoard('board', cfg);

		//DOM manipulation: put a piece on the ChessBoard for alternative next moves
		function putAlternativePiece(color, piece, square, title, san, castle) {
			var elem = $('<img/>')
				.attr({
					'src': 'img/chesspieces/wikipedia/' + color + piece + '.png',
					'height': '100%',
					'width': '100%',
					'ng-click': 'Logic.move("' + san + '")',
					'tooltip-placement': 'top',
					'tooltip': title,
					'tooltip-animation': 'false',
					'tooltip-append-to-body': 'true'
				})
				.addClass('move-alternative')
				.addClass(san.replace('+', ''));

			if(castle) elem.addClass('castle');

			//$$childHead corresponds to controller scope
			elem = $compile($(elem))($rootScope.$$childHead);
			elem.appendTo($('.square-' + square));
		}

		//put alternative moves on the DOM
		function putAlternatives() {
			$('.move-alternative').remove();
			$('.tooltip').remove();

			var alternatives = Logic.opening(true);

			if(!alternatives) return;

			//go through each alternative and figure out which piece to put where
			angular.forEach(alternatives, function(v, i) {
				if(i == 'name' || i == 'eco') return;

				var color = game.turn();
				var title = alternatives[i]['name'];
				var piece = '';
				var square = '';

				var san = i;
				san = san.replace('+', ''); //don't pay attention to check

				if(san == 'O-O') { //short castle
					square = (color == 'w' ? 'g1' : 'g8');
					piece = 'K';
					putAlternativePiece(color, piece, square, title, i, true);

					square = (color == 'w' ? 'f1' : 'f8');
					piece = 'R';
					putAlternativePiece(color, piece, square, title, i, true);
				} else if(san == 'O-O-O') { //long castle
					square = (color == 'w' ? 'c1' : 'c8');
					piece = 'K';
					putAlternativePiece(color, piece, square, title, i, true);

					square = (color == 'w' ? 'd1' : 'd8');
					piece = 'R';
					putAlternativePiece(color, piece, square, title, i, true);
				} else {
					switch(san.length) {
						case 2: //simple pawn move
							piece = 'P';
							square = san[0] + san[1];
							break;
						case 3: //simple piece move
							piece = san[0];
							square = san[1] + san[2];
							break;
						case 4: //capture, or ambiguous move (eg. Nge7)
							piece = san[0];

							if(piece == piece.toLowerCase())
								piece = 'P';

							square = san[2] + san[3];
							break;
					}
					putAlternativePiece(color, piece, square, title, i, false);
				}
			});
		}

		var Logic = {
			move: function(san) {
				var move = game.move(san);

				if( move != null )
					board.position(game.fen());

				putAlternatives();
				return move;
			},
			reset: function() {
				game.reset();
				board.position('start');
				putAlternatives();
			},
			undo: function() {
				game.undo();
				board.position(game.fen());
				putAlternatives();
			},

			fen: function() {
				return game.fen();
			},
			pgn: function() {
				return game.pgn();
			},

			getOpening: function(moves, strict) {
				var ref = openings;
				if (!moves) return ref;

				var len = moves.length;

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
				var opening = this.getOpening(game.history(), strict);

				if(opening && opening.name) {
					this.last_opening = {
						name: opening.name,
						eco: opening.eco
					};
				}

				return opening;
			},

			resizeBoard: function() {
				board.resize();
				putAlternatives();
			},
			flipBoard: function() {
				board.flip();
				putAlternatives();
			}
		}

		return Logic;
	}
]);