// phina.js をグローバル領域に展開
phina.globalize();

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 960;
var BOARD_WIDTH = 8;                            
var BOARD_HEIGHT = 8;                            
var SQUARE_SIZE = 50;
var SQUARE_NUM = BOARD_WIDTH * BOARD_HEIGHT;
var MINE_NUM = 30;
var BOARD_SIZE = SCREEN_WIDTH;
var BOARD_OFFSET_X = 150;
var BOARD_OFFSET_Y = 300;
var ROUND_NUM = 3;

var PHASE = {
    PUTMINE : 0,
    MAIN : 1,
}

// MainScene クラスを定義
phina.define("MainScene", {
    superClass: 'DisplayScene',

    init: function () {
        this.superInit({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
        });

        this.player1 = Player('Player1', MINE_NUM);
        this.player1Label = LabelsPlayerState(this.player1, this, 140, 200);
        this.player2 = Player('NaNashi', MINE_NUM);
        this.player2Label = LabelsPlayerState(this.player2, this, 640, 200);
        this.round = 1;
        this.phase = PHASE.PUTMINE;

        this.firstPutPlayer = 1;

        this.checkedSquares = 0;
        this.gameFinished = false;
        
        var self = this;
        this.squares = DisplayElement().addChildTo(this);
        (SQUARE_NUM).times(function (i) {
            var xIndex = i % BOARD_WIDTH;
            var yIndex = Math.floor(i / BOARD_WIDTH);
            var square = Square(i).addChildTo(self.squares);
            square.x = BOARD_OFFSET_X + xIndex * SQUARE_SIZE;
            square.y = BOARD_OFFSET_Y + yIndex * SQUARE_SIZE;
                        
            square.onpointstart = function () {
                var player;
                switch (self.phase) {
                    case PHASE.PUTMINE:
                        if (self.firstPutPlayer == 1)
                            player = self.player1;
                        else
                            player = self.player2;
                        self.putMine(this, player);
                        self.player1Label.update();
                        self.player2Label.update();
                        break;
                    case PHASE.MAIN:
                        if (self.firstPutPlayer == 1)
                            player = self.player2;
                        else
                            player = self.player1;
                        self.check(this, player);
                        self.player1Label.update();
                        self.player2Label.update();

                }

            };        
        });

        //OKボタンの配置
        this.buttonRetry = ButtonOK(320, 720).addChildTo(this);
        this.buttonRetry.onpointstart = this.retry;


        // ラウンド数ラベル
        var roundLabel = Label('Round:' + this.round).addChildTo(this);
        roundLabel.origin.x = 1;
        roundLabel.x = 400;
        roundLabel.y = 150;
        roundLabel.fill = '#444';
        roundLabel.fontSize = 48;
        roundLabel.baseline = 'bottom';
        this.roundLabel = roundLabel;

        this.onpointstart = function (e) {
            var p = e.pointer;
            var wave = Wave().addChildTo(this);
            wave.x = p.x;
            wave.y = p.y;
        };
    },


    update: function (app) {

    },

    check: function (square, player) {
        if (square != undefined && !square.checked) {
            square.checked = true;
            this.checkedSquares++;
            //地雷が置いてあればそこでゲーム終了
            //既にゲーム終了している場合はopenMinesを複数回実行しない
            if (square.putMine) {
                square.text = 'x';
                if (!this.gameFinished) {
                    this.gameFinished = true;
                    this.openMines();

                }
                return;
            }
            else
                square.text = square.mineNumAround;
            //周りに地雷が無ければ周りのマスを自動チェック
            if (square.mineNumAround == 0) {
                //左側
                //左端でない場合にチェックする
                if (square.index % BOARD_WIDTH > 0) {
                    this.check(this.squares.children[square.index - BOARD_WIDTH - 1]);
                    this.check(this.squares.children[square.index - 1]);
                    this.check(this.squares.children[square.index + BOARD_WIDTH - 1]);
                }
                //中央
                this.check(this.squares.children[square.index - BOARD_WIDTH]);
                this.check(this.squares.children[square.index + BOARD_WIDTH]);
                //右側
                //右端でない場合にチェックする
                if (square.index % BOARD_WIDTH < BOARD_WIDTH - 1) {
                    this.check(this.squares.children[square.index - BOARD_WIDTH + 1]);
                    this.check(this.squares.children[square.index + 1]);
                    this.check(this.squares.children[square.index + BOARD_WIDTH + 1]);

                }
            }

            //地雷以外のマスが全てチェックされたらゲーム終了
            if (this.checkedSquares >= SQUARE_NUM - MINE_NUM) {
                this.gameFinished = true;
                this.openMines();
                return;

            }

        }

    },

    putMine: function (square, player) {
        if (square.putMine) {
            square.putMine = false;
            square.text = '';
            player.mines += 1;
        } else if (player.mines >= 1) {
            square.putMine = true;
            square.text = 'x';
            player.mines -= 1;
        }


        this.getMineNumArround();
    },

    getMineNumArround: function(){        
        for (var i = 0; i < BOARD_HEIGHT; i++){
            for (var j = 0; j < BOARD_WIDTH; j++){
                var index = i * BOARD_WIDTH + j
                this.squares.children[index].mineNumAround = 0;
                //左側
                //左端でない場合にチェックする
                if (j > 0) {
                    if (this.squares.children[index - BOARD_WIDTH - 1] != undefined
                        && this.squares.children[index - BOARD_WIDTH - 1].putMine)
                        this.squares.children[index].mineNumAround++;
                    if (this.squares.children[index - 1] != undefined
                        && this.squares.children[index - 1].putMine)
                        this.squares.children[index].mineNumAround++;
                    if (this.squares.children[index + BOARD_WIDTH - 1] != undefined
                        && this.squares.children[index + BOARD_WIDTH - 1].putMine)
                        this.squares.children[index].mineNumAround++;
                }
                //中央
                if (this.squares.children[index - BOARD_WIDTH] != undefined
                    && this.squares.children[index - BOARD_WIDTH].putMine)
                    this.squares.children[index].mineNumAround++;
                if (this.squares.children[index + BOARD_WIDTH] != undefined
                    && this.squares.children[index + BOARD_WIDTH].putMine)
                    this.squares.children[index].mineNumAround++;

                //右側
                //右端でない場合にチェックする
                if (j < BOARD_WIDTH - 1) {
                    if (this.squares.children[index - BOARD_WIDTH + 1] != undefined
                        && this.squares.children[index - BOARD_WIDTH + 1].putMine)
                        this.squares.children[index].mineNumAround++;
                    if (this.squares.children[index + 1] != undefined
                        && this.squares.children[index + 1].putMine)
                        this.squares.children[index].mineNumAround++;
                    if (this.squares.children[index + BOARD_WIDTH + 1] != undefined
                        && this.squares.children[index + BOARD_WIDTH + 1].putMine)
                        this.squares.children[index].mineNumAround++;
                }
            }
        }
    },

    openMines: function(){
        for(var i=0; i<SQUARE_NUM; i++){
            if (this.squares.children[i].putMine)
                this.check(this.squares.children[i]);
        }
    },


});


phina.define('Square', {
    superClass: 'Button',

    init: function (index) {
        this.checked = false;
        this.putMine = false;
        this.mineNumAround = 0;

        this.superInit({
            width: SQUARE_SIZE,
            height: SQUARE_SIZE,
            text: '',
        });

        this.index = index;
    },


});

phina.define('ButtonOK', {
    superClass: 'Button',

    init: function (x,y) {

        this.superInit({
            x: x,
            y: y,
            width: 100,
            height: 50,
            text: 'OK',
        });

    },

});

phina.define('Player', {
    init: function (name, mines) {
        this.name = name;
        this.mines = mines;
        this.points = 0;
    },
});
phina.define('LabelsPlayerState', {
    init: function (player, display, offsetX, offsetY) {
        this.player = player;
        // 名前
        this.labelName = Label(player.name).addChildTo(display);
        this.labelName.origin.x = 1;
        this.labelName.x = offsetX;
        this.labelName.y = offsetY;
        this.labelName.fill = '#444';
        this.labelName.fontSize = 32;
        this.labelName.baseline = 'bottom';
        // 所持地雷数
        this.labelMines = Label('Mines:' + player.mines).addChildTo(display);
        this.labelMines.origin.x = 1;
        this.labelMines.x = offsetX;
        this.labelMines.y = offsetY+32;
        this.labelMines.fill = '#444';
        this.labelMines.fontSize = 32;
        this.labelMines.baseline = 'bottom';

        //得点
        this.labelPoints = Label('Points:' + player.points).addChildTo(display);
        this.labelPoints.origin.x = 1;
        this.labelPoints.x = offsetX;
        this.labelPoints.y = offsetY+64;
        this.labelPoints.fill = '#444';
        this.labelPoints.fontSize = 32;
        this.labelPoints.baseline = 'bottom';
    },
    update: function () {
        this.labelMines.text = 'Mines:' + this.player.mines;
        this.labelPoints.text = 'Points:' + this.player.points;
    }

});
// メイン処理
phina.main(function () {
    // アプリケーション生成
    var app = GameApp({
        
        startLabel: 'title', // メインシーンから開始する
        title: 'VS MineSweeper'
    });
    // アプリケーション実行
    app.run();
});