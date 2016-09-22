phina.define('Player', {
    init: function (name, mines) {
        this.name = name;
        this.mines = mines;
        this.points = 0;
    },

    putMine: function (square, game) {
        if (square.canPut) {
            if (square.putMine) {
                square.putMine = false;
                square.text = '';
                this.mines += 1;
                game.board.putMineNum -= 1;
            } else if (this.mines >= 1) {
                square.putMine = true;
                square.text = 'x';
                this.mines -= 1;
                game.board.putMineNum += 1;
            }

        }
        //this.updateCanPut();
        game.board.getMineNumArround();

        var player;
        if (this.putPlayer === 1) {
            player = this.player1;
        } else {
            player = this.player2;
        }
        //�n����u���Ă���A�������E���h�ȍ~�ɒu���n�����c���Ă���ꍇ��OK�ł���
        //OK�ł��Ȃ��ꍇ�̓{�^���̐F���D�F�ɂ���
        if (game.board.putMineNum >= 1 && this.mines >= ROUND_NUM - game.round){
            game.buttonOK.fill = 'hsl(200, 80%, 60%)';
            game.buttonOK.enabled = true;

        }else {
            game.buttonOK.fill = 'hsl(200, 20%, 60%)';
            game.buttonOK.enabled = false;

        }

    },
    check: function (square, game) {
        if (game.gameFinished)
            return;
        if (square != undefined && !square.checked) {
            square.checked = true;
            //�n�����u���Ă���΂����ŃQ�[���I��
            if (square.putMine) {
                square.text = 'x';
                game.gameFinished = true;
                game.board.openMines();
                return;
            }
            game.board.checkedSquares += 1;
            this.points += 1;
            square.text = square.mineNumAround;
            //����ɒn����������Ύ���̃}�X�������`�F�b�N
            var indexX = square.index % game.board.width;
            var indexY = Math.floor(square.index / game.board.width);

            if (square.mineNumAround == 0) {
                //����
                if (indexX - 1 >= 0) {
                    if(indexY - 1 >= 0)
                        this.check(game.board.squares[indexY-1][indexX-1], game);
                    this.check(game.board.squares[indexY][indexX - 1], game);
                    if(indexY + 1 < game.board.height)
                        this.check(game.board.squares[indexY + 1][indexX - 1], game);

                }
                //����
                if (indexY - 1 >= 0)
                    this.check(game.board.squares[indexY-1][indexX], game);
                if (indexY + 1 < game.board.height)
                    this.check(game.board.squares[indexY+1][indexX], game);
                //�E��
                if (indexX + 1 < game.board.width) {
                    if (indexY - 1 >= 0)
                        this.check(game.board.squares[indexY - 1][indexX + 1], game);
                    this.check(game.board.squares[indexY][indexX + 1], game);
                    if (indexY + 1 < game.board.height)
                        this.check(game.board.squares[indexY + 1][indexX + 1], game);

                }

            }

            //�n���ȊO�̃}�X���S�ă`�F�b�N���ꂽ��Q�[���I��
            if (game.board.checkedSquares >= game.board.squareNum - game.board.putMineNum) {
                game.gameFinished = true;
                game.board.openMines();
                return;

            }

        }

    },


});
phina.define('LabelsPlayerState', {
    init: function (player, display, offsetX, offsetY) {
        this.player = player;
        // ���O
        this.labelName = Label(player.name).addChildTo(display);
        this.labelName.origin.x = 1;
        this.labelName.x = offsetX;
        this.labelName.y = offsetY;
        this.labelName.fill = '#ffffff';
        this.labelName.fontSize = 32;
        this.labelName.baseline = 'bottom';
        // �����n����
        this.labelMines = Label('Mines:').addChildTo(display);
        this.labelMines.origin.x = 1;
        this.labelMines.x = offsetX - 20;
        this.labelMines.y = offsetY + 32;
        this.labelMines.fill = '#ffffff';
        this.labelMines.fontSize = 32;
        this.labelMines.baseline = 'bottom';

        this.labelMineNum = Label(player.mines).addChildTo(display);
        this.labelMineNum.origin.x = 1;
        this.labelMineNum.x = offsetX + 32;
        this.labelMineNum.y = offsetY + 32;
        this.labelMineNum.fontSize = 32;
        this.labelMineNum.baseline = 'bottom';
        this.labelMineNum.brightness = 100;
        this.labelMineNum.fill = 'hsl(20, 100%, 100%)';

        //���_
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
