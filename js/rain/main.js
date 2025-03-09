// js/rain/main.js
(function () {
    "use strict";

    // --- グリッド・キャンバスの基本設定 ---
    var cellSize = 12;  // セルのサイズを大きくして視認性向上
    var cols, rows;
    var grid = [];      // 現在の水面の高さ
    var prevGrid = [];  // 前回の水面の高さ（波動方程式計算用）
    var velocityGrid = []; // 水面の速度

    // 波の伝播速度と減衰係数
    var propagationSpeed = 0.5; // 波が速く広がるよう調整
    var dampingFactor = 0.992;  // 減衰を弱めて波が長続きするように

    // ポアソン分布のパラメータ
    var lambda = 0.09;    // 単位時間当たりの平均発生回数（より自然な間隔に）
    var lastEventTime = 0;
    var accumulatedTime = 0;

    // 水面の色設定
    var colorSettings = {
        // 背景色（キャンバス全体の色）
        background: "#E8E8E8",

        // 振幅の最小値の色（波の谷の色）
        minColor: { r: 100, g: 100, b: 100 },

        // 振幅の最大値の色（波の山の色）
        maxColor: { r: 245, g: 245, b: 245 },

        // 色の変化の中心値（この値では中間色になる）
        baseHeight: 0,

        // 色が変化する振幅の最大値（この値を超える振幅では maxColor になる）
        maxHeight: 2.2,

        // グリッド線の色
        gridColor: "rgba(0, 0, 0, 0.3)"
    };

    // キャンバス生成
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var width = window.innerWidth;
    var height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // グリッドの初期化
    function initGrid() {
        cols = Math.floor(width / cellSize) + 1;
        rows = Math.floor(height / cellSize) + 1;

        grid = new Array(rows);
        prevGrid = new Array(rows);
        velocityGrid = new Array(rows);

        for (var r = 0; r < rows; r++) {
            grid[r] = new Array(cols).fill(0);
            prevGrid[r] = new Array(cols).fill(0);
            velocityGrid[r] = new Array(cols).fill(0);
        }
    }

    // 水滴を落とす（波紋を作る）
    function createRipple(x, y, intensity) {
        // キャンバス座標からグリッド座標に変換
        var gridX = Math.floor(x / cellSize);
        var gridY = Math.floor(y / cellSize);

        // グリッド範囲内チェック
        if (gridX < 0 || gridX >= cols || gridY < 0 || gridY >= rows) {
            return;
        }

        // 水滴の影響範囲（大きいほど広がる）
        var radius = Math.floor(5 * intensity);

        // 水滴の強さ（高いほど波が高くなる）
        var strength = 12.0 * intensity; // 波の高さを少し強める

        // 水滴が落ちた場所を中心に円形に波を生成
        for (var r = gridY - radius; r <= gridY + radius; r++) {
            for (var c = gridX - radius; c <= gridX + radius; c++) {
                if (r >= 0 && r < rows && c >= 0 && c < cols) {
                    // 中心からの距離を計算
                    var distance = Math.sqrt(Math.pow(r - gridY, 2) + Math.pow(c - gridX, 2));

                    // 円形の水滴に
                    if (distance < radius) {
                        // 中心に近いほど強く、端に行くほど弱くなる強度
                        var dropIntensity = strength * (1 - distance / radius);

                        // 水滴が水面を押し下げる
                        grid[r][c] = -dropIntensity;
                    }
                }
            }
        }
    }

    // ポアソン分布に従って水滴を生成する
    function generatePoissonEvents(deltaTime) {
        // 時間を積算
        accumulatedTime += deltaTime;

        // ポアソン分布に従ってイベント（水滴）を生成
        while (accumulatedTime > 0) {
            // 次のイベントまでの時間を指数分布から生成
            var nextEventTime = -Math.log(1 - Math.random()) / lambda;

            if (nextEventTime > accumulatedTime) {
                // 次のイベントが現在の積算時間を超える場合は終了
                break;
            }

            // イベント（水滴）を生成
            var x = Math.random() * width;
            var y = Math.random() * height;
            var intensity = Math.random() * 0.6 + 0.6; // 0.6〜1.2の範囲で強度を設定
            createRipple(x, y, intensity);

            // 積算時間から消費した時間を引く
            accumulatedTime -= nextEventTime;
        }
    }

    // 波動方程式による水面の更新
    function updateWater() {
        // 波動方程式: 新しい高さ = 2*現在の高さ - 前回の高さ + 速度*（周囲4マスの平均 - 現在の高さ）
        for (var r = 1; r < rows - 1; r++) {
            for (var c = 1; c < cols - 1; c++) {
                // 周囲4マスの平均を計算
                var neighbors = (
                    grid[r - 1][c] +
                    grid[r + 1][c] +
                    grid[r][c - 1] +
                    grid[r][c + 1]
                ) / 4;

                // 波動方程式で次の状態を計算
                var acceleration = propagationSpeed * (neighbors - grid[r][c]);
                velocityGrid[r][c] += acceleration;
                velocityGrid[r][c] *= dampingFactor; // 減衰
            }
        }

        // 画面端の特別処理（反射ではなく吸収境界）
        // 上下左右の端を減衰させて黒く残らないようにする
        for (var r = 0; r < rows; r++) {
            // 左端と右端
            velocityGrid[r][0] *= 0.8;
            grid[r][0] *= 0.8;
            velocityGrid[r][cols - 1] *= 0.8;
            grid[r][cols - 1] *= 0.8;
        }

        for (var c = 0; c < cols; c++) {
            // 上端と下端
            velocityGrid[0][c] *= 0.8;
            grid[0][c] *= 0.8;
            velocityGrid[rows - 1][c] *= 0.8;
            grid[rows - 1][c] *= 0.8;
        }

        // 速度に基づいて位置を更新
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                prevGrid[r][c] = grid[r][c];
                grid[r][c] += velocityGrid[r][c];
            }
        }
    }

    // 水面の高さから色を計算する
    function getColorFromHeight(height) {
        // 高さを0～1の範囲に正規化（baseHeightを0とし、maxHeightを1とする）
        var normalizedHeight = (height - colorSettings.baseHeight) / colorSettings.maxHeight;

        // -1～1の範囲に制限
        normalizedHeight = Math.max(-1, Math.min(1, normalizedHeight));

        var r, g, b;

        if (normalizedHeight < 0) {
            // 負の値（波の谷）はminColorとbaseColorの間で内分
            var ratio = -normalizedHeight; // 0～1に変換
            r = Math.round(colorSettings.minColor.r * ratio + 165 * (1 - ratio));
            g = Math.round(colorSettings.minColor.g * ratio + 165 * (1 - ratio));
            b = Math.round(colorSettings.minColor.b * ratio + 165 * (1 - ratio));
        } else {
            // 正の値（波の山）はbaseColorとmaxColorの間で内分
            var ratio = normalizedHeight;
            r = Math.round(165 * (1 - ratio) + colorSettings.maxColor.r * ratio);
            g = Math.round(165 * (1 - ratio) + colorSettings.maxColor.g * ratio);
            b = Math.round(165 * (1 - ratio) + colorSettings.maxColor.b * ratio);
        }

        return `rgb(${r}, ${g}, ${b})`;
    }

    // 水面の描画
    function drawWater() {
        ctx.clearRect(0, 0, width, height);

        // 背景を塗る
        ctx.fillStyle = colorSettings.background;
        ctx.fillRect(0, 0, width, height);

        // 各セルを描画
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var height = grid[r][c];

                // 水面の高さに応じて色を計算
                ctx.fillStyle = getColorFromHeight(height);
                ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
            }
        }

        // グリッド線を描画
        ctx.strokeStyle = colorSettings.gridColor;
        ctx.lineWidth = 1;

        // 縦線
        for (var c = 0; c <= cols; c++) {
            var x = c * cellSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, rows * cellSize);
            ctx.stroke();
        }

        // 横線
        for (var r = 0; r <= rows; r++) {
            var y = r * cellSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(cols * cellSize, y);
            ctx.stroke();
        }
    }

    // 色設定を変更する関数
    function setColors(newColors) {
        // 指定されたプロパティだけを更新
        for (var prop in newColors) {
            if (colorSettings.hasOwnProperty(prop)) {
                colorSettings[prop] = newColors[prop];
            }
        }
    }

    // ウィンドウリサイズ時の処理
    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initGrid();
    }

    // 前回の時間
    var lastTime = Date.now();

    // アニメーションループ
    function animate() {
        var currentTime = Date.now();
        var deltaTime = (currentTime - lastTime) / 1000; // 秒単位
        lastTime = currentTime;

        // ポアソン分布に従って水滴を生成
        generatePoissonEvents(deltaTime);

        // 水面更新
        updateWater();

        // 描画
        drawWater();

        requestAnimationFrame(animate);
    }

    // 初期化
    function init() {
        initGrid();
        window.addEventListener('resize', resizeCanvas, false);

        // 例: 色設定の変更方法 (必要に応じてコメント解除して利用)
        /*
        setColors({
            // 青系のテーマに変更する例
            background: "#E0E8F0",
            minColor: {r: 50, g: 100, b: 150},
            maxColor: {r: 220, g: 240, b: 255},
            gridColor: "rgba(0, 30, 60, 0.3)"
        });
        */

        animate();
    }

    // 外部から色設定を変更できるようにグローバルに公開
    window.waterRippleEffect = {
        setColors: setColors
    };

    init();
})();