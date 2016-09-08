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
        this.putMineNum = 0;
        this.checkedSquares = 0;
        this.gameFinished = false;
        this.battleFinished = false;
        
        var self = this;
        this.squares = DisplayElement().addChildTo(this);

        //マスの配置
        (SQUARE_NUM).times(function (i) {
            var xIndex = i % BOARD_WIDTH;
            var yIndex = Math.floor(i / BOARD_WIDTH);
            var square = Square(i).addChildTo(self.squares);
            square.x = BOARD_OFFSET_X + xIndex * SQUARE_SIZE;
            square.y = BOARD_OFFSET_Y + yIndex * SQUARE_SIZE;
                        
            square.onpointstart = function () {
                if (self.battleFinished)
                    return;
                var player;
                switch (self.phase) {
                    case PHASE.PUTMINE:
                        if (self.putPlayer === 1) {
                            //地雷数点滅
                            self.player1Label.labelMineNum.tweener.clear();
                            self.player1Label.labelMineNum.tweener.set({
                                brightness: 60
                            }).to({
                                brightness: 100
                            }, 300);
                            player = self.player1;
                        }else {
                            //地雷数点滅
                            self.player2Label.labelMineNum.tweener.clear();
                            self.player2Label.labelMineNum.tweener.set({
                                brightness: 60
                            }).to({
                                brightness: 100
                            }, 300);
                            player = self.player2;
                        }
                        self.putMine(this, player);
                        break;
                    case PHASE.MAIN:
                        if (self.putPlayer === 1) {
                            //スコア点滅
                            if (!this.putMine) {
                                self.player2Label.labelPointNum.tweener.clear();
                                self.player2Label.labelPointNum.tweener.set({
                                    brightness: 60
                                }).to({
                                    brightness: 100
                                }, 300);

                            }
                            player = self.player2;

                        } else {
                            //スコア点滅
                            if (!this.putMine) {
                                self.player1Label.labelPointNum.tweener.clear();
                                self.player1Label.labelPointNum.tweener.set({
                                    brightness: 60
                                }).to({
                                    brightness: 100
                                }, 300);
                            }
                            player = self.player1;

                        }
                        self.check(this, player);
                }

            };        
        });

        //OKボタンの配置
        this.buttonOK = ButtonOK(320, 800).addChildTo(this);
        this.buttonOK.fill = 'hsl(200, 20%, 60%)';
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
            //地雷を置いている、かつ次ラウンド以降に置く地雷が残っている場合にOKできる
            if(self.putMineNum >= 1 && player.mines >= ROUND_NUM - self.round)
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

        //中央のマスを設置不可に
        var index = (SQUARE_NUM - 1) / 2;
        this.squares.children[index].canPut = false;
        this.squares.children[index].fill = 'hsl(200, 20%, 60%)';
    },


    update: function (app) {
        this.player1Label.update();
        this.player2Label.update();

    },

    check: function (square, player) {
        if (this.gameFinished)
            return;
        if (square != undefined && !square.checked) {
            square.checked = true;
            //地雷が置いてあればそこでゲーム終了
            if (square.putMine) {
                square.text = 'x';
                this.gameFinished = true;
                this.openMines();
                return;
            }
            this.checkedSquares += 1;
            player.points += 1;
            square.text = square.mineNumAround;
            //周りに地雷が無ければ周りのマスを自動チェック
            if (square.mineNumAround == 0) {
                //左側
                //左端でない場合にチェックする
                if (square.index % BOARD_WIDTH > 0) {
                    this.check(this.squares.children[square.index - BOARD_WIDTH - 1], player);
                    this.check(this.squares.children[square.index - 1], player);
                    this.check(this.squares.children[square.index + BOARD_WIDTH - 1], player);
                }
                //中央
                this.check(this.squares.children[square.index - BOARD_WIDTH], player);
                this.check(this.squares.children[square.index + BOARD_WIDTH], player);
                //右側
                //右端でない場合にチェックする
                if (square.index % BOARD_WIDTH < BOARD_WIDTH - 1) {
                    this.check(this.squares.children[square.index - BOARD_WIDTH + 1], player);
                    this.check(this.squares.children[square.index + 1], player);
                    this.check(this.squares.children[square.index + BOARD_WIDTH + 1],player);

                }
            }

            //地雷以外のマスが全てチェックされたらゲーム終了
            if (this.checkedSquares >= SQUARE_NUM - this.putMineNum) {
                this.gameFinished = true;
                this.openMines();
                return;

            }

        }

    },

    putMine: function (square, player) {
        if (square.canPut)
        {
            if (square.putMine) {
                square.putMine = false;
                square.text = '';
                player.mines += 1;
                this.putMineNum -= 1;
            } else if (player.mines >= 1) {
                square.putMine = true;
                square.text = 'x';
                player.mines -= 1;
                this.putMineNum += 1;
            }

        }
        //this.updateCanPut();
        this.getMineNumArround();

        var player;
        if (this.putPlayer === 1){
            player = this.player1;
        } else {
            player = this.player2;
        }
        //地雷を置いている、かつ次ラウンド以降に置く地雷が残っている場合にOKできる
        //OKできない場合はボタンの色を灰色にする
        if(this.putMineNum >= 1 && player.mines >= ROUND_NUM - this.round)
            this.buttonOK.fill = 'hsl(200, 80%, 60%)';
        else
            this.buttonOK.fill = 'hsl(200, 20%, 60%)';

    },

    updateCanPut: function(){
        for (var i = 0; i < BOARD_HEIGHT; i++) {
            for (var j = 0; j < BOARD_WIDTH; j++) {
                //this.checkCanPut(j, i);
            }
        }
        //中央のマスを設置不可に
        var index = (SQUARE_NUM - 1) / 2;
        this.squares.children[index].canPut = false;
        this.squares.children[index].fill = 'hsl(200, 20%, 60%)';
    },
    checkCanPut: function(x, y){
        var squares = this.squares.children;
        var index = y * BOARD_WIDTH + x;
        if (squares[index].putMine) {
            return;
        }
        var data = CheckMineConectionData();    //地雷の繋がり判定に使うデータ
        data.listMines.push(index);
        this.checkMineConection(data);
        console.log(data.listMines);
    },
    checkMineConection: function (data) {
    },

    getMineNumArround: function () {
        var squares = this.squares.children;
        for (var i = 0; i < BOARD_HEIGHT; i++){
            for (var j = 0; j < BOARD_WIDTH; j++){
                var index = i * BOARD_WIDTH + j;
                squares[index].mineNumAround = 0;
                //左側
                //左端でない場合にチェックする
                if (j > 0) {
                    if (squares[index - BOARD_WIDTH - 1] != undefined
                        && squares[index - BOARD_WIDTH - 1].putMine)
                        squares[index].mineNumAround++;
                    if (squares[index - 1] != undefined
                        && squares[index - 1].putMine)
                        squares[index].mineNumAround++;
                    if (squares[index + BOARD_WIDTH - 1] != undefined
                        && squares[index + BOARD_WIDTH - 1].putMine)
                        squares[index].mineNumAround++;
                }
                //中央
                if (squares[index - BOARD_WIDTH] != undefined
                    && squares[index - BOARD_WIDTH].putMine)
                    squares[index].mineNumAround++;
                if (squares[index + BOARD_WIDTH] != undefined
                    && squares[index + BOARD_WIDTH].putMine)
                    squares[index].mineNumAround++;

                //右側
                //右端でない場合にチェックする
                if (j < BOARD_WIDTH - 1) {
                    if (squares[index - BOARD_WIDTH + 1] != undefined
                        && squares[index - BOARD_WIDTH + 1].putMine)
                        squares[index].mineNumAround++;
                    if (squares[index + 1] != undefined
                        && squares[index + 1].putMine)
                        squares[index].mineNumAround++;
                    if (squares[index + BOARD_WIDTH + 1] != undefined
                        && squares[index + BOARD_WIDTH + 1].putMine)
                        squares[index].mineNumAround++;
                }
            }
        }
    },

    openMines: function(){
        for(var i=0; i<SQUARE_NUM; i++){
            if (this.squares.children[i].putMine){
                this.squares.children[i].checked = true;
                this.squares.children[i].text = 'x';

            }
        }
        this.gameFinished = true;
        this.buttonOK.visible = true;
    },

    changePhase: function () {
        //マスの文字、色をリセット
        for (var i = 0; i < SQUARE_NUM; i++) {
            this.squares.children[i].text = '';
            this.squares.children[i].fill = 'hsl(200, 80%, 60%)';
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
                this.check(this.squares.children[(SQUARE_NUM - 1) / 2], player);

                break;

            case PHASE.MAIN:
                this.phase = PHASE.PUTMINE;
                this.buttonOK.text = 'OK';
                this.buttonOK.fill = 'hsl(200, 20%, 60%)';
                this.initBoard();
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
    initBoard: function () {
        for (var i = 0; i < SQUARE_NUM; i++) {
            this.squares.children[i].putMine = false;
            this.putMineNum = 0;
            this.squares.children[i].mineNumAround = 0;
            this.squares.children[i].checked = false;
            this.checkedSquares = 0;
        }
        //中央のマスを設置不可に
        var index = (SQUARE_NUM - 1) / 2;
        this.squares.children[index].canPut = false;
        this.squares.children[index].fill = 'hsl(200, 20%, 60%)';

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

phina.define('Square', {
    superClass: 'Button',

    init: function (index) {
        this.checked = false;
        this.putMine = false;
        this.canPut = true;
        this.mineNumAround = 0;
        this.superInit({
            width: SQUARE_SIZE,
            height: SQUARE_SIZE,
            text: '',
            fontSize: 44,
        });

        this.index = index;
    },

    update: function () {
    }

});

phina.define('ButtonOK', {
    superClass: 'Button',

    init: function (x,y) {

        this.superInit({
            x: x,
            y: y,
            width: 120,
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
        this.labelName.fill = '#ffffff';
        this.labelName.fontSize = 32;
        this.labelName.baseline = 'bottom';
        // 所持地雷数
        this.labelMines = Label('Mines:').addChildTo(display);
        this.labelMines.origin.x = 1;
        this.labelMines.x = offsetX-20;
        this.labelMines.y = offsetY+32;
        this.labelMines.fill = '#ffffff';
        this.labelMines.fontSize = 32;
        this.labelMines.baseline = 'bottom';

        this.labelMineNum = Label(this.player.mines).addChildTo(display);
        this.labelMineNum.origin.x = 1;
        this.labelMineNum.x = offsetX + 32;
        this.labelMineNum.y = offsetY + 32;
        this.labelMineNum.fontSize = 32;
        this.labelMineNum.baseline = 'bottom';
        this.labelMineNum.brightness = 100;
        this.labelMineNum.fill = 'hsl(20, 100%, 100%)';

        //得点
        this.labelPoints = Label('Points:').addChildTo(display);
        this.labelPoints.origin.x = 1;
        this.labelPoints.x = offsetX - 10;
        this.labelPoints.y = offsetY + 64;
        this.labelPoints.fill = '#ffffff';
        this.labelPoints.fontSize = 32;
        this.labelPoints.baseline = 'bottom';

        this.labelPointNum = Label(player.points).addChildTo(display);
        this.labelPointNum.origin.x = 1;
        this.labelPointNum.x = offsetX + 32;
        this.labelPointNum.y = offsetY + 64;
        this.labelPointNum.fill = '#ffffff';
        this.labelPointNum.fontSize = 32;
        this.labelPointNum.baseline = 'bottom';
        this.labelPointNum.brightness = 100;
        this.labelPointNum.fill = 'hsl(20, 100%, 100%)';
    },
    update: function () {
        this.labelMineNum.text = this.player.mines;
        this.labelMineNum.fill = 'hsl(20, 100%, ' + this.labelMineNum.brightness + '%)';
        this.labelPointNum.text = this.player.points;
        this.labelPointNum.fill = 'hsl(20, 100%, ' + this.labelPointNum.brightness + '%)';
    }

});

//シーンシークエンス
phina.define("SceneSequence", {

    superClass: "phina.game.ManagerScene",

    init: function () {
        this.superInit({
            scenes: [

              //タイトル
              {
                  label: "title", 
                  className: "TitleScene", 
                  nextLabel: "main",
              },
              //モード選択
              //対戦
              {
                  label: "main",
                  className: "MainScene",
                  nextLabel: "title", 
              }
              //作る
              //遊ぶ
            ]
        });
    }
});

phina.define("TitleScene", {
    superClass: "TitleScene",
    init: function () {
        this.superInit({
            title: 'VS MineSweeper',
            backgroundColor: '#777777',
        });
    }
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