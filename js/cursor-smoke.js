// Lightweight canvas-based cursor smoke trail
// Works without external deps; initialized on DOMContentLoaded
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

	var ctx = canvas.getContext('2d');
	var width = 0, height = 0;

	function resize() {
		width = canvas.width = window.innerWidth;
		height = canvas.height = window.innerHeight;
	}
	window.addEventListener('resize', resize);
	resize();

	// Particle system
	var particles = [];
	var maxParticles = 120; // cap for perf

	function rand(min, max) { return Math.random() * (max - min) + min; }

	function createParticle(x, y, baseSpeedX, baseSpeedY) {
		particles.push({
			x: x,
			y: y,
			vx: baseSpeedX + rand(-0.3, 0.3),
			vy: baseSpeedY + rand(-0.3, 0.3),
			radius: rand(6, 18),
			life: 1.0,
			decay: rand(0.010, 0.028),
			color: 'hsla(' + Math.floor(rand(60, 140)) + ', 80%, 70%, ' // greenish-yellow like smoke highlights
		});
		if (particles.length > maxParticles) particles.splice(0, particles.length - maxParticles);
	}

	var lastX = null, lastY = null;
	var lastTime = performance.now();

	function onMove(ev) {
		var x = ev.clientX;
		var y = ev.clientY;
		if (lastX === null) {
			lastX = x; lastY = y; return;
		}
		var now = performance.now();
		var dt = Math.max(1, now - lastTime);
		lastTime = now;
		var dx = (x - lastX) / dt;
		var dy = (y - lastY) / dt;
		lastX = x; lastY = y;

		// emit multiple small puffs proportional to speed
		var speed = Math.min(1.5, Math.sqrt(dx*dx + dy*dy));
		var count = 2 + Math.floor(speed * 4);
		for (var i = 0; i < count; i++) {
			createParticle(x, y, dx * 2, dy * 2);
		}
	}

	function step() {
		ctx.clearRect(0, 0, width, height);

		// Draw with blur for a soft smoke look
		ctx.save();
		ctx.globalCompositeOperation = 'lighter';
		ctx.filter = 'blur(6px)';
		for (var i = particles.length - 1; i >= 0; i--) {
			var p = particles[i];
			p.x += p.vx;
			p.y += p.vy;
			p.vy -= 0.01; // upward drift
			p.radius *= 0.995; // slight expansion over time
			p.life -= p.decay;

			if (p.life <= 0 || p.radius <= 0.5) {
				particles.splice(i, 1);
				continue;
			}

			var alpha = Math.max(0, Math.min(1, p.life));
			ctx.beginPath();
			ctx.fillStyle = p.color + alpha + ')';
			ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();

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

