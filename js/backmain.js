
var renderer, scene, camera, controls;
var fifthform;
var resolution = new THREE.Vector3(window.innerWidth, window.innerHeight);

radians = function(deg){
	return deg*(Math.PI/180.0);
}

init();
animate();

function init() {

	renderer = new THREE.WebGLRenderer( { antialias: true, canvas:document.querySelector('#canvas') } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor( 0xFFFFFF, 0.0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xd5d9e0);

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 0, 0, 50 );

	fifthform = new FifthForm(scene);

	window.addEventListener( 'resize', onWindowResize, false );
	onWindowResize();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	resolution.set(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame( animate );
	fifthform.update();
	renderer.render( scene, camera );
}