var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

init();

function init() {
    // Pixiアプリケーション生成
    let app = new PIXI.Application({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: 0xD5D9E0,
        autoDensity: true,
        antialias: true,
    });
    let el = document.getElementById("canvas");
    el.appendChild(app.view);

    pc = new PointConvert(SCREEN_WIDTH, SCREEN_HEIGHT);

    data = data[tf.multinomial([1 / 3, 1 / 3, 1 / 3], 1).arraySync()[0]];
    predict_x = tf.tensor(data["predict_x"]);
    predict_mu = data["predict_mu"];
    predict_sigma = data["predict_sigma"];
    ground_truth_x = data["ground_truth_x"];
    ground_truth_y = data["ground_truth_y"];
    observed_x = data["observed_x"];
    observed_y = data["observed_y"];

    confidence = new FillRange(predict_x, predict_mu, predict_sigma, 3.0, 0xADADAD, pc);
    ground_truth_line = new Points(tf.stack([ground_truth_x, ground_truth_y]).transpose(), 3, 0x4F4F4F, pc);
    observed = new Points(tf.stack([observed_x, observed_y]).transpose(), 9, 0x505050, pc);

    confidence_g = new PIXI.Graphics();
    ground_truth_g = new PIXI.Graphics();
    observed_g = new PIXI.Graphics();

    // 描画
    confidence.plot(confidence_g);
    ground_truth_line.plot(ground_truth_g);
    observed.scatter(observed_g);

    app.stage.addChild(confidence_g);
    app.stage.addChild(ground_truth_g);
    app.stage.addChild(observed_g);

}
