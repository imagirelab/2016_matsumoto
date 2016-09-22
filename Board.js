phina.define('Board', {
    init: function (width, height, game) {
        this.putMineNum = 0;
        this.checkedSquares = 0;

        this.game = game;
        this.width = width;
        this.height = height;
        this.squareNum = width * height;
        this.squares = new Array(height);
        for (var i = 0; i < height; i++){
            this.squares[i] = new Array(width);

        }
        //マスの配置
        for (var i = 0; i < this.squareNum; i++){
            var xIndex = i % width;
            var yIndex = Math.floor(i / width);
            var square = Square(i, game).addChildTo(game);
            square.x = BOARD_OFFSET_X + xIndex * SQUARE_SIZE;
            square.y = BOARD_OFFSET_Y + yIndex * SQUARE_SIZE;
            this.squares[yIndex][xIndex] = square;
        }

    },
    updateCanPut: function () {
        for (var i = 0; i < BOARD_HEIGHT; i++) {
            for (var j = 0; j < BOARD_WIDTH; j++) {
                //this.checkCanPut(j, i);
            }
        }
        /*
        //中央のマスを設置不可に
        var index = (SQUARE_NUM - 1) / 2;
        this.squares.children[index].canPut = false;
        this.squares.children[index].fill = 'hsl(200, 20%, 60%)';
        */
    },
    checkCanPut: function (x, y) {
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
        for (var i = 0; i < BOARD_HEIGHT; i++) {
            for (var j = 0; j < BOARD_WIDTH; j++) {
                this.squares[i][j].mineNumAround = 0;
                //左側
                    if ((i-1) >= 0 && (j-1) >= 0
                        && this.squares[i-1][j-1].putMine)
                        this.squares[i][j].mineNumAround++;
                    if ((j - 1) >= 0
                        && this.squares[i][j-1].putMine)
                        this.squares[i][j].mineNumAround++;
                    if ((i + 1) <this.height && (j - 1) >= 0
                        && this.squares[i+1][j-1].putMine)
                        this.squares[i][j].mineNumAround++;
                //中央
                if ((i - 1) >= 0
                    && this.squares[i-1][j].putMine)
                    this.squares[i][j].mineNumAround++;
                if ((i + 1) < this.height
                    && this.squares[i+1][j].putMine)
                    this.squares[i][j].mineNumAround++;

                //右側
                    if ((i - 1) >= 0 && (j + 1) < this.width
                        && this.squares[i-1][j+1].putMine)
                        this.squares[i][j].mineNumAround++;
                    if (this.squares[i][j+1] != undefined
                        && this.squares[i][j+1].putMine)
                        this.squares[i][j].mineNumAround++;
                    if ((i + 1) < this.height && (j + 1) < this.width
                        && this.squares[i+1][j+1].putMine)
                        this.squares[i][j].mineNumAround++;
            }
        }
    },

    openMines: function () {
        for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                if (this.squares[i][j].putMine) {
                    this.squares[i][j].checked = true;
                    this.squares[i][j].text = 'x';

                }
            }
        }
        this.game.gameFinished = true;
        this.game.buttonOK.visible = true;
    },

    reset: function () {
        for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                this.squares[i][j].putMine = false;
                this.putMineNum = 0;
                this.squares[i][j].mineNumAround = 0;
                this.squares[i][j].checked = false;
                this.checkedSquares = 0;

            }
        }
    },
});