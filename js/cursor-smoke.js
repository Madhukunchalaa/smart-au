// Lightweight, fast cursor smoke trail
// No external deps; optimized with pre-rendered sprite and DPR-aware canvas
(function () {
	"use strict";

	if (typeof window === "undefined") return;

	var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	if (isTouch) return; // skip on touch devices

	var canvas = document.createElement('canvas');
	canvas.setAttribute('aria-hidden', 'true');
	canvas.style.position = 'fixed';
	canvas.style.left = '0';
	canvas.style.top = '0';
	canvas.style.pointerEvents = 'none';
	canvas.style.zIndex = '9999';
	canvas.style.mixBlendMode = 'screen';
	// Slight transparency to blend with page
	canvas.style.opacity = '0.9';

	var ctx = canvas.getContext('2d', { alpha: true });
	var width = 0, height = 0;
	var DPR = Math.min(window.devicePixelRatio || 1, 1.5);

	function resize() {
		width = window.innerWidth;
		height = window.innerHeight;
		canvas.width = Math.floor(width * DPR);
		canvas.height = Math.floor(height * DPR);
		ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // draw in CSS pixels
	}
	window.addEventListener('resize', resize);
	resize();

	// Pre-rendered particle sprite (soft radial gradient)
	var SPRITE_COLOR = { r: 255, g: 112, b: 98 }; // #ff7062
	var spriteCanvas = null;
	function buildSprite() {
		var size = 64;
		spriteCanvas = document.createElement('canvas');
		spriteCanvas.width = size;
		spriteCanvas.height = size;
		var sctx = spriteCanvas.getContext('2d');
		var g = sctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
		g.addColorStop(0, 'rgba(' + SPRITE_COLOR.r + ',' + SPRITE_COLOR.g + ',' + SPRITE_COLOR.b + ',0.55)');
		g.addColorStop(0.6, 'rgba(' + SPRITE_COLOR.r + ',' + SPRITE_COLOR.g + ',' + SPRITE_COLOR.b + ',0.20)');
		g.addColorStop(1, 'rgba(' + SPRITE_COLOR.r + ',' + SPRITE_COLOR.g + ',' + SPRITE_COLOR.b + ',0)');
		sctx.fillStyle = g;
		sctx.beginPath();
		sctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
		sctx.fill();
	}
	buildSprite();

	// Particle system
	var particles = [];
	var maxParticles = 80; // cap for perf

	function rand(min, max) { return Math.random() * (max - min) + min; }

	function createParticle(x, y, baseSpeedX, baseSpeedY) {
		particles.push({
			x: x,
			y: y,
			vx: baseSpeedX + rand(-0.25, 0.25),
			vy: baseSpeedY + rand(-0.25, 0.25),
			radius: rand(5, 12),
			life: 1.0,
			decay: rand(0.018, 0.030)
		});
		if (particles.length > maxParticles) particles.splice(0, particles.length - maxParticles);
	}

	var lastX = null, lastY = null;
	var lastTime = performance.now();

	function onMove(ev) {
		var x = ev.clientX;
		var y = ev.clientY;
		if (lastX === null) {
			lastX = x; lastY = y;
			// instant visible puffs on first move
			for (var j = 0; j < 6; j++) createParticle(x, y, 0, 0);
		}
		var now = performance.now();
		var dt = Math.max(1, now - lastTime);
		lastTime = now;
		var dx = (x - lastX) / dt;
		var dy = (y - lastY) / dt;
		lastX = x; lastY = y;

		// emit multiple small puffs proportional to speed
		var speed = Math.min(2.0, Math.sqrt(dx*dx + dy*dy));
		var count = 1 + Math.floor(speed * 3);
		for (var i = 0; i < count; i++) {
			createParticle(x, y, dx * 1.6, dy * 1.6);
		}
	}

	function step() {
		ctx.clearRect(0, 0, width, height);
		ctx.globalCompositeOperation = 'lighter';

		for (var i = particles.length - 1; i >= 0; i--) {
			var p = particles[i];
			p.x += p.vx;
			p.y += p.vy;
			p.vy -= 0.012; // gentle upward drift
			p.radius *= 1.008; // slow expansion
			p.life -= p.decay;

			if (p.life <= 0 || p.radius <= 0.5) {
				particles.splice(i, 1);
				continue;
			}

			var alpha = Math.max(0, Math.min(0.9, p.life));
			var size = p.radius * 2;
			ctx.globalAlpha = alpha;
			ctx.drawImage(spriteCanvas, p.x - p.radius, p.y - p.radius, size, size);
		}
		ctx.globalAlpha = 1;

		requestAnimationFrame(step);
	}

	function init() {
		document.body.appendChild(canvas);
		window.addEventListener('mousemove', onMove, { passive: true });
		requestAnimationFrame(step);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();

