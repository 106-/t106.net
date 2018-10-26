if ( WEBGL.isWebGLAvailable() === false ) {
	document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

var renderer, scene, camera, controls;
var fifthform;
var gui, stats;
var linewidth = 10;
var resolution = new THREE.Vector3(window.innerWidth, window.innerHeight);

radians = function(deg){
	return deg*(Math.PI/180.0);
}

init();
animate();

function init() {

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor( 0xFFFFFF, 0.0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xd5d9e0);

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 0, 0, 50 );

	// controls = new THREE.OrbitControls( camera, renderer.domElement );
	// controls.minDistance = 10;
	// controls.maxDistance = 500;

	fifthform = new FifthForm(scene);

	window.addEventListener( 'resize', onWindowResize, false );
	onWindowResize();

	// stats = new Stats();
	// document.body.appendChild( stats.dom );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	resolution.set(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame( animate );
	// stats.update();
	fifthform.update();
	renderer.setClearColor( 0xFFFFFF, 0 );
	renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
	renderer.render( scene, camera );
}