(function() {
  'use strict';

  var mod,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty;

  mod = angular.module('piwik', []);

  mod.factory('PiwikActionMethods', function() {
    return ['setTrackerUrl', 'setSiteId', 'setCustomData', 'setCustomVariable', 'deleteCustomVariable', 'setLinkTrackingTimer', 'setDownloadExtensions', 'addDownloadExtensions', 'setDomains', 'setIgnoreClasses', 'setRequestMethod', 'setReferrerUrl', 'setCustomUrl', 'setDocumentTitle', 'setDownloadClasses', 'setLinkClasses', 'setCampaignNameKey', 'setCampaignKeywordKey', 'discardHashTag', 'setCookieNamePrefix', 'setCookieDomain', 'setCookiePath', 'setVisitorCookieTimeout', 'setSessionCookieTimeout', 'setReferralCookieTimeout', 'setConversionAttributionFirstReferrer', 'setDoNotTrack', 'addListener', 'enableLinkTracking', 'setHeartBeatTimer', 'killFrame', 'redirectFile', 'setCountPreRendered', 'trackGoal', 'trackLink', 'trackPageView', 'setEcommerceView', 'addEcommerceItem', 'trackEcommerceOrder', 'trackEcommerceCartUpdate'];
  });

  mod.factory('PiwikGetMethods', function() {
    return ['getVisitorId', 'getVisitorInfo', 'getAttributionInfo', 'getAttributionCampaignName', 'getAttributionCampaignKeyword', 'getAttributionReferrerTimestamp', 'getAttributionReferrerUrl', 'getCustomData', 'getCustomVariable'];
  });

  mod.factory('Piwik', [
    '$q', '$window', 'PiwikActionMethods', 'PiwikGetMethods', function($q, $window, PiwikActionMethods, PiwikGetMethods) {
      var Piwik;
      $window['_paq'] = $window['_paq'] || [];
      return Piwik = (function() {
        var method, _fn, _fn1, _i, _j, _len, _len1, _self;

        function Piwik() {}

        _self = Piwik;

        _fn = function(method) {
          return _self[method] = function() {
            var arg, cmd, _j, _len1;
            cmd = [method];
            for (_j = 0, _len1 = arguments.length; _j < _len1; _j++) {
              arg = arguments[_j];
              cmd.push(arg);
            }
            return $window['_paq'].push(cmd);
          };
        };
        for (_i = 0, _len = PiwikActionMethods.length; _i < _len; _i++) {
          method = PiwikActionMethods[_i];
          _fn(method);
        }

        _fn1 = function(method) {
          return _self[method] = function() {
            var deferred, _args;
            deferred = $q.defer();
            _args = arguments;
            $window['_paq'].push(function() {
              try {
                return deferred.resolve(this[method].apply(this, _args));
              } catch (e) {
                return deferred.reject(e);
              }
            });
            return deferred.promise;
          };
        };
        for (_j = 0, _len1 = PiwikGetMethods.length; _j < _len1; _j++) {
          method = PiwikGetMethods[_j];
          _fn1(method);
        }

        return Piwik;

      })();
    }
  ]);

  mod.directive('ngpPiwik', [
    '$window', '$document', 'Piwik', 'PiwikActionMethods', function($window, $document, Piwik, PiwikActionMethods) {
      var arr_param_methods, build_p_call, comma_regex, dir_def_obj;
      $window['_paq'] = $window['_paq'] || [];
      arr_param_methods = ['setDomains', 'setDownloadClasses', 'setIgnoreClasses', 'setLinkClasses'];
      comma_regex = /,/g;
      comma_regex.compile(comma_regex);
      build_p_call = function(method, attr_val) {
        var call, param, _i, _len, _ref;
        call = [method];
        if ((__indexOf.call(arr_param_methods, method) >= 0) && comma_regex.test(attr_val)) {
          call.push(attr_val.split(','));
        } else {
          _ref = attr_val.split(',');
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            param = _ref[_i];
            call.push(param);
          }
        }
        return call;
      };
      dir_def_obj = {
        restrict: 'E',
        replace: false,
        transclude: true,
        compile: function(tElement, tAttrs, transclude) {
          var script_elem;
          script_elem = $document[0].createElement('script');
          script_elem.setAttribute('src', tAttrs.ngpSetJsUrl);
          $document[0].body.appendChild(script_elem);
          return {
            post: function(scope, elem, attrs) {
              var k, v;
              for (k in attrs) {
                if (!__hasProp.call(attrs, k)) continue;
                v = attrs[k];
                if (/^ngp/.test(k)) {
                  (function(k, v) {
                    var method;
                    method = k[3].toLowerCase() + k.slice(4);
                    if (!(__indexOf.call(PiwikActionMethods, method) >= 0)) {
                      return;
                    }
                    $window['_paq'].push(build_p_call(method, v));
                    return attrs.$observe(k, function(val) {
                      return $window['_paq'].push(build_p_call(method, val));
                    });
                  })(k, v);
                }
              }
              return $window['_paq'].push(['trackPageView']);
            }
          };
        }
      };
      return dir_def_obj;
    }
  ]);

}).call(this);

angular.module('helperFunctions', [])
.factory('throttle', ['$timeout', function ($timeout) {
  return function (delay, no_trailing, callback, debounce_mode) {
    var timeout_id,
    last_exec = 0;
    
    if (typeof no_trailing !== 'boolean') {
      debounce_mode = callback;
      callback = no_trailing;
      no_trailing = undefined;
    }
    
    var wrapper = function () {
      var that = this,
          elapsed = +new Date() - last_exec,
          args = arguments,
          exec = function () {
            last_exec = +new Date();
            callback.apply(that, args);
          },
          clear = function () {
            timeout_id = undefined;
          };
 
      if (debounce_mode && !timeout_id) { exec(); }
      if (timeout_id) { $timeout.cancel(timeout_id); }
      if (debounce_mode === undefined && elapsed > delay) {
        exec();
      } else if (no_trailing !== true) {
        timeout_id = $timeout(debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay);
      }
    };
    
    return wrapper;
  };
}]);
'use strict';
/*
 * Copyright (c) 2014, Jeff Hlywa (jhlywa@gmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *----------------------------------------------------------------------------*/

/* minified license below  */

/*! Copyright (c) 2014, Jeff Hlywa (jhlywa@gmail.com)
 *  Released under the BSD license
 *  https://github.com/jhlywa/chess.js/blob/master/LICENSE
 */

var Chess = function(fen) {

  /* jshint indent: false */

  var BLACK = 'b';
  var WHITE = 'w';

  var EMPTY = -1;

  var PAWN = 'p';
  var KNIGHT = 'n';
  var BISHOP = 'b';
  var ROOK = 'r';
  var QUEEN = 'q';
  var KING = 'k';

  var SYMBOLS = 'pnbrqkPNBRQK';

  var DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  var POSSIBLE_RESULTS = ['1-0', '0-1', '1/2-1/2', '*'];

  var PAWN_OFFSETS = {
    b: [16, 32, 17, 15],
    w: [-16, -32, -17, -15]
  };

  var PIECE_OFFSETS = {
    n: [-18, -33, -31, -14,  18, 33, 31,  14],
    b: [-17, -15,  17,  15],
    r: [-16,   1,  16,  -1],
    q: [-17, -16, -15,   1,  17, 16, 15,  -1],
    k: [-17, -16, -15,   1,  17, 16, 15,  -1]
  };

  var ATTACKS = [
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20, 0,
     0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
     0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
     0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
     0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    24,24,24,24,24,24,56,  0, 56,24,24,24,24,24,24, 0,
     0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
     0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
     0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
     0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20
  ];

  var RAYS = [
     17,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
      0, 17,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0, 0,
      0,  0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0, 0,
      0,  0,  0, 17,  0,  0,  0, 16,  0,  0,  0, 15,  0,  0,  0, 0,
      0,  0,  0,  0, 17,  0,  0, 16,  0,  0, 15,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0, 17,  0, 16,  0, 15,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0,  0, 17, 16, 15,  0,  0,  0,  0,  0,  0, 0,
      1,  1,  1,  1,  1,  1,  1,  0, -1, -1,  -1,-1, -1, -1, -1, 0,
      0,  0,  0,  0,  0,  0,-15,-16,-17,  0,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0,-15,  0,-16,  0,-17,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,-15,  0,  0,-16,  0,  0,-17,  0,  0,  0,  0, 0,
      0,  0,  0,-15,  0,  0,  0,-16,  0,  0,  0,-17,  0,  0,  0, 0,
      0,  0,-15,  0,  0,  0,  0,-16,  0,  0,  0,  0,-17,  0,  0, 0,
      0,-15,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-17,  0, 0,
    -15,  0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-17
  ];

  var SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };

  var FLAGS = {
    NORMAL: 'n',
    CAPTURE: 'c',
    BIG_PAWN: 'b',
    EP_CAPTURE: 'e',
    PROMOTION: 'p',
    KSIDE_CASTLE: 'k',
    QSIDE_CASTLE: 'q'
  };

  var BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64
  };

  var RANK_1 = 7;
  var RANK_2 = 6;
  var RANK_3 = 5;
  var RANK_4 = 4;
  var RANK_5 = 3;
  var RANK_6 = 2;
  var RANK_7 = 1;
  var RANK_8 = 0;

  var SQUARES = {
    a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
    a7:  16, b7:  17, c7:  18, d7:  19, e7:  20, f7:  21, g7:  22, h7:  23,
    a6:  32, b6:  33, c6:  34, d6:  35, e6:  36, f6:  37, g6:  38, h6:  39,
    a5:  48, b5:  49, c5:  50, d5:  51, e5:  52, f5:  53, g5:  54, h5:  55,
    a4:  64, b4:  65, c4:  66, d4:  67, e4:  68, f4:  69, g4:  70, h4:  71,
    a3:  80, b3:  81, c3:  82, d3:  83, e3:  84, f3:  85, g3:  86, h3:  87,
    a2:  96, b2:  97, c2:  98, d2:  99, e2: 100, f2: 101, g2: 102, h2: 103,
    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
  };

  var ROOKS = {
    w: [{square: SQUARES.a1, flag: BITS.QSIDE_CASTLE},
        {square: SQUARES.h1, flag: BITS.KSIDE_CASTLE}],
    b: [{square: SQUARES.a8, flag: BITS.QSIDE_CASTLE},
        {square: SQUARES.h8, flag: BITS.KSIDE_CASTLE}]
  };

  var board = new Array(128);
  var kings = {w: EMPTY, b: EMPTY};
  var turn = WHITE;
  var castling = {w: 0, b: 0};
  var ep_square = EMPTY;
  var half_moves = 0;
  var move_number = 1;
  var history = [];
  var header = {};

  /* if the user passes in a fen string, load it, else default to
   * starting position
   */
  if (typeof fen === 'undefined') {
    load(DEFAULT_POSITION);
  } else {
    load(fen);
  }

  function clear() {
    board = new Array(128);
    kings = {w: EMPTY, b: EMPTY};
    turn = WHITE;
    castling = {w: 0, b: 0};
    ep_square = EMPTY;
    half_moves = 0;
    move_number = 1;
    history = [];
    header = {};
    update_setup(generate_fen());
  }

  function reset() {
    load(DEFAULT_POSITION);
  }

  function load(fen) {
    var tokens = fen.split(/\s+/);
    var position = tokens[0];
    var square = 0;
    var valid = SYMBOLS + '12345678/';

    if (!validate_fen(fen).valid) {
      return false;
    }

    clear();

    for (var i = 0; i < position.length; i++) {
      var piece = position.charAt(i);

      if (piece === '/') {
        square += 8;
      } else if (is_digit(piece)) {
        square += parseInt(piece, 10);
      } else {
        var color = (piece < 'a') ? WHITE : BLACK;
        put({type: piece.toLowerCase(), color: color}, algebraic(square));
        square++;
      }
    }

    turn = tokens[1];

    if (tokens[2].indexOf('K') > -1) {
      castling.w |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('Q') > -1) {
      castling.w |= BITS.QSIDE_CASTLE;
    }
    if (tokens[2].indexOf('k') > -1) {
      castling.b |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('q') > -1) {
      castling.b |= BITS.QSIDE_CASTLE;
    }

    ep_square = (tokens[3] === '-') ? EMPTY : SQUARES[tokens[3]];
    half_moves = parseInt(tokens[4], 10);
    move_number = parseInt(tokens[5], 10);

    update_setup(generate_fen());

    return true;
  }

  function validate_fen(fen) {
    var errors = {
       0: 'No errors.',
       1: 'FEN string must contain six space-delimited fields.',
       2: '6th field (move number) must be a positive integer.',
       3: '5th field (half move counter) must be a non-negative integer.',
       4: '4th field (en-passant square) is invalid.',
       5: '3rd field (castling availability) is invalid.',
       6: '2nd field (side to move) is invalid.',
       7: '1st field (piece positions) does not contain 8 \'/\'-delimited rows.',
       8: '1st field (piece positions) is invalid [consecutive numbers].',
       9: '1st field (piece positions) is invalid [invalid piece].',
      10: '1st field (piece positions) is invalid [row too large].',
    };

    /* 1st criterion: 6 space-seperated fields? */
    var tokens = fen.split(/\s+/);
    if (tokens.length !== 6) {
      return {valid: false, error_number: 1, error: errors[1]};
    }

    /* 2nd criterion: move number field is a integer value > 0? */
    if (isNaN(tokens[5]) || (parseInt(tokens[5], 10) <= 0)) {
      return {valid: false, error_number: 2, error: errors[2]};
    }

    /* 3rd criterion: half move counter is an integer >= 0? */
    if (isNaN(tokens[4]) || (parseInt(tokens[4], 10) < 0)) {
      return {valid: false, error_number: 3, error: errors[3]};
    }

    /* 4th criterion: 4th field is a valid e.p.-string? */
    if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
      return {valid: false, error_number: 4, error: errors[4]};
    }

    /* 5th criterion: 3th field is a valid castle-string? */
    if( !/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
      return {valid: false, error_number: 5, error: errors[5]};
    }

    /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
    if (!/^(w|b)$/.test(tokens[1])) {
      return {valid: false, error_number: 6, error: errors[6]};
    }

    /* 7th criterion: 1st field contains 8 rows? */
    var rows = tokens[0].split('/');
    if (rows.length !== 8) {
      return {valid: false, error_number: 7, error: errors[7]};
    }

    /* 8th criterion: every row is valid? */
    for (var i = 0; i < rows.length; i++) {
      /* check for right sum of fields AND not two numbers in succession */
      var sum_fields = 0;
      var previous_was_number = false;

      for (var k = 0; k < rows[i].length; k++) {
        if (!isNaN(rows[i][k])) {
          if (previous_was_number) {
            return {valid: false, error_number: 8, error: errors[8]};
          }
          sum_fields += parseInt(rows[i][k], 10);
          previous_was_number = true;
        } else {
          if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
            return {valid: false, error_number: 9, error: errors[9]};
          }
          sum_fields += 1;
          previous_was_number = false;
        }
      }
      if (sum_fields !== 8) {
        return {valid: false, error_number: 10, error: errors[10]};
      }
    }

    /* everything's okay! */
    return {valid: true, error_number: 0, error: errors[0]};
  }

  function generate_fen() {
    var empty = 0;
    var fen = '';

    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      if (board[i] == null) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        var color = board[i].color;
        var piece = board[i].type;

        fen += (color === WHITE) ?
                 piece.toUpperCase() : piece.toLowerCase();
      }

      if ((i + 1) & 0x88) {
        if (empty > 0) {
          fen += empty;
        }

        if (i !== SQUARES.h1) {
          fen += '/';
        }

        empty = 0;
        i += 8;
      }
    }

    var cflags = '';
    if (castling[WHITE] & BITS.KSIDE_CASTLE) { cflags += 'K'; }
    if (castling[WHITE] & BITS.QSIDE_CASTLE) { cflags += 'Q'; }
    if (castling[BLACK] & BITS.KSIDE_CASTLE) { cflags += 'k'; }
    if (castling[BLACK] & BITS.QSIDE_CASTLE) { cflags += 'q'; }

    /* do we have an empty castling flag? */
    cflags = cflags || '-';
    var epflags = (ep_square === EMPTY) ? '-' : algebraic(ep_square);

    return [fen, turn, cflags, epflags, half_moves, move_number].join(' ');
  }

  function set_header(args) {
    for (var i = 0; i < args.length; i += 2) {
      if (typeof args[i] === 'string' &&
          typeof args[i + 1] === 'string') {
        header[args[i]] = args[i + 1];
      }
    }
    return header;
  }

  /* called when the initial board setup is changed with put() or remove().
   * modifies the SetUp and FEN properties of the header object.  if the FEN is
   * equal to the default position, the SetUp and FEN are deleted
   * the setup is only updated if history.length is zero, ie moves haven't been
   * made.
   */
  function update_setup(fen) {
    if (history.length > 0) return;

    if (fen !== DEFAULT_POSITION) {
      header['SetUp'] = '1';
      header['FEN'] = fen;
    } else {
      delete header['SetUp'];
      delete header['FEN'];
    }
  }

  function get(square) {
    var piece = board[SQUARES[square]];
    return (piece) ? {type: piece.type, color: piece.color} : null;
  }

  function put(piece, square) {
    /* check for valid piece object */
    if (!('type' in piece && 'color' in piece)) {
      return false;
    }

    /* check for piece */
    if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
      return false;
    }

    /* check for valid square */
    if (!(square in SQUARES)) {
      return false;
    }

    var sq = SQUARES[square];

    /* don't let the user place more than one king */
    if (piece.type == KING &&
        !(kings[piece.color] == EMPTY || kings[piece.color] == sq)) {
      return false;
    }

    board[sq] = {type: piece.type, color: piece.color};
    if (piece.type === KING) {
      kings[piece.color] = sq;
    }

    update_setup(generate_fen());

    return true;
  }

  function remove(square) {
    var piece = get(square);
    board[SQUARES[square]] = null;
    if (piece && piece.type === KING) {
      kings[piece.color] = EMPTY;
    }

    update_setup(generate_fen());

    return piece;
  }

  function build_move(board, from, to, flags, promotion) {
    var move = {
      color: turn,
      from: from,
      to: to,
      flags: flags,
      piece: board[from].type
    };

    if (promotion) {
      move.flags |= BITS.PROMOTION;
      move.promotion = promotion;
    }

    if (board[to]) {
      move.captured = board[to].type;
    } else if (flags & BITS.EP_CAPTURE) {
        move.captured = PAWN;
    }
    return move;
  }

  function generate_moves(options) {
    function add_move(board, moves, from, to, flags) {
      /* if pawn promotion */
      if (board[from].type === PAWN &&
         (rank(to) === RANK_8 || rank(to) === RANK_1)) {
          var pieces = [QUEEN, ROOK, BISHOP, KNIGHT];
          for (var i = 0, len = pieces.length; i < len; i++) {
            moves.push(build_move(board, from, to, flags, pieces[i]));
          }
      } else {
       moves.push(build_move(board, from, to, flags));
      }
    }

    var moves = [];
    var us = turn;
    var them = swap_color(us);
    var second_rank = {b: RANK_7, w: RANK_2};

    var first_sq = SQUARES.a8;
    var last_sq = SQUARES.h1;
    var single_square = false;

    /* do we want legal moves? */
    var legal = (typeof options !== 'undefined' && 'legal' in options) ?
                options.legal : true;

    /* are we generating moves for a single square? */
    if (typeof options !== 'undefined' && 'square' in options) {
      if (options.square in SQUARES) {
        first_sq = last_sq = SQUARES[options.square];
        single_square = true;
      } else {
        /* invalid square */
        return [];
      }
    }

    for (var i = first_sq; i <= last_sq; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) { i += 7; continue; }

      var piece = board[i];
      if (piece == null || piece.color !== us) {
        continue;
      }

      if (piece.type === PAWN) {
        /* single square, non-capturing */
        var square = i + PAWN_OFFSETS[us][0];
        if (board[square] == null) {
            add_move(board, moves, i, square, BITS.NORMAL);

          /* double square */
          var square = i + PAWN_OFFSETS[us][1];
          if (second_rank[us] === rank(i) && board[square] == null) {
            add_move(board, moves, i, square, BITS.BIG_PAWN);
          }
        }

        /* pawn captures */
        for (j = 2; j < 4; j++) {
          var square = i + PAWN_OFFSETS[us][j];
          if (square & 0x88) continue;

          if (board[square] != null &&
              board[square].color === them) {
              add_move(board, moves, i, square, BITS.CAPTURE);
          } else if (square === ep_square) {
              add_move(board, moves, i, ep_square, BITS.EP_CAPTURE);
          }
        }
      } else {
        for (var j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
          var offset = PIECE_OFFSETS[piece.type][j];
          var square = i;

          while (true) {
            square += offset;
            if (square & 0x88) break;

            if (board[square] == null) {
              add_move(board, moves, i, square, BITS.NORMAL);
            } else {
              if (board[square].color === us) break;
              add_move(board, moves, i, square, BITS.CAPTURE);
              break;
            }

            /* break, if knight or king */
            if (piece.type === 'n' || piece.type === 'k') break;
          }
        }
      }
    }

    /* check for castling if: a) we're generating all moves, or b) we're doing
     * single square move generation on the king's square
     */
    if ((!single_square) || last_sq === kings[us]) {
      /* king-side castling */
      if (castling[us] & BITS.KSIDE_CASTLE) {
        var castling_from = kings[us];
        var castling_to = castling_from + 2;

        if (board[castling_from + 1] == null &&
            board[castling_to]       == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from + 1) &&
            !attacked(them, castling_to)) {
          add_move(board, moves, kings[us] , castling_to,
                   BITS.KSIDE_CASTLE);
        }
      }

      /* queen-side castling */
      if (castling[us] & BITS.QSIDE_CASTLE) {
        var castling_from = kings[us];
        var castling_to = castling_from - 2;

        if (board[castling_from - 1] == null &&
            board[castling_from - 2] == null &&
            board[castling_from - 3] == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from - 1) &&
            !attacked(them, castling_to)) {
          add_move(board, moves, kings[us], castling_to,
                   BITS.QSIDE_CASTLE);
        }
      }
    }

    /* return all pseudo-legal moves (this includes moves that allow the king
     * to be captured)
     */
    if (!legal) {
      return moves;
    }

    /* filter out illegal moves */
    var legal_moves = [];
    for (var i = 0, len = moves.length; i < len; i++) {
      make_move(moves[i]);
      if (!king_attacked(us)) {
        legal_moves.push(moves[i]);
      }
      undo_move();
    }

    return legal_moves;
  }

  /* convert a move from 0x88 coordinates to Standard Algebraic Notation
   * (SAN)
   */
  function move_to_san(move) {
    var output = '';

    if (move.flags & BITS.KSIDE_CASTLE) {
      output = 'O-O';
    } else if (move.flags & BITS.QSIDE_CASTLE) {
      output = 'O-O-O';
    } else {
      var disambiguator = get_disambiguator(move);

      if (move.piece !== PAWN) {
        output += move.piece.toUpperCase() + disambiguator;
      }

      if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        if (move.piece === PAWN) {
          output += algebraic(move.from)[0];
        }
        output += 'x';
      }

      output += algebraic(move.to);

      if (move.flags & BITS.PROMOTION) {
        output += '=' + move.promotion.toUpperCase();
      }
    }

    make_move(move);
    if (in_check()) {
      if (in_checkmate()) {
        output += '#';
      } else {
        output += '+';
      }
    }
    undo_move();

    return output;
  }

  function attacked(color, square) {
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) { i += 7; continue; }

      /* if empty square or wrong color */
      if (board[i] == null || board[i].color !== color) continue;

      var piece = board[i];
      var difference = i - square;
      var index = difference + 119;

      if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
        if (piece.type === PAWN) {
          if (difference > 0) {
            if (piece.color === WHITE) return true;
          } else {
            if (piece.color === BLACK) return true;
          }
          continue;
        }

        /* if the piece is a knight or a king */
        if (piece.type === 'n' || piece.type === 'k') return true;

        var offset = RAYS[index];
        var j = i + offset;

        var blocked = false;
        while (j !== square) {
          if (board[j] != null) { blocked = true; break; }
          j += offset;
        }

        if (!blocked) return true;
      }
    }

    return false;
  }

  function king_attacked(color) {
    return attacked(swap_color(color), kings[color]);
  }

  function in_check() {
    return king_attacked(turn);
  }

  function in_checkmate() {
    return in_check() && generate_moves().length === 0;
  }

  function in_stalemate() {
    return !in_check() && generate_moves().length === 0;
  }

  function insufficient_material() {
    var pieces = {};
    var bishops = [];
    var num_pieces = 0;
    var sq_color = 0;

    for (var i = SQUARES.a8; i<= SQUARES.h1; i++) {
      sq_color = (sq_color + 1) % 2;
      if (i & 0x88) { i += 7; continue; }

      var piece = board[i];
      if (piece) {
        pieces[piece.type] = (piece.type in pieces) ?
                              pieces[piece.type] + 1 : 1;
        if (piece.type === BISHOP) {
          bishops.push(sq_color);
        }
        num_pieces++;
      }
    }

    /* k vs. k */
    if (num_pieces === 2) { return true; }

    /* k vs. kn .... or .... k vs. kb */
    else if (num_pieces === 3 && (pieces[BISHOP] === 1 ||
                                 pieces[KNIGHT] === 1)) { return true; }

    /* kb vs. kb where any number of bishops are all on the same color */
    else if (num_pieces === pieces[BISHOP] + 2) {
      var sum = 0;
      var len = bishops.length;
      for (var i = 0; i < len; i++) {
        sum += bishops[i];
      }
      if (sum === 0 || sum === len) { return true; }
    }

    return false;
  }

  function in_threefold_repetition() {
    /* TODO: while this function is fine for casual use, a better
     * implementation would use a Zobrist key (instead of FEN). the
     * Zobrist key would be maintained in the make_move/undo_move functions,
     * avoiding the costly that we do below.
     */
    var moves = [];
    var positions = {};
    var repetition = false;

    while (true) {
      var move = undo_move();
      if (!move) break;
      moves.push(move);
    }

    while (true) {
      /* remove the last two fields in the FEN string, they're not needed
       * when checking for draw by rep */
      var fen = generate_fen().split(' ').slice(0,4).join(' ');

      /* has the position occurred three or move times */
      positions[fen] = (fen in positions) ? positions[fen] + 1 : 1;
      if (positions[fen] >= 3) {
        repetition = true;
      }

      if (!moves.length) {
        break;
      }
      make_move(moves.pop());
    }

    return repetition;
  }

  function push(move) {
    history.push({
      move: move,
      kings: {b: kings.b, w: kings.w},
      turn: turn,
      castling: {b: castling.b, w: castling.w},
      ep_square: ep_square,
      half_moves: half_moves,
      move_number: move_number
    });
  }

  function make_move(move) {
    var us = turn;
    var them = swap_color(us);
    push(move);

    board[move.to] = board[move.from];
    board[move.from] = null;

    /* if ep capture, remove the captured pawn */
    if (move.flags & BITS.EP_CAPTURE) {
      if (turn === BLACK) {
        board[move.to - 16] = null;
      } else {
        board[move.to + 16] = null;
      }
    }

    /* if pawn promotion, replace with new piece */
    if (move.flags & BITS.PROMOTION) {
      board[move.to] = {type: move.promotion, color: us};
    }

    /* if we moved the king */
    if (board[move.to].type === KING) {
      kings[board[move.to].color] = move.to;

      /* if we castled, move the rook next to the king */
      if (move.flags & BITS.KSIDE_CASTLE) {
        var castling_to = move.to - 1;
        var castling_from = move.to + 1;
        board[castling_to] = board[castling_from];
        board[castling_from] = null;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        var castling_to = move.to + 1;
        var castling_from = move.to - 2;
        board[castling_to] = board[castling_from];
        board[castling_from] = null;
      }

      /* turn off castling */
      castling[us] = '';
    }

    /* turn off castling if we move a rook */
    if (castling[us]) {
      for (var i = 0, len = ROOKS[us].length; i < len; i++) {
        if (move.from === ROOKS[us][i].square &&
            castling[us] & ROOKS[us][i].flag) {
          castling[us] ^= ROOKS[us][i].flag;
          break;
        }
      }
    }

    /* turn off castling if we capture a rook */
    if (castling[them]) {
      for (var i = 0, len = ROOKS[them].length; i < len; i++) {
        if (move.to === ROOKS[them][i].square &&
            castling[them] & ROOKS[them][i].flag) {
          castling[them] ^= ROOKS[them][i].flag;
          break;
        }
      }
    }

    /* if big pawn move, update the en passant square */
    if (move.flags & BITS.BIG_PAWN) {
      if (turn === 'b') {
        ep_square = move.to - 16;
      } else {
        ep_square = move.to + 16;
      }
    } else {
      ep_square = EMPTY;
    }

    /* reset the 50 move counter if a pawn is moved or a piece is captured */
    if (move.piece === PAWN) {
      half_moves = 0;
    } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
      half_moves = 0;
    } else {
      half_moves++;
    }

    if (turn === BLACK) {
      move_number++;
    }
    turn = swap_color(turn);
  }

  function undo_move() {
    var old = history.pop();
    if (old == null) { return null; }

    var move = old.move;
    kings = old.kings;
    turn = old.turn;
    castling = old.castling;
    ep_square = old.ep_square;
    half_moves = old.half_moves;
    move_number = old.move_number;

    var us = turn;
    var them = swap_color(turn);

    board[move.from] = board[move.to];
    board[move.from].type = move.piece;  // to undo any promotions
    board[move.to] = null;

    if (move.flags & BITS.CAPTURE) {
      board[move.to] = {type: move.captured, color: them};
    } else if (move.flags & BITS.EP_CAPTURE) {
      var index;
      if (us === BLACK) {
        index = move.to - 16;
      } else {
        index = move.to + 16;
      }
      board[index] = {type: PAWN, color: them};
    }


    if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
      var castling_to, castling_from;
      if (move.flags & BITS.KSIDE_CASTLE) {
        castling_to = move.to + 1;
        castling_from = move.to - 1;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        castling_to = move.to - 2;
        castling_from = move.to + 1;
      }

      board[castling_to] = board[castling_from];
      board[castling_from] = null;
    }

    return move;
  }

  /* this function is used to uniquely identify ambiguous moves */
  function get_disambiguator(move) {
    var moves = generate_moves();

    var from = move.from;
    var to = move.to;
    var piece = move.piece;

    var ambiguities = 0;
    var same_rank = 0;
    var same_file = 0;

    for (var i = 0, len = moves.length; i < len; i++) {
      var ambig_from = moves[i].from;
      var ambig_to = moves[i].to;
      var ambig_piece = moves[i].piece;

      /* if a move of the same piece type ends on the same to square, we'll
       * need to add a disambiguator to the algebraic notation
       */
      if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
        ambiguities++;

        if (rank(from) === rank(ambig_from)) {
          same_rank++;
        }

        if (file(from) === file(ambig_from)) {
          same_file++;
        }
      }
    }

    if (ambiguities > 0) {
      /* if there exists a similar moving piece on the same rank and file as
       * the move in question, use the square as the disambiguator
       */
      if (same_rank > 0 && same_file > 0) {
        return algebraic(from);
      }
      /* if the moving piece rests on the same file, use the rank symbol as the
       * disambiguator
       */
      else if (same_file > 0) {
        return algebraic(from).charAt(1);
      }
      /* else use the file symbol */
      else {
        return algebraic(from).charAt(0);
      }
    }

    return '';
  }

  function ascii() {
    var s = '   +------------------------+\n';
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      /* display the rank */
      if (file(i) === 0) {
        s += ' ' + '87654321'[rank(i)] + ' |';
      }

      /* empty piece */
      if (board[i] == null) {
        s += ' . ';
      } else {
        var piece = board[i].type;
        var color = board[i].color;
        var symbol = (color === WHITE) ?
                     piece.toUpperCase() : piece.toLowerCase();
        s += ' ' + symbol + ' ';
      }

      if ((i + 1) & 0x88) {
        s += '|\n';
        i += 8;
      }
    }
    s += '   +------------------------+\n';
    s += '     a  b  c  d  e  f  g  h\n';

    return s;
  }

  /*****************************************************************************
   * UTILITY FUNCTIONS
   ****************************************************************************/
  function rank(i) {
    return i >> 4;
  }

  function file(i) {
    return i & 15;
  }

  function algebraic(i){
    var f = file(i), r = rank(i);
    return 'abcdefgh'.substring(f,f+1) + '87654321'.substring(r,r+1);
  }

  function swap_color(c) {
    return c === WHITE ? BLACK : WHITE;
  }

  function is_digit(c) {
    return '0123456789'.indexOf(c) !== -1;
  }

  /* pretty = external move object */
  function make_pretty(ugly_move) {
    var move = clone(ugly_move);
    move.san = move_to_san(move);
    move.to = algebraic(move.to);
    move.from = algebraic(move.from);

    var flags = '';

    for (var flag in BITS) {
      if (BITS[flag] & move.flags) {
        flags += FLAGS[flag];
      }
    }
    move.flags = flags;

    return move;
  }

  function clone(obj) {
    var dupe = (obj instanceof Array) ? [] : {};

    for (var property in obj) {
      if (typeof property === 'object') {
        dupe[property] = clone(obj[property]);
      } else {
        dupe[property] = obj[property];
      }
    }

    return dupe;
  }

  function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
  }

  /*****************************************************************************
   * DEBUGGING UTILITIES
   ****************************************************************************/
  function perft(depth) {
    var moves = generate_moves({legal: false});
    var nodes = 0;
    var color = turn;

    for (var i = 0, len = moves.length; i < len; i++) {
      make_move(moves[i]);
      if (!king_attacked(color)) {
        if (depth - 1 > 0) {
          var child_nodes = perft(depth - 1);
          nodes += child_nodes;
        } else {
          nodes++;
        }
      }
      undo_move();
    }

    return nodes;
  }

  return {
    /***************************************************************************
     * PUBLIC CONSTANTS (is there a better way to do this?)
     **************************************************************************/
    WHITE: WHITE,
    BLACK: BLACK,
    PAWN: PAWN,
    KNIGHT: KNIGHT,
    BISHOP: BISHOP,
    ROOK: ROOK,
    QUEEN: QUEEN,
    KING: KING,
    SQUARES: (function() {
                /* from the ECMA-262 spec (section 12.6.4):
                 * "The mechanics of enumerating the properties ... is
                 * implementation dependent"
                 * so: for (var sq in SQUARES) { keys.push(sq); } might not be
                 * ordered correctly
                 */
                var keys = [];
                for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
                  if (i & 0x88) { i += 7; continue; }
                  keys.push(algebraic(i));
                }
                return keys;
              })(),
    FLAGS: FLAGS,

    /***************************************************************************
     * PUBLIC API
     **************************************************************************/
    load: function(fen) {
      return load(fen);
    },

    reset: function() {
      return reset();
    },

    moves: function(options) {
      /* The internal representation of a chess move is in 0x88 format, and
       * not meant to be human-readable.  The code below converts the 0x88
       * square coordinates to algebraic coordinates.  It also prunes an
       * unnecessary move keys resulting from a verbose call.
       */

      var ugly_moves = generate_moves(options);
      var moves = [];

      for (var i = 0, len = ugly_moves.length; i < len; i++) {

        /* does the user want a full move object (most likely not), or just
         * SAN
         */
        if (typeof options !== 'undefined' && 'verbose' in options &&
            options.verbose) {
          moves.push(make_pretty(ugly_moves[i]));
        } else {
          moves.push(move_to_san(ugly_moves[i]));
        }
      }

      return moves;
    },

    in_check: function() {
      return in_check();
    },

    in_checkmate: function() {
      return in_checkmate();
    },

    in_stalemate: function() {
      return in_stalemate();
    },

    in_draw: function() {
      return half_moves >= 100 ||
             in_stalemate() ||
             insufficient_material() ||
             in_threefold_repetition();
    },

    insufficient_material: function() {
      return insufficient_material();
    },

    in_threefold_repetition: function() {
      return in_threefold_repetition();
    },

    game_over: function() {
      return half_moves >= 100 ||
             in_checkmate() ||
             in_stalemate() ||
             insufficient_material() ||
             in_threefold_repetition();
    },

    validate_fen: function(fen) {
      return validate_fen(fen);
    },

    fen: function() {
      return generate_fen();
    },

    pgn: function(options) {
      /* using the specification from http://www.chessclub.com/help/PGN-spec
       * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
       */
      var newline = (typeof options === 'object' &&
                     typeof options.newline_char === 'string') ?
                     options.newline_char : '\n';
      var max_width = (typeof options === 'object' &&
                       typeof options.max_width === 'number') ?
                       options.max_width : 0;
      var result = [];
      var header_exists = false;

      /* add the PGN header headerrmation */
      for (var i in header) {
        /* TODO: order of enumerated properties in header object is not
         * guaranteed, see ECMA-262 spec (section 12.6.4)
         */
        result.push('[' + i + ' \"' + header[i] + '\"]' + newline);
        header_exists = true;
      }

      if (header_exists && history.length) {
        result.push(newline);
      }

      /* pop all of history onto reversed_history */
      var reversed_history = [];
      while (history.length > 0) {
        reversed_history.push(undo_move());
      }

      var moves = [];
      var move_string = '';
      var pgn_move_number = 1;

      /* build the list of moves.  a move_string looks like: "3. e3 e6" */
      while (reversed_history.length > 0) {
        var move = reversed_history.pop();

        /* if the position started with black to move, start PGN with 1. ... */
        if (pgn_move_number === 1 && move.color === 'b') {
          move_string = '1. ...';
          pgn_move_number++;
        } else if (move.color === 'w') {
          /* store the previous generated move_string if we have one */
          if (move_string.length) {
            moves.push(move_string);
          }
          move_string = pgn_move_number + '.';
          pgn_move_number++;
        }

        move_string = move_string + ' ' + move_to_san(move);
        make_move(move);
      }

      /* are there any other leftover moves? */
      if (move_string.length) {
        moves.push(move_string);
      }

      /* is there a result? */
      if (typeof header.Result !== 'undefined') {
        moves.push(header.Result);
      }

      /* history should be back to what is was before we started generating PGN,
       * so join together moves
       */
      if (max_width === 0) {
        return result.join('') + moves.join(' ');
      }

      /* wrap the PGN output at max_width */
      var current_width = 0;
      for (var i = 0; i < moves.length; i++) {
        /* if the current move will push past max_width */
        if (current_width + moves[i].length > max_width && i !== 0) {

          /* don't end the line with whitespace */
          if (result[result.length - 1] === ' ') {
            result.pop();
          }

          result.push(newline);
          current_width = 0;
        } else if (i !== 0) {
          result.push(' ');
          current_width++;
        }
        result.push(moves[i]);
        current_width += moves[i].length;
      }

      return result.join('');
    },

    load_pgn: function(pgn, options) {
      function mask(str) {
        return str.replace(/\\/g, '\\');
      }

      /* convert a move from Standard Algebraic Notation (SAN) to 0x88
       * coordinates
      */
      function move_from_san(move) {
        var moves = generate_moves();
        for (var i = 0, len = moves.length; i < len; i++) {
          /* strip off any trailing move decorations: e.g Nf3+?! */
          if (move.replace(/[+#?!=]+$/,'') ==
              move_to_san(moves[i]).replace(/[+#?!=]+$/,'')) {
            return moves[i];
          }
        }
        return null;
      }

      function get_move_obj(move) {
        return move_from_san(trim(move));
      }

      function has_keys(object) {
        var has_keys = false;
        for (var key in object) {
          has_keys = true;
        }
        return has_keys;
      }

      function parse_pgn_header(header, options) {
        var newline_char = (typeof options === 'object' &&
                            typeof options.newline_char === 'string') ?
                            options.newline_char : '\r?\n';
        var header_obj = {};
        var headers = header.split(new RegExp(mask(newline_char)));
        var key = '';
        var value = '';

        for (var i = 0; i < headers.length; i++) {
          key = headers[i].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, '$1');
          value = headers[i].replace(/^\[[A-Za-z]+\s"(.*)"\]$/, '$1');
          if (trim(key).length > 0) {
            header_obj[key] = value;
          }
        }

        return header_obj;
      }

      var newline_char = (typeof options === 'object' &&
                          typeof options.newline_char === 'string') ?
                          options.newline_char : '\r?\n';
        var regex = new RegExp('^(\\[(.|' + mask(newline_char) + ')*\\])' +
                               '(' + mask(newline_char) + ')*' +
                               '1.(' + mask(newline_char) + '|.)*$', 'g');

      /* get header part of the PGN file */
      var header_string = pgn.replace(regex, '$1');

      /* no info part given, begins with moves */
      if (header_string[0] !== '[') {
        header_string = '';
      }

     reset();

      /* parse PGN header */
      var headers = parse_pgn_header(header_string, options);
      for (var key in headers) {
        set_header([key, headers[key]]);
      }

      /* delete header to get the moves */
      var ms = pgn.replace(header_string, '').replace(new RegExp(mask(newline_char), 'g'), ' ');

      /* delete comments */
      ms = ms.replace(/(\{[^}]+\})+?/g, '');

      /* delete move numbers */
      ms = ms.replace(/\d+\./g, '');


      /* trim and get array of moves */
      var moves = trim(ms).split(new RegExp(/\s+/));

      /* delete empty entries */
      moves = moves.join(',').replace(/,,+/g, ',').split(',');
      var move = '';

      for (var half_move = 0; half_move < moves.length - 1; half_move++) {
        move = get_move_obj(moves[half_move]);

        /* move not possible! (don't clear the board to examine to show the
         * latest valid position)
         */
        if (move == null) {
          return false;
        } else {
          make_move(move);
        }
      }

      /* examine last move */
      move = moves[moves.length - 1];
      if (POSSIBLE_RESULTS.indexOf(move) > -1) {
        if (has_keys(header) && typeof header.Result === 'undefined') {
          set_header(['Result', move]);
        }
      }
      else {
        move = get_move_obj(move);
        if (move == null) {
          return false;
        } else {
          make_move(move);
        }
      }
      return true;
    },

    header: function() {
      return set_header(arguments);
    },

    ascii: function() {
      return ascii();
    },

    turn: function() {
      return turn;
    },

    move: function(move) {
      /* The move function can be called with in the following parameters:
       *
       * .move('Nxb7')      <- where 'move' is a case-sensitive SAN string
       *
       * .move({ from: 'h7', <- where the 'move' is a move object (additional
       *         to :'h8',      fields are ignored)
       *         promotion: 'q',
       *      })
       */
      var move_obj = null;
      var moves = generate_moves();

      if (typeof move === 'string') {
        /* convert the move string to a move object */
        for (var i = 0, len = moves.length; i < len; i++) {
          if (move === move_to_san(moves[i])) {
            move_obj = moves[i];
            break;
          }
        }
      } else if (typeof move === 'object') {
        /* convert the pretty move object to an ugly move object */
        for (var i = 0, len = moves.length; i < len; i++) {
          if (move.from === algebraic(moves[i].from) &&
              move.to === algebraic(moves[i].to) &&
              (!('promotion' in moves[i]) ||
              move.promotion === moves[i].promotion)) {
            move_obj = moves[i];
            break;
          }
        }
      }

      /* failed to find move */
      if (!move_obj) {
        return null;
      }

      /* need to make a copy of move because we can't generate SAN after the
       * move is made
       */
      var pretty_move = make_pretty(move_obj);

      make_move(move_obj);

      return pretty_move;
    },

    undo: function() {
      var move = undo_move();
      return (move) ? make_pretty(move) : null;
    },

    clear: function() {
      return clear();
    },

    put: function(piece, square) {
      return put(piece, square);
    },

    get: function(square) {
      return get(square);
    },

    remove: function(square) {
      return remove(square);
    },

    perft: function(depth) {
      return perft(depth);
    },

    square_color: function(square) {
      if (square in SQUARES) {
        var sq_0x88 = SQUARES[square];
        return ((rank(sq_0x88) + file(sq_0x88)) % 2 === 0) ? 'light' : 'dark';
      }

      return null;
    },

    history: function(options) {
      var reversed_history = [];
      var move_history = [];
      var verbose = (typeof options !== 'undefined' && 'verbose' in options &&
                     options.verbose);

      while (history.length > 0) {
        reversed_history.push(undo_move());
      }

      while (reversed_history.length > 0) {
        var move = reversed_history.pop();
        if (verbose) {
          move_history.push(make_pretty(move));
        } else {
          move_history.push(move_to_san(move));
        }
        make_move(move);
      }

      return move_history;
    }

  };
};

/* export Chess object if using node or any other CommonJS compatible
 * environment */
if (typeof exports !== 'undefined') exports.Chess = Chess;
/* export Chess object for any RequireJS compatible environment */
if (typeof define !== 'undefined') define( function () { return Chess;  });

/*!
 * chessboard.js v0.3.0
 *
 * Copyright 2013 Chris Oakman
 * Released under the MIT license
 * http://chessboardjs.com/license
 *
 * Date: 10 Aug 2013
 */

// start anonymous scope
;(function() {
'use strict';

//------------------------------------------------------------------------------
// Chess Util Functions
//------------------------------------------------------------------------------
var COLUMNS = 'abcdefgh'.split('');

function validMove(move) {
  // move should be a string
  if (typeof move !== 'string') return false;

  // move should be in the form of "e2-e4", "f6-d5"
  var tmp = move.split('-');
  if (tmp.length !== 2) return false;

  return (validSquare(tmp[0]) === true && validSquare(tmp[1]) === true);
}

function validSquare(square) {
  if (typeof square !== 'string') return false;
  return (square.search(/^[a-h][1-8]$/) !== -1);
}

function validPieceCode(code) {
  if (typeof code !== 'string') return false;
  return (code.search(/^[bw][KQRNBP]$/) !== -1);
}

// TODO: this whole function could probably be replaced with a single regex
function validFen(fen) {
  if (typeof fen !== 'string') return false;

  // cut off any move, castling, etc info from the end
  // we're only interested in position information
  fen = fen.replace(/ .+$/, '');

  // FEN should be 8 sections separated by slashes
  var chunks = fen.split('/');
  if (chunks.length !== 8) return false;

  // check the piece sections
  for (var i = 0; i < 8; i++) {
    if (chunks[i] === '' ||
        chunks[i].length > 8 ||
        chunks[i].search(/[^kqrbnpKQRNBP1-8]/) !== -1) {
      return false;
    }
  }

  return true;
}

function validPositionObject(pos) {
  if (typeof pos !== 'object') return false;

  for (var i in pos) {
    if (pos.hasOwnProperty(i) !== true) continue;

    if (validSquare(i) !== true || validPieceCode(pos[i]) !== true) {
      return false;
    }
  }

  return true;
}

// convert FEN piece code to bP, wK, etc
function fenToPieceCode(piece) {
  // black piece
  if (piece.toLowerCase() === piece) {
    return 'b' + piece.toUpperCase();
  }

  // white piece
  return 'w' + piece.toUpperCase();
}

// convert bP, wK, etc code to FEN structure
function pieceCodeToFen(piece) {
  var tmp = piece.split('');

  // white piece
  if (tmp[0] === 'w') {
    return tmp[1].toUpperCase();
  }

  // black piece
  return tmp[1].toLowerCase();
}

// convert FEN string to position object
// returns false if the FEN string is invalid
function fenToObj(fen) {
  if (validFen(fen) !== true) {
    return false;
  }

  // cut off any move, castling, etc info from the end
  // we're only interested in position information
  fen = fen.replace(/ .+$/, '');

  var rows = fen.split('/');
  var position = {};

  var currentRow = 8;
  for (var i = 0; i < 8; i++) {
    var row = rows[i].split('');
    var colIndex = 0;

    // loop through each character in the FEN section
    for (var j = 0; j < row.length; j++) {
      // number / empty squares
      if (row[j].search(/[1-8]/) !== -1) {
        var emptySquares = parseInt(row[j], 10);
        colIndex += emptySquares;
      }
      // piece
      else {
        var square = COLUMNS[colIndex] + currentRow;
        position[square] = fenToPieceCode(row[j]);
        colIndex++;
      }
    }

    currentRow--;
  }

  return position;
}

// position object to FEN string
// returns false if the obj is not a valid position object
function objToFen(obj) {
  if (validPositionObject(obj) !== true) {
    return false;
  }

  var fen = '';

  var currentRow = 8;
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var square = COLUMNS[j] + currentRow;

      // piece exists
      if (obj.hasOwnProperty(square) === true) {
        fen += pieceCodeToFen(obj[square]);
      }

      // empty space
      else {
        fen += '1';
      }
    }

    if (i !== 7) {
      fen += '/';
    }

    currentRow--;
  }

  // squeeze the numbers together
  // haha, I love this solution...
  fen = fen.replace(/11111111/g, '8');
  fen = fen.replace(/1111111/g, '7');
  fen = fen.replace(/111111/g, '6');
  fen = fen.replace(/11111/g, '5');
  fen = fen.replace(/1111/g, '4');
  fen = fen.replace(/111/g, '3');
  fen = fen.replace(/11/g, '2');

  return fen;
}

window['ChessBoard'] = window['ChessBoard'] || function(containerElOrId, cfg) {
'use strict';

cfg = cfg || {};

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

var MINIMUM_JQUERY_VERSION = '1.7.0',
  START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  START_POSITION = fenToObj(START_FEN);

// use unique class names to prevent clashing with anything else on the page
// and simplify selectors
var CSS = {
  alpha: 'alpha-d2270',
  black: 'black-3c85d',
  board: 'board-b72b1',
  chessboard: 'chessboard-63f37',
  clearfix: 'clearfix-7da63',
  highlight1: 'highlight1-32417',
  highlight2: 'highlight2-9c5d2',
  notation: 'notation-322f9',
  numeric: 'numeric-fc462',
  piece: 'piece-417db',
  row: 'row-5277c',
  sparePieces: 'spare-pieces-7492f',
  sparePiecesBottom: 'spare-pieces-bottom-ae20f',
  sparePiecesTop: 'spare-pieces-top-4028b',
  square: 'square-55d63',
  white: 'white-1e1d7'
};

//------------------------------------------------------------------------------
// Module Scope Variables
//------------------------------------------------------------------------------

// DOM elements
var containerEl,
  boardEl,
  draggedPieceEl,
  sparePiecesTopEl,
  sparePiecesBottomEl;

// constructor return object
var widget = {};

//------------------------------------------------------------------------------
// Stateful
//------------------------------------------------------------------------------

var ANIMATION_HAPPENING = false,
  BOARD_BORDER_SIZE = 2,
  CURRENT_ORIENTATION = 'white',
  CURRENT_POSITION = {},
  SQUARE_SIZE,
  DRAGGED_PIECE,
  DRAGGED_PIECE_LOCATION,
  DRAGGED_PIECE_SOURCE,
  DRAGGING_A_PIECE = false,
  SPARE_PIECE_ELS_IDS = {},
  SQUARE_ELS_IDS = {},
  SQUARE_ELS_OFFSETS;

//------------------------------------------------------------------------------
// JS Util Functions
//------------------------------------------------------------------------------

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function createId() {
  return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function(c) {
    var r = Math.random() * 16 | 0;
    return r.toString(16);
  });
}

function deepCopy(thing) {
  return JSON.parse(JSON.stringify(thing));
}

function parseSemVer(version) {
  var tmp = version.split('.');
  return {
    major: parseInt(tmp[0], 10),
    minor: parseInt(tmp[1], 10),
    patch: parseInt(tmp[2], 10)
  };
}

// returns true if version is >= minimum
function compareSemVer(version, minimum) {
  version = parseSemVer(version);
  minimum = parseSemVer(minimum);

  var versionNum = (version.major * 10000 * 10000) +
    (version.minor * 10000) + version.patch;
  var minimumNum = (minimum.major * 10000 * 10000) +
    (minimum.minor * 10000) + minimum.patch;

  return (versionNum >= minimumNum);
}

//------------------------------------------------------------------------------
// Validation / Errors
//------------------------------------------------------------------------------

function error(code, msg, obj) {
  // do nothing if showErrors is not set
  if (cfg.hasOwnProperty('showErrors') !== true ||
      cfg.showErrors === false) {
    return;
  }

  var errorText = 'ChessBoard Error ' + code + ': ' + msg;

  // print to console
  if (cfg.showErrors === 'console' &&
      typeof console === 'object' &&
      typeof console.log === 'function') {
    console.log(errorText);
    if (arguments.length >= 2) {
      console.log(obj);
    }
    return;
  }

  // alert errors
  if (cfg.showErrors === 'alert') {
    if (obj) {
      errorText += '\n\n' + JSON.stringify(obj);
    }
    window.alert(errorText);
    return;
  }

  // custom function
  if (typeof cfg.showErrors === 'function') {
    cfg.showErrors(code, msg, obj);
  }
}

// check dependencies
function checkDeps() {
  // if containerId is a string, it must be the ID of a DOM node
  if (typeof containerElOrId === 'string') {
    // cannot be empty
    if (containerElOrId === '') {
      window.alert('ChessBoard Error 1001: ' +
        'The first argument to ChessBoard() cannot be an empty string.' +
        '\n\nExiting...');
      return false;
    }

    // make sure the container element exists in the DOM
    var el = document.getElementById(containerElOrId);
    if (! el) {
      window.alert('ChessBoard Error 1002: Element with id "' +
        containerElOrId + '" does not exist in the DOM.' +
        '\n\nExiting...');
      return false;
    }

    // set the containerEl
    containerEl = $(el);
  }

  // else it must be something that becomes a jQuery collection
  // with size 1
  // ie: a single DOM node or jQuery object
  else {
    containerEl = $(containerElOrId);

    if (containerEl.length !== 1) {
      window.alert('ChessBoard Error 1003: The first argument to ' +
        'ChessBoard() must be an ID or a single DOM node.' +
        '\n\nExiting...');
      return false;
    }
  }

  // JSON must exist
  if (! window.JSON ||
      typeof JSON.stringify !== 'function' ||
      typeof JSON.parse !== 'function') {
    window.alert('ChessBoard Error 1004: JSON does not exist. ' +
      'Please include a JSON polyfill.\n\nExiting...');
    return false;
  }

  // check for a compatible version of jQuery
  if (! (typeof window.$ && $.fn && $.fn.jquery &&
      compareSemVer($.fn.jquery, MINIMUM_JQUERY_VERSION) === true)) {
    window.alert('ChessBoard Error 1005: Unable to find a valid version ' +
      'of jQuery. Please include jQuery ' + MINIMUM_JQUERY_VERSION + ' or ' +
      'higher on the page.\n\nExiting...');
    return false;
  }

  return true;
}

function validAnimationSpeed(speed) {
  if (speed === 'fast' || speed === 'slow') {
    return true;
  }

  if ((parseInt(speed, 10) + '') !== (speed + '')) {
    return false;
  }

  return (speed >= 0);
}

// validate config / set default options
function expandConfig() {
  if (typeof cfg === 'string' || validPositionObject(cfg) === true) {
    cfg = {
      position: cfg
    };
  }

  // default for orientation is white
  if (cfg.orientation !== 'black') {
    cfg.orientation = 'white';
  }
  CURRENT_ORIENTATION = cfg.orientation;

  // default for showNotation is true
  if (cfg.showNotation !== false) {
    cfg.showNotation = true;
  }

  // default for draggable is false
  if (cfg.draggable !== true) {
    cfg.draggable = false;
  }

  // default for dropOffBoard is 'snapback'
  if (cfg.dropOffBoard !== 'trash') {
    cfg.dropOffBoard = 'snapback';
  }

  // default for sparePieces is false
  if (cfg.sparePieces !== true) {
    cfg.sparePieces = false;
  }

  // draggable must be true if sparePieces is enabled
  if (cfg.sparePieces === true) {
    cfg.draggable = true;
  }

  // default piece theme is wikipedia
  if (cfg.hasOwnProperty('pieceTheme') !== true ||
      (typeof cfg.pieceTheme !== 'string' &&
       typeof cfg.pieceTheme !== 'function')) {
    cfg.pieceTheme = 'img/chesspieces/wikipedia/{piece}.png';
  }

  // animation speeds
  if (cfg.hasOwnProperty('appearSpeed') !== true ||
      validAnimationSpeed(cfg.appearSpeed) !== true) {
    cfg.appearSpeed = 200;
  }
  if (cfg.hasOwnProperty('moveSpeed') !== true ||
      validAnimationSpeed(cfg.moveSpeed) !== true) {
    cfg.moveSpeed = 200;
  }
  if (cfg.hasOwnProperty('snapbackSpeed') !== true ||
      validAnimationSpeed(cfg.snapbackSpeed) !== true) {
    cfg.snapbackSpeed = 50;
  }
  if (cfg.hasOwnProperty('snapSpeed') !== true ||
      validAnimationSpeed(cfg.snapSpeed) !== true) {
    cfg.snapSpeed = 25;
  }
  if (cfg.hasOwnProperty('trashSpeed') !== true ||
      validAnimationSpeed(cfg.trashSpeed) !== true) {
    cfg.trashSpeed = 100;
  }

  // make sure position is valid
  if (cfg.hasOwnProperty('position') === true) {
    if (cfg.position === 'start') {
      CURRENT_POSITION = deepCopy(START_POSITION);
    }

    else if (validFen(cfg.position) === true) {
      CURRENT_POSITION = fenToObj(cfg.position);
    }

    else if (validPositionObject(cfg.position) === true) {
      CURRENT_POSITION = deepCopy(cfg.position);
    }

    else {
      error(7263, 'Invalid value passed to config.position.', cfg.position);
    }
  }

  return true;
}

//------------------------------------------------------------------------------
// DOM Misc
//------------------------------------------------------------------------------

// calculates square size based on the width of the container
// got a little CSS black magic here, so let me explain:
// get the width of the container element (could be anything), reduce by 1 for
// fudge factor, and then keep reducing until we find an exact mod 8 for
// our square size
function calculateSquareSize() {
  var containerWidth = parseInt(containerEl.css('width'), 10);

  // defensive, prevent infinite loop
  if (! containerWidth || containerWidth <= 0) {
    return 0;
  }

  // pad one pixel
  var boardWidth = containerWidth - 1;

  while (boardWidth % 8 !== 0 && boardWidth > 0) {
    boardWidth--;
  }

  return (boardWidth / 8);
}

// create random IDs for elements
function createElIds() {
  // squares on the board
  for (var i = 0; i < COLUMNS.length; i++) {
    for (var j = 1; j <= 8; j++) {
      var square = COLUMNS[i] + j;
      SQUARE_ELS_IDS[square] = square + '-' + createId();
    }
  }

  // spare pieces
  var pieces = 'KQRBNP'.split('');
  for (var i = 0; i < pieces.length; i++) {
    var whitePiece = 'w' + pieces[i];
    var blackPiece = 'b' + pieces[i];
    SPARE_PIECE_ELS_IDS[whitePiece] = whitePiece + '-' + createId();
    SPARE_PIECE_ELS_IDS[blackPiece] = blackPiece + '-' + createId();
  }
}

//------------------------------------------------------------------------------
// Markup Building
//------------------------------------------------------------------------------

function buildBoardContainer() {
  var html = '<div class="' + CSS.chessboard + '">';

  if (cfg.sparePieces === true) {
    html += '<div class="' + CSS.sparePieces + ' ' +
      CSS.sparePiecesTop + '"></div>';
  }

  html += '<div class="' + CSS.board + '"></div>';

  if (cfg.sparePieces === true) {
    html += '<div class="' + CSS.sparePieces + ' ' +
      CSS.sparePiecesBottom + '"></div>';
  }

  html += '</div>';

  return html;
}

/*
var buildSquare = function(color, size, id) {
  var html = '<div class="' + CSS.square + ' ' + CSS[color] + '" ' +
  'style="width: ' + size + 'px; height: ' + size + 'px" ' +
  'id="' + id + '">';

  if (cfg.showNotation === true) {

  }

  html += '</div>';

  return html;
};
*/

function buildBoard(orientation) {
  if (orientation !== 'black') {
    orientation = 'white';
  }

  var html = '';

  // algebraic notation / orientation
  var alpha = deepCopy(COLUMNS);
  var row = 8;
  if (orientation === 'black') {
    alpha.reverse();
    row = 1;
  }

  var squareColor = 'white';
  for (var i = 0; i < 8; i++) {
    html += '<div class="' + CSS.row + '">';
    for (var j = 0; j < 8; j++) {
      var square = alpha[j] + row;

      html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' +
        'square-' + square + '" ' +
        'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' +
        'id="' + SQUARE_ELS_IDS[square] + '" ' +
        'data-square="' + square + '">';

      if (cfg.showNotation === true) {
        // alpha notation
        if ((orientation === 'white' && row === 1) ||
            (orientation === 'black' && row === 8)) {
          html += '<div class="' + CSS.notation + ' ' + CSS.alpha + '">' +
            alpha[j] + '</div>';
        }

        // numeric notation
        if (j === 0) {
          html += '<div class="' + CSS.notation + ' ' + CSS.numeric + '">' +
            row + '</div>';
        }
      }

      html += '</div>'; // end .square

      squareColor = (squareColor === 'white' ? 'black' : 'white');
    }
    html += '<div class="' + CSS.clearfix + '"></div></div>';

    squareColor = (squareColor === 'white' ? 'black' : 'white');

    if (orientation === 'white') {
      row--;
    }
    else {
      row++;
    }
  }

  return html;
}

function buildPieceImgSrc(piece) {
  if (typeof cfg.pieceTheme === 'function') {
    return cfg.pieceTheme(piece);
  }

  if (typeof cfg.pieceTheme === 'string') {
    return cfg.pieceTheme.replace(/{piece}/g, piece);
  }

  // NOTE: this should never happen
  error(8272, 'Unable to build image source for cfg.pieceTheme.');
  return '';
}

function buildPiece(piece, hidden, id) {
  var html = '<img src="' + buildPieceImgSrc(piece) + '" ';
  if (id && typeof id === 'string') {
    html += 'id="' + id + '" ';
  }
  html += 'alt="" ' +
  'class="' + CSS.piece + '" ' +
  'data-piece="' + piece + '" ' +
  'style="width: ' + SQUARE_SIZE + 'px;' +
  'height: ' + SQUARE_SIZE + 'px;';
  if (hidden === true) {
    html += 'display:none;';
  }
  html += '" />';

  return html;
}

function buildSparePieces(color) {
  var pieces = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'];
  if (color === 'black') {
    pieces = ['bK', 'bQ', 'bR', 'bB', 'bN', 'bP'];
  }

  var html = '';
  for (var i = 0; i < pieces.length; i++) {
    html += buildPiece(pieces[i], false, SPARE_PIECE_ELS_IDS[pieces[i]]);
  }

  return html;
}

//------------------------------------------------------------------------------
// Animations
//------------------------------------------------------------------------------

function animateSquareToSquare(src, dest, piece, completeFn) {
  // get information about the source and destination squares
  var srcSquareEl = $('#' + SQUARE_ELS_IDS[src]);
  var srcSquarePosition = srcSquareEl.offset();
  var destSquareEl = $('#' + SQUARE_ELS_IDS[dest]);
  var destSquarePosition = destSquareEl.offset();

  // create the animated piece and absolutely position it
  // over the source square
  var animatedPieceId = createId();
  $('body').append(buildPiece(piece, true, animatedPieceId));
  var animatedPieceEl = $('#' + animatedPieceId);
  animatedPieceEl.css({
    display: '',
    position: 'absolute',
    top: srcSquarePosition.top,
    left: srcSquarePosition.left
  });

  // remove original piece from source square
  srcSquareEl.find('.' + CSS.piece).remove();

  // on complete
  var complete = function() {
    // add the "real" piece to the destination square
    destSquareEl.append(buildPiece(piece));

    // remove the animated piece
    animatedPieceEl.remove();

    // run complete function
    if (typeof completeFn === 'function') {
      completeFn();
    }
  };

  // animate the piece to the destination square
  var opts = {
    duration: cfg.moveSpeed,
    complete: complete
  };
  animatedPieceEl.animate(destSquarePosition, opts);
}

function animateSparePieceToSquare(piece, dest, completeFn) {
  var srcOffset = $('#' + SPARE_PIECE_ELS_IDS[piece]).offset();
  var destSquareEl = $('#' + SQUARE_ELS_IDS[dest]);
  var destOffset = destSquareEl.offset();

  // create the animate piece
  var pieceId = createId();
  $('body').append(buildPiece(piece, true, pieceId));
  var animatedPieceEl = $('#' + pieceId);
  animatedPieceEl.css({
    display: '',
    position: 'absolute',
    left: srcOffset.left,
    top: srcOffset.top
  });

  // on complete
  var complete = function() {
    // add the "real" piece to the destination square
    destSquareEl.find('.' + CSS.piece).remove();
    destSquareEl.append(buildPiece(piece));

    // remove the animated piece
    animatedPieceEl.remove();

    // run complete function
    if (typeof completeFn === 'function') {
      completeFn();
    }
  };

  // animate the piece to the destination square
  var opts = {
    duration: cfg.moveSpeed,
    complete: complete
  };
  animatedPieceEl.animate(destOffset, opts);
}

// execute an array of animations
function doAnimations(a, oldPos, newPos) {
  ANIMATION_HAPPENING = true;

  var numFinished = 0;
  function onFinish() {
    numFinished++;

    // exit if all the animations aren't finished
    if (numFinished !== a.length) return;

    drawPositionInstant();
    ANIMATION_HAPPENING = false;

    // run their onMoveEnd function
    if (cfg.hasOwnProperty('onMoveEnd') === true &&
      typeof cfg.onMoveEnd === 'function') {
      cfg.onMoveEnd(deepCopy(oldPos), deepCopy(newPos));
    }
  }

  for (var i = 0; i < a.length; i++) {
    // clear a piece
    if (a[i].type === 'clear') {
      $('#' + SQUARE_ELS_IDS[a[i].square] + ' .' + CSS.piece)
        .fadeOut(cfg.trashSpeed, onFinish);
    }

    // add a piece (no spare pieces)
    if (a[i].type === 'add' && cfg.sparePieces !== true) {
      $('#' + SQUARE_ELS_IDS[a[i].square])
        .append(buildPiece(a[i].piece, true))
        .find('.' + CSS.piece)
        .fadeIn(cfg.appearSpeed, onFinish);
    }

    // add a piece from a spare piece
    if (a[i].type === 'add' && cfg.sparePieces === true) {
      animateSparePieceToSquare(a[i].piece, a[i].square, onFinish);
    }

    // move a piece
    if (a[i].type === 'move') {
      animateSquareToSquare(a[i].source, a[i].destination, a[i].piece,
        onFinish);
    }
  }
}

// returns the distance between two squares
function squareDistance(s1, s2) {
  s1 = s1.split('');
  var s1x = COLUMNS.indexOf(s1[0]) + 1;
  var s1y = parseInt(s1[1], 10);

  s2 = s2.split('');
  var s2x = COLUMNS.indexOf(s2[0]) + 1;
  var s2y = parseInt(s2[1], 10);

  var xDelta = Math.abs(s1x - s2x);
  var yDelta = Math.abs(s1y - s2y);

  if (xDelta >= yDelta) return xDelta;
  return yDelta;
}

// returns an array of closest squares from square
function createRadius(square) {
  var squares = [];

  // calculate distance of all squares
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var s = COLUMNS[i] + (j + 1);

      // skip the square we're starting from
      if (square === s) continue;

      squares.push({
        square: s,
        distance: squareDistance(square, s)
      });
    }
  }

  // sort by distance
  squares.sort(function(a, b) {
    return a.distance - b.distance;
  });

  // just return the square code
  var squares2 = [];
  for (var i = 0; i < squares.length; i++) {
    squares2.push(squares[i].square);
  }

  return squares2;
}

// returns the square of the closest instance of piece
// returns false if no instance of piece is found in position
function findClosestPiece(position, piece, square) {
  // create array of closest squares from square
  var closestSquares = createRadius(square);

  // search through the position in order of distance for the piece
  for (var i = 0; i < closestSquares.length; i++) {
    var s = closestSquares[i];

    if (position.hasOwnProperty(s) === true && position[s] === piece) {
      return s;
    }
  }

  return false;
}

// calculate an array of animations that need to happen in order to get
// from pos1 to pos2
function calculateAnimations(pos1, pos2) {
  // make copies of both
  pos1 = deepCopy(pos1);
  pos2 = deepCopy(pos2);

  var animations = [];
  var squaresMovedTo = {};

  // remove pieces that are the same in both positions
  for (var i in pos2) {
    if (pos2.hasOwnProperty(i) !== true) continue;

    if (pos1.hasOwnProperty(i) === true && pos1[i] === pos2[i]) {
      delete pos1[i];
      delete pos2[i];
    }
  }

  // find all the "move" animations
  for (var i in pos2) {
    if (pos2.hasOwnProperty(i) !== true) continue;

    var closestPiece = findClosestPiece(pos1, pos2[i], i);
    if (closestPiece !== false) {
      animations.push({
        type: 'move',
        source: closestPiece,
        destination: i,
        piece: pos2[i]
      });

      delete pos1[closestPiece];
      delete pos2[i];
      squaresMovedTo[i] = true;
    }
  }

  // add pieces to pos2
  for (var i in pos2) {
    if (pos2.hasOwnProperty(i) !== true) continue;

    animations.push({
      type: 'add',
      square: i,
      piece: pos2[i]
    })

    delete pos2[i];
  }

  // clear pieces from pos1
  for (var i in pos1) {
    if (pos1.hasOwnProperty(i) !== true) continue;

    // do not clear a piece if it is on a square that is the result
    // of a "move", ie: a piece capture
    if (squaresMovedTo.hasOwnProperty(i) === true) continue;

    animations.push({
      type: 'clear',
      square: i,
      piece: pos1[i]
    });

    delete pos1[i];
  }

  return animations;
}

//------------------------------------------------------------------------------
// Control Flow
//------------------------------------------------------------------------------

function drawPositionInstant() {
  // clear the board
  boardEl.find('.' + CSS.piece).remove();

  // add the pieces
  for (var i in CURRENT_POSITION) {
    if (CURRENT_POSITION.hasOwnProperty(i) !== true) continue;

    $('#' + SQUARE_ELS_IDS[i]).append(buildPiece(CURRENT_POSITION[i]));
  }
}

function drawBoard() {
  boardEl.html(buildBoard(CURRENT_ORIENTATION));
  drawPositionInstant();

  if (cfg.sparePieces === true) {
    if (CURRENT_ORIENTATION === 'white') {
      sparePiecesTopEl.html(buildSparePieces('black'));
      sparePiecesBottomEl.html(buildSparePieces('white'));
    }
    else {
      sparePiecesTopEl.html(buildSparePieces('white'));
      sparePiecesBottomEl.html(buildSparePieces('black'));
    }
  }
}

// given a position and a set of moves, return a new position
// with the moves executed
function calculatePositionFromMoves(position, moves) {
  position = deepCopy(position);

  for (var i in moves) {
    if (moves.hasOwnProperty(i) !== true) continue;

    // skip the move if the position doesn't have a piece on the source square
    if (position.hasOwnProperty(i) !== true) continue;

    var piece = position[i];
    delete position[i];
    position[moves[i]] = piece;
  }

  return position;
}

function setCurrentPosition(position) {
  var oldPos = deepCopy(CURRENT_POSITION);
  var newPos = deepCopy(position);
  var oldFen = objToFen(oldPos);
  var newFen = objToFen(newPos);

  // do nothing if no change in position
  if (oldFen === newFen) return;

  // run their onChange function
  if (cfg.hasOwnProperty('onChange') === true &&
    typeof cfg.onChange === 'function') {
    cfg.onChange(oldPos, newPos);
  }

  // update state
  CURRENT_POSITION = position;
}

function isXYOnSquare(x, y) {
  for (var i in SQUARE_ELS_OFFSETS) {
    if (SQUARE_ELS_OFFSETS.hasOwnProperty(i) !== true) continue;

    var s = SQUARE_ELS_OFFSETS[i];
    if (x >= s.left && x < s.left + SQUARE_SIZE &&
        y >= s.top && y < s.top + SQUARE_SIZE) {
      return i;
    }
  }

  return 'offboard';
}

// records the XY coords of every square into memory
function captureSquareOffsets() {
  SQUARE_ELS_OFFSETS = {};

  for (var i in SQUARE_ELS_IDS) {
    if (SQUARE_ELS_IDS.hasOwnProperty(i) !== true) continue;

    SQUARE_ELS_OFFSETS[i] = $('#' + SQUARE_ELS_IDS[i]).offset();
  }
}

function removeSquareHighlights() {
  boardEl.find('.' + CSS.square)
    .removeClass(CSS.highlight1 + ' ' + CSS.highlight2);
}

function snapbackDraggedPiece() {
  // there is no "snapback" for spare pieces
  if (DRAGGED_PIECE_SOURCE === 'spare') {
    trashDraggedPiece();
    return;
  }

  removeSquareHighlights();

  // animation complete
  function complete() {
    drawPositionInstant();
    draggedPieceEl.css('display', 'none');

    // run their onSnapbackEnd function
    if (cfg.hasOwnProperty('onSnapbackEnd') === true &&
      typeof cfg.onSnapbackEnd === 'function') {
      cfg.onSnapbackEnd(DRAGGED_PIECE, DRAGGED_PIECE_SOURCE,
        deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION);
    }
  }

  // get source square position
  var sourceSquarePosition =
    $('#' + SQUARE_ELS_IDS[DRAGGED_PIECE_SOURCE]).offset();

  // animate the piece to the target square
  var opts = {
    duration: cfg.snapbackSpeed,
    complete: complete
  };
  draggedPieceEl.animate(sourceSquarePosition, opts);

  // set state
  DRAGGING_A_PIECE = false;
}

function trashDraggedPiece() {
  removeSquareHighlights();

  // remove the source piece
  var newPosition = deepCopy(CURRENT_POSITION);
  delete newPosition[DRAGGED_PIECE_SOURCE];
  setCurrentPosition(newPosition);

  // redraw the position
  drawPositionInstant();

  // hide the dragged piece
  draggedPieceEl.fadeOut(cfg.trashSpeed);

  // set state
  DRAGGING_A_PIECE = false;
}

function dropDraggedPieceOnSquare(square) {
  removeSquareHighlights();

  // update position
  var newPosition = deepCopy(CURRENT_POSITION);
  delete newPosition[DRAGGED_PIECE_SOURCE];
  newPosition[square] = DRAGGED_PIECE;
  setCurrentPosition(newPosition);

  // get target square information
  var targetSquarePosition = $('#' + SQUARE_ELS_IDS[square]).offset();

  // animation complete
  var complete = function() {
    drawPositionInstant();
    draggedPieceEl.css('display', 'none');

    // execute their onSnapEnd function
    if (cfg.hasOwnProperty('onSnapEnd') === true &&
      typeof cfg.onSnapEnd === 'function') {
      cfg.onSnapEnd(DRAGGED_PIECE_SOURCE, square, DRAGGED_PIECE);
    }
  };

  // snap the piece to the target square
  var opts = {
    duration: cfg.snapSpeed,
    complete: complete
  };
  draggedPieceEl.animate(targetSquarePosition, opts);

  // set state
  DRAGGING_A_PIECE = false;
}

function beginDraggingPiece(source, piece, x, y) {
  // run their custom onDragStart function
  // their custom onDragStart function can cancel drag start
  if (typeof cfg.onDragStart === 'function' &&
      cfg.onDragStart(source, piece,
        deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION) === false) {
    return;
  }

  // set state
  DRAGGING_A_PIECE = true;
  DRAGGED_PIECE = piece;
  DRAGGED_PIECE_SOURCE = source;

  // if the piece came from spare pieces, location is offboard
  if (source === 'spare') {
    DRAGGED_PIECE_LOCATION = 'offboard';
  }
  else {
    DRAGGED_PIECE_LOCATION = source;
  }

  // capture the x, y coords of all squares in memory
  captureSquareOffsets();

  // create the dragged piece
  draggedPieceEl.attr('src', buildPieceImgSrc(piece))
    .css({
      display: '',
      position: 'absolute',
      left: x - (SQUARE_SIZE / 2),
      top: y - (SQUARE_SIZE / 2)
    });

  if (source !== 'spare') {
    // highlight the source square and hide the piece
    $('#' + SQUARE_ELS_IDS[source]).addClass(CSS.highlight1)
      .find('.' + CSS.piece).css('display', 'none');
  }
}

function updateDraggedPiece(x, y) {
  // put the dragged piece over the mouse cursor
  draggedPieceEl.css({
    left: x - (SQUARE_SIZE / 2),
    top: y - (SQUARE_SIZE / 2)
  });

  // get location
  var location = isXYOnSquare(x, y);

  // do nothing if the location has not changed
  if (location === DRAGGED_PIECE_LOCATION) return;

  // remove highlight from previous square
  if (validSquare(DRAGGED_PIECE_LOCATION) === true) {
    $('#' + SQUARE_ELS_IDS[DRAGGED_PIECE_LOCATION])
      .removeClass(CSS.highlight2);
  }

  // add highlight to new square
  if (validSquare(location) === true) {
    $('#' + SQUARE_ELS_IDS[location]).addClass(CSS.highlight2);
  }

  // run onDragMove
  if (typeof cfg.onDragMove === 'function') {
    cfg.onDragMove(location, DRAGGED_PIECE_LOCATION,
      DRAGGED_PIECE_SOURCE, DRAGGED_PIECE,
      deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION);
  }

  // update state
  DRAGGED_PIECE_LOCATION = location;
}

function stopDraggedPiece(location) {
  // determine what the action should be
  var action = 'drop';
  if (location === 'offboard' && cfg.dropOffBoard === 'snapback') {
    action = 'snapback';
  }
  if (location === 'offboard' && cfg.dropOffBoard === 'trash') {
    action = 'trash';
  }

  // run their onDrop function, which can potentially change the drop action
  if (cfg.hasOwnProperty('onDrop') === true &&
    typeof cfg.onDrop === 'function') {
    var newPosition = deepCopy(CURRENT_POSITION);

    // source piece is a spare piece and position is off the board
    //if (DRAGGED_PIECE_SOURCE === 'spare' && location === 'offboard') {...}
    // position has not changed; do nothing

    // source piece is a spare piece and position is on the board
    if (DRAGGED_PIECE_SOURCE === 'spare' && validSquare(location) === true) {
      // add the piece to the board
      newPosition[location] = DRAGGED_PIECE;
    }

    // source piece was on the board and position is off the board
    if (validSquare(DRAGGED_PIECE_SOURCE) === true && location === 'offboard') {
      // remove the piece from the board
      delete newPosition[DRAGGED_PIECE_SOURCE];
    }

    // source piece was on the board and position is on the board
    if (validSquare(DRAGGED_PIECE_SOURCE) === true &&
      validSquare(location) === true) {
      // move the piece
      delete newPosition[DRAGGED_PIECE_SOURCE];
      newPosition[location] = DRAGGED_PIECE;
    }

    var oldPosition = deepCopy(CURRENT_POSITION);

    var result = cfg.onDrop(DRAGGED_PIECE_SOURCE, location, DRAGGED_PIECE,
      newPosition, oldPosition, CURRENT_ORIENTATION);
    if (result === 'snapback' || result === 'trash') {
      action = result;
    }
  }

  // do it!
  if (action === 'snapback') {
    snapbackDraggedPiece();
  }
  else if (action === 'trash') {
    trashDraggedPiece();
  }
  else if (action === 'drop') {
    dropDraggedPieceOnSquare(location);
  }
}

//------------------------------------------------------------------------------
// Public Methods
//------------------------------------------------------------------------------

// clear the board
widget.clear = function(useAnimation) {
  widget.position({}, useAnimation);
};

/*
// get or set config properties
// TODO: write this, GitHub Issue #1
widget.config = function(arg1, arg2) {
  // get the current config
  if (arguments.length === 0) {
    return deepCopy(cfg);
  }
};
*/

// remove the widget from the page
widget.destroy = function() {
  // remove markup
  containerEl.html('');
  draggedPieceEl.remove();

  // remove event handlers
  containerEl.unbind();
};

// shorthand method to get the current FEN
widget.fen = function() {
  return widget.position('fen');
};

// flip orientation
widget.flip = function() {
  widget.orientation('flip');
};

/*
// TODO: write this, GitHub Issue #5
widget.highlight = function() {

};
*/

// move pieces
widget.move = function() {
  // no need to throw an error here; just do nothing
  if (arguments.length === 0) return;

  var useAnimation = true;

  // collect the moves into an object
  var moves = {};
  for (var i = 0; i < arguments.length; i++) {
    // any "false" to this function means no animations
    if (arguments[i] === false) {
      useAnimation = false;
      continue;
    }

    // skip invalid arguments
    if (validMove(arguments[i]) !== true) {
      error(2826, 'Invalid move passed to the move method.', arguments[i]);
      continue;
    }

    var tmp = arguments[i].split('-');
    moves[tmp[0]] = tmp[1];
  }

  // calculate position from moves
  var newPos = calculatePositionFromMoves(CURRENT_POSITION, moves);

  // update the board
  widget.position(newPos, useAnimation);

  // return the new position object
  return newPos;
};

widget.orientation = function(arg) {
  // no arguments, return the current orientation
  if (arguments.length === 0) {
    return CURRENT_ORIENTATION;
  }

  // set to white or black
  if (arg === 'white' || arg === 'black') {
    CURRENT_ORIENTATION = arg;
    drawBoard();
    return;
  }

  // flip orientation
  if (arg === 'flip') {
    CURRENT_ORIENTATION = (CURRENT_ORIENTATION === 'white') ? 'black' : 'white';
    drawBoard();
    return;
  }

  error(5482, 'Invalid value passed to the orientation method.', arg);
};

widget.position = function(position, useAnimation) {
  // no arguments, return the current position
  if (arguments.length === 0) {
    return deepCopy(CURRENT_POSITION);
  }

  // get position as FEN
  if (typeof position === 'string' && position.toLowerCase() === 'fen') {
    return objToFen(CURRENT_POSITION);
  }

  // default for useAnimations is true
  if (useAnimation !== false) {
    useAnimation = true;
  }

  // start position
  if (typeof position === 'string' && position.toLowerCase() === 'start') {
    position = deepCopy(START_POSITION);
  }

  // convert FEN to position object
  if (validFen(position) === true) {
    position = fenToObj(position);
  }

  // validate position object
  if (validPositionObject(position) !== true) {
    error(6482, 'Invalid value passed to the position method.', position);
    return;
  }

  if (useAnimation === true) {
    // start the animations
    doAnimations(calculateAnimations(CURRENT_POSITION, position),
      CURRENT_POSITION, position);

    // set the new position
    setCurrentPosition(position);
  }
  // instant update
  else {
    setCurrentPosition(position);
    drawPositionInstant();
  }
};

widget.resize = function() {
  // calulate the new square size
  SQUARE_SIZE = calculateSquareSize();

  // set board width
  boardEl.css('width', (SQUARE_SIZE * 8) + 'px');

  // set drag piece size
  draggedPieceEl.css({
    height: SQUARE_SIZE,
    width: SQUARE_SIZE
  });

  // spare pieces
  if (cfg.sparePieces === true) {
    containerEl.find('.' + CSS.sparePieces)
      .css('paddingLeft', (SQUARE_SIZE + BOARD_BORDER_SIZE) + 'px');
  }

  // redraw the board
  drawBoard();
};

// set the starting position
widget.start = function(useAnimation) {
  widget.position('start', useAnimation);
};

//------------------------------------------------------------------------------
// Browser Events
//------------------------------------------------------------------------------

function isTouchDevice() {
  return ('ontouchstart' in document.documentElement);
}

// reference: http://www.quirksmode.org/js/detect.html
function isMSIE() {
  return (navigator && navigator.userAgent &&
      navigator.userAgent.search(/MSIE/) !== -1);
}

function stopDefault(e) {
  e.preventDefault();
}

function mousedownSquare(e) {
  // do nothing if we're not draggable
  if (cfg.draggable !== true) return;

  var square = $(this).attr('data-square');

  // no piece on this square
  if (validSquare(square) !== true ||
      CURRENT_POSITION.hasOwnProperty(square) !== true) {
    return;
  }

  beginDraggingPiece(square, CURRENT_POSITION[square], e.pageX, e.pageY);
}

function touchstartSquare(e) {
  // do nothing if we're not draggable
  if (cfg.draggable !== true) return;

  var square = $(this).attr('data-square');

  // no piece on this square
  if (validSquare(square) !== true ||
      CURRENT_POSITION.hasOwnProperty(square) !== true) {
    return;
  }

  e = e.originalEvent;
  beginDraggingPiece(square, CURRENT_POSITION[square],
    e.changedTouches[0].pageX, e.changedTouches[0].pageY);
}

function mousedownSparePiece(e) {
  // do nothing if sparePieces is not enabled
  if (cfg.sparePieces !== true) return;

  var piece = $(this).attr('data-piece');

  beginDraggingPiece('spare', piece, e.pageX, e.pageY);
}

function touchstartSparePiece(e) {
  // do nothing if sparePieces is not enabled
  if (cfg.sparePieces !== true) return;

  var piece = $(this).attr('data-piece');

  e = e.originalEvent;
  beginDraggingPiece('spare', piece,
    e.changedTouches[0].pageX, e.changedTouches[0].pageY);
}

function mousemoveWindow(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true) return;

  updateDraggedPiece(e.pageX, e.pageY);
}

function touchmoveWindow(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true) return;

  // prevent screen from scrolling
  e.preventDefault();

  updateDraggedPiece(e.originalEvent.changedTouches[0].pageX,
    e.originalEvent.changedTouches[0].pageY);
}

function mouseupWindow(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true) return;

  // get the location
  var location = isXYOnSquare(e.pageX, e.pageY);

  stopDraggedPiece(location);
}

function touchendWindow(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true) return;

  // get the location
  var location = isXYOnSquare(e.originalEvent.changedTouches[0].pageX,
    e.originalEvent.changedTouches[0].pageY);

  stopDraggedPiece(location);
}

function mouseenterSquare(e) {
  // do not fire this event if we are dragging a piece
  // NOTE: this should never happen, but it's a safeguard
  if (DRAGGING_A_PIECE !== false) return;

  if (cfg.hasOwnProperty('onMouseoverSquare') !== true ||
    typeof cfg.onMouseoverSquare !== 'function') return;

  // get the square
  var square = $(e.currentTarget).attr('data-square');

  // NOTE: this should never happen; defensive
  if (validSquare(square) !== true) return;

  // get the piece on this square
  var piece = false;
  if (CURRENT_POSITION.hasOwnProperty(square) === true) {
    piece = CURRENT_POSITION[square];
  }

  // execute their function
  cfg.onMouseoverSquare(square, piece, deepCopy(CURRENT_POSITION),
    CURRENT_ORIENTATION);
}

function mouseleaveSquare(e) {
  // do not fire this event if we are dragging a piece
  // NOTE: this should never happen, but it's a safeguard
  if (DRAGGING_A_PIECE !== false) return;

  if (cfg.hasOwnProperty('onMouseoutSquare') !== true ||
    typeof cfg.onMouseoutSquare !== 'function') return;

  // get the square
  var square = $(e.currentTarget).attr('data-square');

  // NOTE: this should never happen; defensive
  if (validSquare(square) !== true) return;

  // get the piece on this square
  var piece = false;
  if (CURRENT_POSITION.hasOwnProperty(square) === true) {
    piece = CURRENT_POSITION[square];
  }

  // execute their function
  cfg.onMouseoutSquare(square, piece, deepCopy(CURRENT_POSITION),
    CURRENT_ORIENTATION);
}

//------------------------------------------------------------------------------
// Initialization
//------------------------------------------------------------------------------

function addEvents() {
  // prevent browser "image drag"
  $('body').on('mousedown mousemove', '.' + CSS.piece, stopDefault);

  // mouse drag pieces
  boardEl.on('mousedown', '.' + CSS.square, mousedownSquare);
  containerEl.on('mousedown', '.' + CSS.sparePieces + ' .' + CSS.piece,
    mousedownSparePiece);

  // mouse enter / leave square
  boardEl.on('mouseenter', '.' + CSS.square, mouseenterSquare);
  boardEl.on('mouseleave', '.' + CSS.square, mouseleaveSquare);

  // IE doesn't like the events on the window object, but other browsers
  // perform better that way
  if (isMSIE() === true) {
    // IE-specific prevent browser "image drag"
    document.ondragstart = function() { return false; };

    $('body').on('mousemove', mousemoveWindow);
    $('body').on('mouseup', mouseupWindow);
  }
  else {
    $(window).on('mousemove', mousemoveWindow);
    $(window).on('mouseup', mouseupWindow);
  }

  // touch drag pieces
  if (isTouchDevice() === true) {
    boardEl.on('touchstart', '.' + CSS.square, touchstartSquare);
    containerEl.on('touchstart', '.' + CSS.sparePieces + ' .' + CSS.piece,
      touchstartSparePiece);
    $(window).on('touchmove', touchmoveWindow);
    $(window).on('touchend', touchendWindow);
  }
}

function initDom() {
  // build board and save it in memory
  containerEl.html(buildBoardContainer());
  boardEl = containerEl.find('.' + CSS.board);

  if (cfg.sparePieces === true) {
    sparePiecesTopEl = containerEl.find('.' + CSS.sparePiecesTop);
    sparePiecesBottomEl = containerEl.find('.' + CSS.sparePiecesBottom);
  }

  // create the drag piece
  var draggedPieceId = createId();
  $('body').append(buildPiece('wP', true, draggedPieceId));
  draggedPieceEl = $('#' + draggedPieceId);

  // get the border size
  BOARD_BORDER_SIZE = parseInt(boardEl.css('borderLeftWidth'), 10);

  // set the size and draw the board
  widget.resize();
}

function init() {
  if (checkDeps() !== true ||
      expandConfig() !== true) return;

  // create unique IDs for all the elements we will create
  createElIds();

  initDom();
  addEvents();
}

// go time
init();

// return the widget object
return widget;

}; // end window.ChessBoard

// expose util functions
window.ChessBoard.fenToObj = fenToObj;
window.ChessBoard.objToFen = objToFen;

})(); // end anonymous wrapper

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
				var move = scope.board.move({
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
// console.log(move, chessboard.position());
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
/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.10.0 - 2014-01-17
 * License: MIT
 */
angular.module("ui.bootstrap", ["ui.bootstrap.dropdownToggle","ui.bootstrap.position","ui.bootstrap.bindHtml","ui.bootstrap.tooltip"]);
/*
 * dropdownToggle - Provides dropdown menu functionality in place of bootstrap js
 * @restrict class or attribute
 * @example:
   <li class="dropdown">
     <a class="dropdown-toggle">My Dropdown Menu</a>
     <ul class="dropdown-menu">
       <li ng-repeat="choice in dropChoices">
         <a ng-href="{{choice.href}}">{{choice.text}}</a>
       </li>
     </ul>
   </li>
 */

angular.module('ui.bootstrap.dropdownToggle', []).directive('dropdownToggle', ['$document', '$location', function ($document, $location) {
  var openElement = null,
      closeMenu   = angular.noop;
  return {
    restrict: 'CA',
    link: function(scope, element, attrs) {
      scope.$watch('$location.path', function() { closeMenu(); });
      element.parent().bind('click', function() { closeMenu(); });
      element.bind('click', function (event) {

        var elementWasOpen = (element === openElement);

        event.preventDefault();
        event.stopPropagation();

        if (!!openElement) {
          closeMenu();
        }

        if (!elementWasOpen && !element.hasClass('disabled') && !element.prop('disabled')) {
          element.parent().addClass('open');
          openElement = element;
          closeMenu = function (event) {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }
            $document.unbind('click', closeMenu);
            element.parent().removeClass('open');
            closeMenu = angular.noop;
            openElement = null;
          };
          $document.bind('click', closeMenu);
        }
      });
    }
  };
}]);

angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, "position") || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft  || $document[0].documentElement.scrollLeft)
        };
      }
    };
  }]);

angular.module('ui.bootstrap.bindHtml', [])

  .directive('bindHtmlUnsafe', function () {
    return function (scope, element, attr) {
      element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
      scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
        element.html(value || '');
      });
    };
  });
/**
 * The following features are still outstanding: animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html tooltips, and selector delegation.
 */
angular.module( 'ui.bootstrap.tooltip', [ 'ui.bootstrap.position', 'ui.bootstrap.bindHtml' ] )

/**
 * The $tooltip service creates tooltip- and popover-like directives as well as
 * houses global options for them.
 */
.provider( '$tooltip', function () {
  // The default options tooltip and popover.
  var defaultOptions = {
    placement: 'top',
    animation: true,
    popupDelay: 0
  };

  // Default hide triggers for each show trigger
  var triggerMap = {
    'mouseenter': 'mouseleave',
    'click': 'click',
    'focus': 'blur'
  };

  // The options specified to the provider globally.
  var globalOptions = {};
  
  /**
   * `options({})` allows global configuration of all tooltips in the
   * application.
   *
   *   var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function( $tooltipProvider ) {
   *     // place tooltips left instead of top by default
   *     $tooltipProvider.options( { placement: 'left' } );
   *   });
   */
	this.options = function( value ) {
		angular.extend( globalOptions, value );
	};

  /**
   * This allows you to extend the set of trigger mappings available. E.g.:
   *
   *   $tooltipProvider.setTriggers( 'openTrigger': 'closeTrigger' );
   */
  this.setTriggers = function setTriggers ( triggers ) {
    angular.extend( triggerMap, triggers );
  };

  /**
   * This is a helper function for translating camel-case to snake-case.
   */
  function snake_case(name){
    var regexp = /[A-Z]/g;
    var separator = '-';
    return name.replace(regexp, function(letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }

  /**
   * Returns the actual instance of the $tooltip service.
   * TODO support multiple triggers
   */
  this.$get = [ '$window', '$compile', '$timeout', '$parse', '$document', '$position', '$interpolate', function ( $window, $compile, $timeout, $parse, $document, $position, $interpolate ) {
    return function $tooltip ( type, prefix, defaultTriggerShow ) {
      var options = angular.extend( {}, defaultOptions, globalOptions );

      /**
       * Returns an object of show and hide triggers.
       *
       * If a trigger is supplied,
       * it is used to show the tooltip; otherwise, it will use the `trigger`
       * option passed to the `$tooltipProvider.options` method; else it will
       * default to the trigger supplied to this directive factory.
       *
       * The hide trigger is based on the show trigger. If the `trigger` option
       * was passed to the `$tooltipProvider.options` method, it will use the
       * mapped trigger from `triggerMap` or the passed trigger if the map is
       * undefined; otherwise, it uses the `triggerMap` value of the show
       * trigger; else it will just use the show trigger.
       */
      function getTriggers ( trigger ) {
        var show = trigger || options.trigger || defaultTriggerShow;
        var hide = triggerMap[show] || show;
        return {
          show: show,
          hide: hide
        };
      }

      var directiveName = snake_case( type );

      var startSym = $interpolate.startSymbol();
      var endSym = $interpolate.endSymbol();
      var template = 
        '<div '+ directiveName +'-popup '+
          'title="'+startSym+'tt_title'+endSym+'" '+
          'content="'+startSym+'tt_content'+endSym+'" '+
          'placement="'+startSym+'tt_placement'+endSym+'" '+
          'animation="tt_animation" '+
          'is-open="tt_isOpen"'+
          '>'+
        '</div>';

      return {
        restrict: 'EA',
        scope: true,
        compile: function (tElem, tAttrs) {
          var tooltipLinker = $compile( template );

          return function link ( scope, element, attrs ) {
            var tooltip;
            var transitionTimeout;
            var popupTimeout;
            var appendToBody = angular.isDefined( options.appendToBody ) ? options.appendToBody : false;
            var triggers = getTriggers( undefined );
            var hasRegisteredTriggers = false;
            var hasEnableExp = angular.isDefined(attrs[prefix+'Enable']);

            var positionTooltip = function (){
              var position,
                ttWidth,
                ttHeight,
                ttPosition;
              // Get the position of the directive element.
              position = appendToBody ? $position.offset( element ) : $position.position( element );

              // Get the height and width of the tooltip so we can center it.
              ttWidth = tooltip.prop( 'offsetWidth' );
              ttHeight = tooltip.prop( 'offsetHeight' );

              // Calculate the tooltip's top and left coordinates to center it with
              // this directive.
              switch ( scope.tt_placement ) {
                case 'right':
                  ttPosition = {
                    top: position.top + position.height / 2 - ttHeight / 2,
                    left: position.left + position.width
                  };
                  break;
                case 'bottom':
                  ttPosition = {
                    top: position.top + position.height,
                    left: position.left + position.width / 2 - ttWidth / 2
                  };
                  break;
                case 'left':
                  ttPosition = {
                    top: position.top + position.height / 2 - ttHeight / 2,
                    left: position.left - ttWidth
                  };
                  break;
                default:
                  ttPosition = {
                    top: position.top - ttHeight,
                    left: position.left + position.width / 2 - ttWidth / 2
                  };
                  break;
              }

              ttPosition.top += 'px';
              ttPosition.left += 'px';

              // Now set the calculated positioning.
              tooltip.css( ttPosition );

            };

            // By default, the tooltip is not open.
            // TODO add ability to start tooltip opened
            scope.tt_isOpen = false;

            function toggleTooltipBind () {
              if ( ! scope.tt_isOpen ) {
                showTooltipBind();
              } else {
                hideTooltipBind();
              }
            }

            // Show the tooltip with delay if specified, otherwise show it immediately
            function showTooltipBind() {
              if(hasEnableExp && !scope.$eval(attrs[prefix+'Enable'])) {
                return;
              }
              if ( scope.tt_popupDelay ) {
                popupTimeout = $timeout( show, scope.tt_popupDelay, false );
                popupTimeout.then(function(reposition){reposition();});
              } else {
                show()();
              }
            }

            function hideTooltipBind () {
              scope.$apply(function () {
                hide();
              });
            }

            // Show the tooltip popup element.
            function show() {


              // Don't show empty tooltips.
              if ( ! scope.tt_content ) {
                return angular.noop;
              }

              createTooltip();

              // If there is a pending remove transition, we must cancel it, lest the
              // tooltip be mysteriously removed.
              if ( transitionTimeout ) {
                $timeout.cancel( transitionTimeout );
              }

              // Set the initial positioning.
              tooltip.css({ top: 0, left: 0, display: 'block' });

              // Now we add it to the DOM because need some info about it. But it's not 
              // visible yet anyway.
              if ( appendToBody ) {
                  $document.find( 'body' ).append( tooltip );
              } else {
                element.after( tooltip );
              }

              positionTooltip();

              // And show the tooltip.
              scope.tt_isOpen = true;
              scope.$digest(); // digest required as $apply is not called

              // Return positioning function as promise callback for correct
              // positioning after draw.
              return positionTooltip;
            }

            // Hide the tooltip popup element.
            function hide() {
              // First things first: we don't show it anymore.
              scope.tt_isOpen = false;

              //if tooltip is going to be shown after delay, we must cancel this
              $timeout.cancel( popupTimeout );

              // And now we remove it from the DOM. However, if we have animation, we 
              // need to wait for it to expire beforehand.
              // FIXME: this is a placeholder for a port of the transitions library.
              if ( scope.tt_animation ) {
                transitionTimeout = $timeout(removeTooltip, 500);
              } else {
                removeTooltip();
              }
            }

            function createTooltip() {
              // There can only be one tooltip element per directive shown at once.
              if (tooltip) {
                removeTooltip();
              }
              tooltip = tooltipLinker(scope, function () {});

              // Get contents rendered into the tooltip
              scope.$digest();
            }

            function removeTooltip() {
              if (tooltip) {
                tooltip.remove();
                tooltip = null;
              }
            }

            /**
             * Observe the relevant attributes.
             */
            attrs.$observe( type, function ( val ) {
              scope.tt_content = val;

              if (!val && scope.tt_isOpen ) {
                hide();
              }
            });

            attrs.$observe( prefix+'Title', function ( val ) {
              scope.tt_title = val;
            });

            attrs.$observe( prefix+'Placement', function ( val ) {
              scope.tt_placement = angular.isDefined( val ) ? val : options.placement;
            });

            attrs.$observe( prefix+'PopupDelay', function ( val ) {
              var delay = parseInt( val, 10 );
              scope.tt_popupDelay = ! isNaN(delay) ? delay : options.popupDelay;
            });

            var unregisterTriggers = function() {
              if (hasRegisteredTriggers) {
                element.unbind( triggers.show, showTooltipBind );
                element.unbind( triggers.hide, hideTooltipBind );
              }
            };

            attrs.$observe( prefix+'Trigger', function ( val ) {
              unregisterTriggers();

              triggers = getTriggers( val );

              if ( triggers.show === triggers.hide ) {
                element.bind( triggers.show, toggleTooltipBind );
              } else {
                element.bind( triggers.show, showTooltipBind );
                element.bind( triggers.hide, hideTooltipBind );
              }

              hasRegisteredTriggers = true;
            });

            var animation = scope.$eval(attrs[prefix + 'Animation']);
            scope.tt_animation = angular.isDefined(animation) ? !!animation : options.animation;

            attrs.$observe( prefix+'AppendToBody', function ( val ) {
              appendToBody = angular.isDefined( val ) ? $parse( val )( scope ) : appendToBody;
            });

            // if a tooltip is attached to <body> we need to remove it on
            // location change as its parent scope will probably not be destroyed
            // by the change.
            if ( appendToBody ) {
              scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess () {
              if ( scope.tt_isOpen ) {
                hide();
              }
            });
            }

            // Make sure tooltip is destroyed and removed.
            scope.$on('$destroy', function onDestroyTooltip() {
              $timeout.cancel( transitionTimeout );
              $timeout.cancel( popupTimeout );
              unregisterTriggers();
              removeTooltip();
            });
          };
        }
      };
    };
  }];
})

.directive( 'tooltipPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'template/tooltip/tooltip-popup.html'
  };
})

.directive( 'tooltip', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tooltip', 'tooltip', 'mouseenter' );
}])

.directive( 'tooltipHtmlUnsafePopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
  };
})

.directive( 'tooltipHtmlUnsafe', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tooltipHtmlUnsafe', 'tooltip', 'mouseenter' );
}]);

/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.10.0 - 2014-01-17
 * License: MIT
 */
angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.dropdownToggle","ui.bootstrap.position","ui.bootstrap.bindHtml","ui.bootstrap.tooltip"]);
angular.module("ui.bootstrap.tpls", ["template/tooltip/tooltip-html-unsafe-popup.html","template/tooltip/tooltip-popup.html"]);
/*
 * dropdownToggle - Provides dropdown menu functionality in place of bootstrap js
 * @restrict class or attribute
 * @example:
   <li class="dropdown">
     <a class="dropdown-toggle">My Dropdown Menu</a>
     <ul class="dropdown-menu">
       <li ng-repeat="choice in dropChoices">
         <a ng-href="{{choice.href}}">{{choice.text}}</a>
       </li>
     </ul>
   </li>
 */

angular.module('ui.bootstrap.dropdownToggle', []).directive('dropdownToggle', ['$document', '$location', function ($document, $location) {
  var openElement = null,
      closeMenu   = angular.noop;
  return {
    restrict: 'CA',
    link: function(scope, element, attrs) {
      scope.$watch('$location.path', function() { closeMenu(); });
      element.parent().bind('click', function() { closeMenu(); });
      element.bind('click', function (event) {

        var elementWasOpen = (element === openElement);

        event.preventDefault();
        event.stopPropagation();

        if (!!openElement) {
          closeMenu();
        }

        if (!elementWasOpen && !element.hasClass('disabled') && !element.prop('disabled')) {
          element.parent().addClass('open');
          openElement = element;
          closeMenu = function (event) {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }
            $document.unbind('click', closeMenu);
            element.parent().removeClass('open');
            closeMenu = angular.noop;
            openElement = null;
          };
          $document.bind('click', closeMenu);
        }
      });
    }
  };
}]);

angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, "position") || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft  || $document[0].documentElement.scrollLeft)
        };
      }
    };
  }]);

angular.module('ui.bootstrap.bindHtml', [])

  .directive('bindHtmlUnsafe', function () {
    return function (scope, element, attr) {
      element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
      scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
        element.html(value || '');
      });
    };
  });
/**
 * The following features are still outstanding: animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html tooltips, and selector delegation.
 */
angular.module( 'ui.bootstrap.tooltip', [ 'ui.bootstrap.position', 'ui.bootstrap.bindHtml' ] )

/**
 * The $tooltip service creates tooltip- and popover-like directives as well as
 * houses global options for them.
 */
.provider( '$tooltip', function () {
  // The default options tooltip and popover.
  var defaultOptions = {
    placement: 'top',
    animation: true,
    popupDelay: 0
  };

  // Default hide triggers for each show trigger
  var triggerMap = {
    'mouseenter': 'mouseleave',
    'click': 'click',
    'focus': 'blur'
  };

  // The options specified to the provider globally.
  var globalOptions = {};
  
  /**
   * `options({})` allows global configuration of all tooltips in the
   * application.
   *
   *   var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function( $tooltipProvider ) {
   *     // place tooltips left instead of top by default
   *     $tooltipProvider.options( { placement: 'left' } );
   *   });
   */
	this.options = function( value ) {
		angular.extend( globalOptions, value );
	};

  /**
   * This allows you to extend the set of trigger mappings available. E.g.:
   *
   *   $tooltipProvider.setTriggers( 'openTrigger': 'closeTrigger' );
   */
  this.setTriggers = function setTriggers ( triggers ) {
    angular.extend( triggerMap, triggers );
  };

  /**
   * This is a helper function for translating camel-case to snake-case.
   */
  function snake_case(name){
    var regexp = /[A-Z]/g;
    var separator = '-';
    return name.replace(regexp, function(letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }

  /**
   * Returns the actual instance of the $tooltip service.
   * TODO support multiple triggers
   */
  this.$get = [ '$window', '$compile', '$timeout', '$parse', '$document', '$position', '$interpolate', function ( $window, $compile, $timeout, $parse, $document, $position, $interpolate ) {
    return function $tooltip ( type, prefix, defaultTriggerShow ) {
      var options = angular.extend( {}, defaultOptions, globalOptions );

      /**
       * Returns an object of show and hide triggers.
       *
       * If a trigger is supplied,
       * it is used to show the tooltip; otherwise, it will use the `trigger`
       * option passed to the `$tooltipProvider.options` method; else it will
       * default to the trigger supplied to this directive factory.
       *
       * The hide trigger is based on the show trigger. If the `trigger` option
       * was passed to the `$tooltipProvider.options` method, it will use the
       * mapped trigger from `triggerMap` or the passed trigger if the map is
       * undefined; otherwise, it uses the `triggerMap` value of the show
       * trigger; else it will just use the show trigger.
       */
      function getTriggers ( trigger ) {
        var show = trigger || options.trigger || defaultTriggerShow;
        var hide = triggerMap[show] || show;
        return {
          show: show,
          hide: hide
        };
      }

      var directiveName = snake_case( type );

      var startSym = $interpolate.startSymbol();
      var endSym = $interpolate.endSymbol();
      var template = 
        '<div '+ directiveName +'-popup '+
          'title="'+startSym+'tt_title'+endSym+'" '+
          'content="'+startSym+'tt_content'+endSym+'" '+
          'placement="'+startSym+'tt_placement'+endSym+'" '+
          'animation="tt_animation" '+
          'is-open="tt_isOpen"'+
          '>'+
        '</div>';

      return {
        restrict: 'EA',
        scope: true,
        compile: function (tElem, tAttrs) {
          var tooltipLinker = $compile( template );

          return function link ( scope, element, attrs ) {
            var tooltip;
            var transitionTimeout;
            var popupTimeout;
            var appendToBody = angular.isDefined( options.appendToBody ) ? options.appendToBody : false;
            var triggers = getTriggers( undefined );
            var hasRegisteredTriggers = false;
            var hasEnableExp = angular.isDefined(attrs[prefix+'Enable']);

            var positionTooltip = function (){
              var position,
                ttWidth,
                ttHeight,
                ttPosition;
              // Get the position of the directive element.
              position = appendToBody ? $position.offset( element ) : $position.position( element );

              // Get the height and width of the tooltip so we can center it.
              ttWidth = tooltip.prop( 'offsetWidth' );
              ttHeight = tooltip.prop( 'offsetHeight' );

              // Calculate the tooltip's top and left coordinates to center it with
              // this directive.
              switch ( scope.tt_placement ) {
                case 'right':
                  ttPosition = {
                    top: position.top + position.height / 2 - ttHeight / 2,
                    left: position.left + position.width
                  };
                  break;
                case 'bottom':
                  ttPosition = {
                    top: position.top + position.height,
                    left: position.left + position.width / 2 - ttWidth / 2
                  };
                  break;
                case 'left':
                  ttPosition = {
                    top: position.top + position.height / 2 - ttHeight / 2,
                    left: position.left - ttWidth
                  };
                  break;
                default:
                  ttPosition = {
                    top: position.top - ttHeight,
                    left: position.left + position.width / 2 - ttWidth / 2
                  };
                  break;
              }

              ttPosition.top += 'px';
              ttPosition.left += 'px';

              // Now set the calculated positioning.
              tooltip.css( ttPosition );

            };

            // By default, the tooltip is not open.
            // TODO add ability to start tooltip opened
            scope.tt_isOpen = false;

            function toggleTooltipBind () {
              if ( ! scope.tt_isOpen ) {
                showTooltipBind();
              } else {
                hideTooltipBind();
              }
            }

            // Show the tooltip with delay if specified, otherwise show it immediately
            function showTooltipBind() {
              if(hasEnableExp && !scope.$eval(attrs[prefix+'Enable'])) {
                return;
              }
              if ( scope.tt_popupDelay ) {
                popupTimeout = $timeout( show, scope.tt_popupDelay, false );
                popupTimeout.then(function(reposition){reposition();});
              } else {
                show()();
              }
            }

            function hideTooltipBind () {
              scope.$apply(function () {
                hide();
              });
            }

            // Show the tooltip popup element.
            function show() {


              // Don't show empty tooltips.
              if ( ! scope.tt_content ) {
                return angular.noop;
              }

              createTooltip();

              // If there is a pending remove transition, we must cancel it, lest the
              // tooltip be mysteriously removed.
              if ( transitionTimeout ) {
                $timeout.cancel( transitionTimeout );
              }

              // Set the initial positioning.
              tooltip.css({ top: 0, left: 0, display: 'block' });

              // Now we add it to the DOM because need some info about it. But it's not 
              // visible yet anyway.
              if ( appendToBody ) {
                  $document.find( 'body' ).append( tooltip );
              } else {
                element.after( tooltip );
              }

              positionTooltip();

              // And show the tooltip.
              scope.tt_isOpen = true;
              scope.$digest(); // digest required as $apply is not called

              // Return positioning function as promise callback for correct
              // positioning after draw.
              return positionTooltip;
            }

            // Hide the tooltip popup element.
            function hide() {
              // First things first: we don't show it anymore.
              scope.tt_isOpen = false;

              //if tooltip is going to be shown after delay, we must cancel this
              $timeout.cancel( popupTimeout );

              // And now we remove it from the DOM. However, if we have animation, we 
              // need to wait for it to expire beforehand.
              // FIXME: this is a placeholder for a port of the transitions library.
              if ( scope.tt_animation ) {
                transitionTimeout = $timeout(removeTooltip, 500);
              } else {
                removeTooltip();
              }
            }

            function createTooltip() {
              // There can only be one tooltip element per directive shown at once.
              if (tooltip) {
                removeTooltip();
              }
              tooltip = tooltipLinker(scope, function () {});

              // Get contents rendered into the tooltip
              scope.$digest();
            }

            function removeTooltip() {
              if (tooltip) {
                tooltip.remove();
                tooltip = null;
              }
            }

            /**
             * Observe the relevant attributes.
             */
            attrs.$observe( type, function ( val ) {
              scope.tt_content = val;

              if (!val && scope.tt_isOpen ) {
                hide();
              }
            });

            attrs.$observe( prefix+'Title', function ( val ) {
              scope.tt_title = val;
            });

            attrs.$observe( prefix+'Placement', function ( val ) {
              scope.tt_placement = angular.isDefined( val ) ? val : options.placement;
            });

            attrs.$observe( prefix+'PopupDelay', function ( val ) {
              var delay = parseInt( val, 10 );
              scope.tt_popupDelay = ! isNaN(delay) ? delay : options.popupDelay;
            });

            var unregisterTriggers = function() {
              if (hasRegisteredTriggers) {
                element.unbind( triggers.show, showTooltipBind );
                element.unbind( triggers.hide, hideTooltipBind );
              }
            };

            attrs.$observe( prefix+'Trigger', function ( val ) {
              unregisterTriggers();

              triggers = getTriggers( val );

              if ( triggers.show === triggers.hide ) {
                element.bind( triggers.show, toggleTooltipBind );
              } else {
                element.bind( triggers.show, showTooltipBind );
                element.bind( triggers.hide, hideTooltipBind );
              }

              hasRegisteredTriggers = true;
            });

            var animation = scope.$eval(attrs[prefix + 'Animation']);
            scope.tt_animation = angular.isDefined(animation) ? !!animation : options.animation;

            attrs.$observe( prefix+'AppendToBody', function ( val ) {
              appendToBody = angular.isDefined( val ) ? $parse( val )( scope ) : appendToBody;
            });

            // if a tooltip is attached to <body> we need to remove it on
            // location change as its parent scope will probably not be destroyed
            // by the change.
            if ( appendToBody ) {
              scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess () {
              if ( scope.tt_isOpen ) {
                hide();
              }
            });
            }

            // Make sure tooltip is destroyed and removed.
            scope.$on('$destroy', function onDestroyTooltip() {
              $timeout.cancel( transitionTimeout );
              $timeout.cancel( popupTimeout );
              unregisterTriggers();
              removeTooltip();
            });
          };
        }
      };
    };
  }];
})

.directive( 'tooltipPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'template/tooltip/tooltip-popup.html'
  };
})

.directive( 'tooltip', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tooltip', 'tooltip', 'mouseenter' );
}])

.directive( 'tooltipHtmlUnsafePopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
  };
})

.directive( 'tooltipHtmlUnsafe', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tooltipHtmlUnsafe', 'tooltip', 'mouseenter' );
}]);

angular.module("template/tooltip/tooltip-html-unsafe-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tooltip/tooltip-html-unsafe-popup.html",
    "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" bind-html-unsafe=\"content\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/tooltip/tooltip-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tooltip/tooltip-popup.html",
    "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" ng-bind=\"content\"></div>\n" +
    "</div>\n" +
    "");
}]);
