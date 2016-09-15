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
