// phina.js をグローバル領域に展開
phina.globalize();

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 960;
var BOARD_WIDTH = 7;                            
var BOARD_HEIGHT = 7;                            
var SQUARE_SIZE = 70;
var SQUARE_NUM = BOARD_WIDTH * BOARD_HEIGHT;
var MINE_NUM = 10;
var BOARD_SIZE = SCREEN_WIDTH;
var BOARD_OFFSET_X = 120;
var BOARD_OFFSET_Y = 290;
var ROUND_NUM = 2;

var PHASE = {
    PUTMINE: 0,
    MAIN: 1,
};

var ASSETS = {
    image: {
        pointer: 'image/pointer.png',
    },
};

// MainScene クラスを定義
phina.define("MainScene", {
    superClass: 'DisplayScene',

    init: function () {
        this.superInit({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            backgroundColor: '#777777',
        });

        this.player1 = Player('Player1', MINE_NUM * ROUND_NUM);
        this.player1Label = LabelsPlayerState(this.player1, this, 160, 170);
        this.player1Label.labelName.fill = '#ff7700';
        this.player2 = Player('Player2', MINE_NUM * ROUND_NUM);
        this.player2Label = LabelsPlayerState(this.player2, this, 600, 170);
        this.round = 1;
        this.phase = PHASE.PUTMINE;
        this.putPlayer = 1;
        this.gameFinished = false;
        this.battleFinished = false;
        
        var self = this;
        this.board = Board(BOARD_WIDTH, BOARD_HEIGHT, this);
        //OKボタンの配置
        this.buttonOK = Button({
            x: 320,
            y: 800,
            width: 120,
            height: 50,
            text: 'OK',
            fill: 'hsl(200, 20%, 60%)',
        }).addChildTo(this);
        this.buttonOK.enabled = false;
        this.buttonOK.onpointstart = function () {
            if (!self.buttonOK.visible)
                return;
            if (self.battleFinished){
                self.exit();
            }
            var player;
            if (self.putPlayer === 1)
                player = self.player1;
            else
                player = self.player2;
            if (self.buttonOK.enabled)
                self.changePhase();
        };


        // ラウンド数ラベル
        var roundLabel = Label('Round:' + this.round + '/' + ROUND_NUM).addChildTo(this);
        roundLabel.origin.x = 1;
        roundLabel.x = 440;
        roundLabel.y = 120;
        roundLabel.fill = '#ffffff';
        roundLabel.fontSize = 48;
        roundLabel.baseline = 'bottom';
        this.roundLabel = roundLabel;

        // リザルトラベル
        var resultLabel = Label().addChildTo(this);
        resultLabel.origin.x = 1;
        resultLabel.x = 460;
        resultLabel.y = 210;
        resultLabel.fill = '#ffffff';
        resultLabel.fontSize = 48;
        resultLabel.baseline = 'bottom';
        resultLabel.visible = false;
        this.resultLabel = resultLabel;

        this.onpointstart = function (e) {
            var p = e.pointer;
            var wave = Wave().addChildTo(this);
            wave.x = p.x;
            wave.y = p.y;
        };
        /*
        //中央のマスを設置不可に
        var index = (SQUARE_NUM - 1) / 2;
        this.squares.children[index].canPut = false;
        this.squares.children[index].fill = 'hsl(200, 20%, 60%)';
        */
    },


    update: function (app) {
        this.player1Label.update();
        this.player2Label.update();

    },


    changePhase: function () {
        //マスの文字、色をリセット
        for (var i = 0; i < this.board.height; i++) {
            for (var j = 0; j < this.board.width; j++) {
                this.board.squares[i][j].text = '';
                this.board.squares[i][j].fill = 'hsl(200, 80%, 60%)';
            }
        }

        //フェイズ移行
        switch (this.phase) {
            case PHASE.PUTMINE:
                this.phase = PHASE.MAIN;
                this.buttonOK.visible = false;
                this.buttonOK.text = 'NEXT';

                //操作中プレイヤーの名前ラベルをオレンジに
                if (this.putPlayer === 1){
                    this.player1Label.labelName.fill = '#ffffff';
                    this.player2Label.labelName.fill = '#ff7700';
                    player = this.player2;
                }else{
                    this.player1Label.labelName.fill = '#ff7700';
                    this.player2Label.labelName.fill = '#ffffff';
                    player = this.player1;

                }

                //中央のマスを自動チェック
                //this.check(this.squares.children[(SQUARE_NUM - 1) / 2], player);

                break;

            case PHASE.MAIN:
                this.phase = PHASE.PUTMINE;
                this.buttonOK.text = 'OK';
                this.buttonOK.fill = 'hsl(200, 20%, 60%)';
                this.buttonOK.enabled = false;
                this.board.reset();
                this.gameFinished = false;
                //地雷設置プレイヤーの交代
                if (this.putPlayer === 1) {
                    this.putPlayer = 2;
                } else {
                    this.putPlayer = 1;
                    //ラウンド移行
                    if (this.round >= ROUND_NUM) {
                        this.battleFinished = true;
                        this.buttonOK.text = 'END';
                        this.buttonOK.fill = 'hsl(200, 80%, 60%)';

                        //結果判定
                        this.resultLabel.visible = true;
                        if (this.player1.points > this.player2.points) {
                            this.resultLabel.text = 'Player1 Win!';
                        } else if (this.player1.points < this.player2.points) {
                            this.resultLabel.text = 'Player2 Win!';
                            this.player1Label.labelName.fill = '#ffffff';
                            this.player2Label.labelName.fill = '#ff7700';
                        } else {
                            this.resultLabel.text = 'Draw';
                            this.resultLabel.x = 380;
                            this.player1Label.labelName.fill = '#ffffff';
                            this.player2Label.labelName.fill = '#ffffff';
                        }

                        return;
                    }
                    this.round += 1;
                    this.roundLabel.text = 'Round:' + this.round + '/' + ROUND_NUM;

                }
                break;
        }

    },
});

phina.define('CheckMineConectionData', {
    init: function () {
        this.listMines = [];
        this.countWall = 0;
        this.direction = DIRECTION.NONE;
    },

});

phina.define('Point2D', {
    init: function (x, y) {
        this.x = x;
        this.y = y;
    },
});







// メイン処理
phina.main(function () {
    // アプリケーション生成
    var app = GameApp({
        
    });
    // アプリケーション実行
    app.run();
    app.replaceScene(SceneSequence());
});