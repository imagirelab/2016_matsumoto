phina.define("SceneSequence", {

    superClass: "phina.game.ManagerScene",

    init: function () {
        this.superInit({
            scenes: [

              //�^�C�g��
              {
                  label: "title",
                  className: "TitleScene",
                  nextLabel: "main",
              },
              //���[�h�I��
              //�ΐ�
              {
                  label: "main",
                  className: "MainScene",
                  nextLabel: "title",
              }
              //���
              //�V��
            ]
        });
    }
});
