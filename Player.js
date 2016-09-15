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
        // ñºëO
        this.labelName = Label(player.name).addChildTo(display);
        this.labelName.origin.x = 1;
        this.labelName.x = offsetX;
        this.labelName.y = offsetY;
        this.labelName.fill = '#ffffff';
        this.labelName.fontSize = 32;
        this.labelName.baseline = 'bottom';
        // èäéùínóãêî
        this.labelMines = Label('Mines:').addChildTo(display);
        this.labelMines.origin.x = 1;
        this.labelMines.x = offsetX - 20;
        this.labelMines.y = offsetY + 32;
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

        //ìæì_
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
