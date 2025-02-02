// js/rd/main.js
(function () {
    "use strict";

    // --- グリッド・キャンバスの基本設定 ---
    var cellSize = 5;  // 1タイルのサイズ（正方形）
    var cols, rows;
    var grid;           // 各セルは 0 (ブロック：濃いグレイ) または 1 (背景：薄いグレイ)

    // キャンバス生成＆bodyへ追加
    var canvas = document.createElement("canvas");
    canvas.id = "canvas";
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    // 画面サイズに合わせてキャンバスとグリッドを初期化
    function initGrid() {
        cols = Math.floor(canvas.width / cellSize);
        rows = Math.floor(canvas.height / cellSize);
        grid = new Array(rows);
        for (var r = 0; r < rows; r++) {
            grid[r] = new Array(cols);
            for (var c = 0; c < cols; c++) {
                // 初期状態はランダムに 0（ブロック）または 1（背景）を設定
                grid[r][c] = Math.random() < 0.5 ? 0 : 1;
            }
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initGrid();
    }
    window.addEventListener("resize", resizeCanvas, false);
    resizeCanvas();

    // --- ボルツマンマシン（Isingモデル風）のパラメータ ---
    var beta = 0.5; // 逆温度（1/T）
    var J = 1.0;    // 結合定数（隣接セルとの相互作用）

    // 指定したセル (r, c) のみ、Gibbsサンプリングによる更新を行う
    function updateCell(r, c) {
        var sum = 0;
        // 8近傍（上下左右＋斜め）の状態の合計を求める
        // ※内部では 0 を -1、1 を +1 として扱う
        for (var dr = -1; dr <= 1; dr++) {
            for (var dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                var nr = (r + dr + rows) % rows;
                var nc = (c + dc + cols) % cols;
                sum += (2 * grid[nr][nc] - 1);
            }
        }
        // 論理的には、セル i の s_i (±1) を更新する確率は
        //    P(s_i = +1) = 1/(1 + exp(-2 * beta * J * (∑_j s_j)))
        // として計算できるので、ここでは 0/1 の表現に合わせて変換
        var prob = 1 / (1 + Math.exp(-2 * beta * J * sum));
        // 確率 prob で状態を 1、そうでなければ 0 に更新
        grid[r][c] = Math.random() < prob ? 1 : 0;
    }

    // 毎フレーム、全セルのうち約5%程度をランダムに選んで更新する
    // これにより、一度に大量の計算をせず、負荷を分散させる
    function updateGrid() {
        var totalCells = rows * cols;
        var numUpdates = Math.floor(totalCells * 0.05); // 5%更新
        for (var i = 0; i < numUpdates; i++) {
            var r = Math.floor(Math.random() * rows);
            var c = Math.floor(Math.random() * cols);
            updateCell(r, c);
        }
    }

    // --- 描画処理 ---
    function drawGrid() {
        // キャンバス全体を薄いグレイ（背景色: 例 hsl(0, 0%, 90%)）で塗る
        ctx.fillStyle = "hsl(0, 0%, 90%)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 各セルを描画：セルの状態が 0 (ブロック) の場合、濃いグレイで塗る
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                if (grid[r][c] === 0) {
                    var x = c * cellSize;
                    var y = r * cellSize;
                    ctx.fillStyle = "hsl(0, 0%, 30%)";
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }

        // グリッド線の描画（セル境界を薄い線で表示）
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
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

    // --- アニメーションループ ---
    // 毎フレーム、少しずつサンプリング更新を行い、その後グリッドを描画する
    function animate() {
        updateGrid();
        drawGrid();
        requestAnimationFrame(animate);
    }
    animate();

})();
