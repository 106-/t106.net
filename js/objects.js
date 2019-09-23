

Ring = function(interval, inner, outer, separate_num, scene){
	this.separate_num = separate_num;
	this.interval = interval;
	this.inner = inner;
	this.outer = outer;
	this.inner_min = new Array(separate_num);
	this.outer_max = new Array(separate_num);
	this.outer_dots = [];
	this.inner_dots = [];
	this.group = new THREE.Group();
    this.time = 0;
	this.linecolor = 0x555555;
	this.linewidth = 0.5;

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
	this.outer_line_dots = []
	for(var i=0; i<this.outer_dots.length-1; i++)
	{
		this.outer_line_dots.push( this.outer_dots[i] );
		this.outer_line_dots.push( this.outer_dots[i+1] );
	}
	this.outer_line_dots.push( this.outer_dots[0] );
	this.outer_line = new THREE.MeshLine(this.outer_line_dots, this.linewidth, this.linecolor);
	this.group.add(this.outer_line);

	// 内周の点を結びつける
	this.inner_line_dots = []
	for(var i=0; i<this.inner_dots.length-1; i++)
	{
		this.inner_line_dots.push( this.inner_dots[i] );
		this.inner_line_dots.push( this.inner_dots[i+1] );
	}
	this.inner_line_dots.push( this.inner_dots[0] );
	this.inner_line = new THREE.MeshLine(this.inner_line_dots, this.linewidth, this.linecolor);
	this.group.add(this.inner_line);

	// 垂直線を結びつける
	this.vert_lines = []
	for(var i=0; i<separate_num; i++)
	{
		vert_line = new THREE.MeshLine([this.inner_dots[i], this.outer_dots[i]], this.linewidth, this.linecolor);
		this.vert_lines.push(vert_line);
		this.group.add(vert_line);
	}

}

Ring.prototype.update = function(){
	this.dots_update();
	this.outer_line.geometry.needsUpdate = true;

	for(var i=0; i<this.separate_num; i++)
	{
		this.vert_lines[i].geometry.needsUpdate = true;
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