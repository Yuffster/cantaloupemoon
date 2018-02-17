

const defaultSpriteOpts = {
	rowSize: 0,
	colSize: 0,
	rowMargin: 0, 
	colMargin: 0,
};

class Sprite {

	constructor(src, opts) {
		this._src = src;
		this._opts = Object.assign({}, defaultSpriteOpts, opts);
		this._playloop = '';
		this._loops = {};
		this._sprite = document.createElement('div');
		this._currentFrame = [0, 0];
		this._playTimer = setInterval(() => this.cycleFrame(), 12/60*1000);
		this._x = 0;
		this._y = 0;
		this._paused = true;
	}

	get currentLoop() {
		return this._loops[this._playloop];
	}

	row(n) {
		return n * this._opts.rowSize;
	}

	col(n) {
		return n * this._opts.colSize;
	}

	addLoop(name, start, frames) {
		this._loops[name] = {
			start: start,
			frames: frames
		};
	}

	render(parentEl) {
		var d = this._sprite;
		d.style.backgroundImage = "url('./"+this._src+"')";
		d.style.backgroundPosition = "0 0";
		d.style.position = 'absolute';
		d.style.width = this._opts.colSize;
		d.style.height = this._opts.rowSize;
		parentEl.appendChild(d);
	}

	setFrame(col, row) {
		this.setPosition(this.col(col), this.row(row));
		this._currentFrame = [col, row];
	}

	setLoop(name) {
		this._playloop = name;
		this._playindex = 1;
		this.cycleFrame();
	}

	cycleFrame() {
		if (!this._moving) return;
		if (!this.currentLoop) return;
		if (this._playindex < this.currentLoop.frames) {
			this._playindex++;
			this.advanceFrame();
		} else {
			this._playindex = 1;
			this.setFrame(...this.currentLoop.start);
		}
		this.stepForward();
	}

	advanceFrame() {
		this._currentFrame[0]++;
		this.setFrame(...this._currentFrame);
	}

	stepForward() {
		var spd = 32;
		if (!this._moving) return;
		if (this._dir == 'right') {
			this._x+= spd;
		} else if (this._dir == 'left') {
			this._x-= spd;
		} else if (this._dir == 'down') {
			this._y+=spd;
		} else if (this._dir == 'up') {
			this._y-=spd;
		}
		if (this._x > document.body.clientWidth-60) {
			this._dir = 'left';
			this.setLoop('walkleft')
		}
		if (this._x < 0) {
			this._dir = '';
			this.setLoop('walkright');
		}
		if (this._y > document.body.clientHeight-60) {
			this._dir = 'up';
			this.setLoop('walkdown')
		}
		if (this._y < 0) {
			this._dir = 'down';
			this.setLoop('walkup');
		}
		this._sprite.style.left=this._x+"px";
		this._sprite.style.top=this._y+"px";
	}

	setPosition(x, y) {
		this._sprite.style.backgroundPosition = "-"+x+"px -"+y+"px";
	}

}

var s = new Sprite('sprite.png', {
	rowSize: 16*4,
	colSize: 32,
});

s.addLoop('walkright', [0, 1], 4);
s.addLoop('walkleft',  [0, 2], 4);
s.addLoop('walkup',    [0, 4], 4);
s.addLoop('walkdown',  [0, 3], 4);

s.setLoop('walkright');
s._dir = 'right';
s.render(document.body);

var down = false;
window.onkeydown = (e) => {
	if (down) return;
	down = true;
	var dir = e.key.match(/^Arrow(.*)$/);
	if (dir) {
		let d = dir[1].toLowerCase();
		s._dir = d;
		s.setLoop('walk'+d);
	}
	s._moving = true;
};

window.onkeyup = (e) => {
	down = false;
	s._moving = false;
};
