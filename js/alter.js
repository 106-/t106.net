// alter.js
function loadScript() {
    var el = document.createElement('script');
    el.src = scripts[script_idx];
    document.body.appendChild(el);
    if (++script_idx < scripts.length) {
        el.onload = loadScript;
    }
};

function getMultinomialRandom(probs) {
    var rnd = Math.random();
    if (probs.length == 1) {
        return 0;
    }
    for (var i = 1; i < probs.length; i++) {
        probs[i] += probs[i - 1];
    }
    for (var i = 0; i < probs.length; i++) {
        if (rnd < probs[i]) {
            return i;
        }
    }
    return probs.length;
}

var script_idx = 0;
var scripts = [];

var scripts_rez = [
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/r97/three.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/three.meshline/1.1.0/THREE.MeshLine.min.js",
    "js/rez/objects.js",
    "js/rez/main.js"
];
var scripts_gp = [
    "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.0.1/pixi.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/tensorflow/4.4.0/tf.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.0/math.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.4/d3.min.js",
    "js/gp/draw.js",
    "js/gp/data.js",
    "js/gp/main.js"
];
var scripts_bm = [
    "js/bm/main.js"
];

// URL のクエリパラメータを取得するヘルパー関数
function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
}

function alter() {
    var mode = getQueryParam("mode");

    // モードが明示されている場合は、そのモードで固定
    if (mode === "rez" || mode === "gp" || mode === "bm") {
        if (mode === "rez") {
            // rez 用のコンテナ（canvas）を作成
            var el = document.createElement("canvas");
            el.id = "canvas";
            document.body.appendChild(el);
            scripts = scripts_rez;
        } else if (mode === "gp") {
            // gp 用のコンテナ（main）を作成
            var el = document.createElement("main");
            el.id = "canvas";
            document.body.appendChild(el);
            scripts = scripts_gp;
        } else if (mode === "bm") {
            // bm 用（ボルツマンマシン）は canvas を利用する例
            var el = document.createElement("canvas");
            el.id = "canvas";
            document.body.appendChild(el);
            scripts = scripts_bm;
        }
        loadScript();
    } else {
        // クエリパラメータで指定がない場合は従来通り乱数で選択
        var idx = getMultinomialRandom([0.1, 0.1, 0.9]);
        if (idx == 0) {
            var el = document.createElement("canvas");
            el.id = "canvas";
            document.body.appendChild(el);
            scripts = scripts_rez;
        } else if (idx == 1) {
            var el = document.createElement("main");
            el.id = "canvas";
            document.body.appendChild(el);
            scripts = scripts_gp;
        } else if (idx == 2) {
            var el = document.createElement("canvas");
            el.id = "canvas";
            document.body.appendChild(el);
            scripts = scripts_bm;
        }
        loadScript();
    }
}

alter();
