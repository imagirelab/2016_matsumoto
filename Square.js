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
