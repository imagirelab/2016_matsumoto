// phina.js をグローバル領域に展開
phina.globalize();

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 960;
var BOARD_WIDTH = 8;                            
var BOARD_HEIGHT = 8;                            
var SQUARE_SIZE = 50;
var SQUARE_NUM = BOARD_WIDTH * BOARD_HEIGHT;
var MINE_NUM = 10;
var BOARD_SIZE = SCREEN_WIDTH;
var BOARD_OFFSET_X = 150;
var BOARD_OFFSET_Y = 240;

;

// MainScene クラスを定義
phina.define("MainScene", {
    superClass: 'DisplayScene',

    init: function () {
        this.superInit({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
        });

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
                self.check(this);
            };        
        });

        //リトライボタンの配置
        this.buttonRetry = ButtonRetry(320, 720).addChildTo(this);
        this.buttonRetry.onpointstart = this.retry;

        //地雷の設置
        this.putMine();

        // タイマーラベルを生成
        var timerLabel = Label('0').addChildTo(this);
        timerLabel.origin.x = 1;
        timerLabel.x = 400;
        timerLabel.y = 150;
        timerLabel.fill = '#444';
        timerLabel.fontSize = 64;
        timerLabel.baseline = 'bottom';
        this.timerLabel = timerLabel;
        this.time = 0;

        this.onpointstart = function (e) {
            var p = e.pointer;
            var wave = Wave().addChildTo(this);
            wave.x = p.x;
            wave.y = p.y;
        };
    },


    update: function (app) {
        // 最初のマスがチェックされたらタイマーを更新
        //ゲーム終了したらそこで停止
        if (this.checkedSquares >= 1 && !this.gameFinished){
            this.time += app.ticker.deltaTime;
            var sec = this.time / 1000; // 秒数に変換
            this.timerLabel.text = sec.toFixed(3);

        }
    },

    check: function (square) {
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

    putMine: function (){
        var i = 0;
        while(i<MINE_NUM){
            var randNum = Math.floor(Math.random() * SQUARE_NUM);
            if(!this.squares.children[randNum].putMine){
                this.squares.children[randNum].putMine = true;
                i++;
            }
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

    retry: function(){
        this.parent.init();
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

phina.define('ButtonRetry', {
    superClass: 'Button',

    init: function (x,y) {

        this.superInit({
            x: x,
            y: y,
            width: 100,
            height: 50,
            text: 'RETRY',
        });

    },


});

// メイン処理
phina.main(function () {
    // アプリケーション生成
    var app = GameApp({
        
        startLabel: 'title', // メインシーンから開始する
    });
    // アプリケーション実行
    app.run();
});