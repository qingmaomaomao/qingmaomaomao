import * as THREE from 'three';

export class SVGLoader {
    constructor() {
        this.cache = new Map();
    }

    async loadSVG(path) {
        if (this.cache.has(path)) {
            return this.cache.get(path);
        }

        try {
            const response = await fetch(path);
            const svgText = await response.text();

            // 创建一个临时的图像元素来加载 SVG
            const img = new Image();
            const blob = new Blob([svgText], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);

            return new Promise((resolve, reject) => {
                img.onload = () => {
                    // 创建画布并绘制 SVG
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width || 32;
                    canvas.height = img.height || 32;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    // 创建纹理
                    const texture = new THREE.CanvasTexture(canvas);
                    texture.magFilter = THREE.NearestFilter;
                    texture.minFilter = THREE.NearestFilter;

                    URL.revokeObjectURL(url);
                    this.cache.set(path, texture);
                    resolve(texture);
                };
                img.onerror = reject;
                img.src = url;
            });
        } catch (error) {
            console.error(`Failed to load SVG: ${path}`, error);
            return this.createDefaultTexture();
        }
    }

    createDefaultTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(0, 0, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
}
