

Ring = function(interval, inner, outer, separate_num, scene){
	this.separate_num = separate_num;
	this.interval = interval;
	this.inner = inner;
	this.outer = outer;
	this.inner_min = new Array(separate_num);
	this.outer_max = new Array(separate_num);
	this.outer_dots = [];
	this.inner_dots = [];
	this.outer_geometry = new THREE.Geometry();
	this.inner_geometry = new THREE.Geometry();
	this.vert_geometries = [];
	this.group = new THREE.Group();
    this.time = 0;
    
    this.material = new MeshLineMaterial({
        lineWidth: linewidth,
        color: new THREE.Color(0x555555),
        resolution: resolution,
        near: 1,
        far:10,
        sizeAttenuation: 0,
        depthTest: true, 
        useMap: false
    });

	// 内周,外周に当たる点を初期化.こいつを動かす
	for(var i=0; i< 360; i++)
	{
		var angle = 360/separate_num;
		if(i%angle==0)
		{
			this.inner_dots.push( new THREE.Vector3( Math.cos(radians(i))*this.inner, Math.sin(radians(i))*this.inner, 0));
			this.outer_dots.push( new THREE.Vector3( Math.cos(radians(i))*this.outer, Math.sin(radians(i))*this.outer, 0));
		}
	}

	// 外周の点を結びつける
	this.outer_geometry.vertices = [];
	this.outer_geometry.vertices.push( this.outer_dots[this.outer_dots.length-1] );
	this.outer_geometry.vertices.push( this.outer_dots[0] );
	for(var i=0; i<this.outer_dots.length-1; i++)
	{
		this.outer_geometry.vertices.push( this.outer_dots[i] );
		this.outer_geometry.vertices.push( this.outer_dots[i+1] );
	}

	// 内周の点を結びつける
	this.inner_geometry.vertices = [];
	this.inner_geometry.vertices.push( this.inner_dots[this.inner_dots.length-1] );
	for(var i=0; i<this.inner_dots.length-1; i++)
	{
		this.inner_geometry.vertices.push( this.inner_dots[i] );
		this.inner_geometry.vertices.push( this.inner_dots[i+1] );
	}

	// 垂直線を結びつける
	for(var i=0; i<separate_num; i++)
	{
		this.vert_geometries[i] = new THREE.Geometry();
		this.vert_geometries[i].vertices = [];
		this.vert_geometries[i].vertices.push(this.inner_dots[i], this.outer_dots[i]);
	}

	// MeshLineの初期化
	this.outer_meshline = new MeshLine();
	this.outer_meshline.setGeometry(this.outer_geometry);
	this.outer_mesh = new THREE.Mesh(this.outer_meshline.geometry, this.material);
	this.group.add(this.outer_mesh);
	this.inner_meshline = new MeshLine();
	this.inner_meshline.setGeometry(this.inner_geometry);
	this.inner_mesh = new THREE.Mesh(this.inner_meshline.geometry, this.material);
	this.group.add(this.inner_mesh);
	this.vert_meshlines = [];
	this.vert_meshes = [];
	for(var i=0; i<separate_num; i++)
	{
		this.vert_meshlines[i] = new MeshLine();
		this.vert_meshlines[i].setGeometry(this.vert_geometries[i]);
		this.vert_meshes[i] = new THREE.Mesh(this.vert_meshlines[i].geometry, this.material);
		this.group.add(this.vert_meshes[i]);
	}
	//scene.add(this.group);
}

Ring.prototype.update = function(){
	this.dots_update();
	this.outer_meshline.setGeometry(this.outer_geometry);
	this.outer_geometry.verticesNeedUpdate = true;
	for(var i=0; i<this.separate_num; i++)
	{
		this.vert_meshlines[i].setGeometry(this.vert_geometries[i]);
		this.vert_geometries[i].verticesNeedUpdate = true;
	}
}

Ring.prototype.dots_update = function(){
	tick = this.time % this.interval;
	maxtick = this.interval*(1.0/4.0);

	if(tick==0)
	{
		for(var i=0; i<this.inner_dots.length; i++)
		{
			this.inner_min[i] = this.inner + 2 + (Math.random()-0.5)*2;
			// ある程度ギザギザにしたいのでこうなっている
			if(i%2==0)
				this.outer_max[i] = this.outer + 3 + (Math.random()-0.5)*6;
			else
				this.outer_max[i] = this.outer - 2 + (Math.random()-0.5)*6;
		}
	}

	if(tick<maxtick)
	{
		for(var i=0; i<this.outer_dots.length; i++)
		{
			r = this.inner_min[i] + (this.outer_max[i]-this.inner_min[i]) * tick / maxtick;
			angle = radians(360/this.separate_num*i);
			this.outer_dots[i].x = Math.cos(angle)*r;
			this.outer_dots[i].y = Math.sin(angle)*r;
		}
	}
	else
	{
		for(var i=0; i<this.outer_dots.length; i++)
		{
			r = this.outer_max[i] - (this.outer_max[i]-this.inner_min[i]) * (tick-maxtick) / (this.interval-maxtick);
			angle = radians(360/this.separate_num*i);
			this.outer_dots[i].x = Math.cos(angle)*r;
			this.outer_dots[i].y = Math.sin(angle)*r;
		}
	}
	this.time += 1;
}

FifthForm = function(scene){
	this.group = new THREE.Group();
	this.rings = [
		new Ring(40, 2, 16, 20, scene),
		new Ring(40, 2, 16, 20, scene),
		new Ring(40, 2, 16, 20, scene)
	]
	y_tilt = new Array(0, 30, 10);
	z_tilt = new Array(0, 10, 30);
	for(var i=0; i<this.rings.length; i++)
	{
		this.rings[i].group.rotateX(radians(120*i));
		this.rings[i].group.rotateY(radians(y_tilt[i]));
		this.rings[i].group.rotateZ(radians(z_tilt[i]));
		this.group.add(this.rings[i].group);
	}
	this.geometry = new THREE.SphereGeometry(1.5, 32, 32);
	this.material = new THREE.MeshBasicMaterial( {color: 0x242526} );
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.group.add(this.mesh);

	scene.add(this.group);
}

FifthForm.prototype.update = function(){
	for(var i=0; i<this.rings.length; i++){
		this.rings[i].update();
	}
	this.group.rotateX(radians(-1.0));
	this.group.rotateZ(radians(0.3));
}