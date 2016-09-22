phina.define('Square', {
    superClass: 'Button',

    init: function (index, game) {
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
        this.game = game;

        this.onpointstart = function () {
            if (this.game.battleFinished)
                return;
            var player;
            switch (this.game.phase) {
                case PHASE.PUTMINE:
                    if (this.game.putPlayer === 1) {
                        //地雷数点滅
                        this.game.player1Label.labelMineNum.tweener.clear();
                        this.game.player1Label.labelMineNum.tweener.set({
                            brightness: 60
                        }).to({
                            brightness: 100
                        }, 300);
                        player = this.game.player1;
                    } else {
                        //地雷数点滅
                        this.game.player2Label.labelMineNum.tweener.clear();
                        this.game.player2Label.labelMineNum.tweener.set({
                            brightness: 60
                        }).to({
                            brightness: 100
                        }, 300);
                        player = this.game.player2;
                    }
                    player.putMine(this, this.game);
                    break;
                case PHASE.MAIN:
                    if (this.game.putPlayer === 1) {
                        //スコア点滅
                        if (!this.putMine) {
                            this.game.player2Label.labelPointNum.tweener.clear();
                            this.game.player2Label.labelPointNum.tweener.set({
                                brightness: 60
                            }).to({
                                brightness: 100
                            }, 300);

                        }
                        player = this.game.player2;

                    } else {
                        //スコア点滅
                        if (!this.putMine) {
                            this.game.player1Label.labelPointNum.tweener.clear();
                            this.game.player1Label.labelPointNum.tweener.set({
                                brightness: 60
                            }).to({
                                brightness: 100
                            }, 300);
                        }
                        player = this.game.player1;

                    }
                    player.check(this, this.game);
            }

        };
    },


});
