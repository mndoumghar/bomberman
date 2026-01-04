import { h, useEffect, useState } from '../new-framework/index.js';

export function LivesStat({ lives, prevLives, onAnimationEnd }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let animationFrameId;
    let startTime = Date.now();

    const animate = () => {
      const time = Date.now() - startTime;
      const y = Math.abs(Math.sin(time / 300)) * -5; 
      
      setOffset(y);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return h('div', {
    class: `stat stat-lives ${prevLives !== undefined && prevLives !== lives ? 'value-changed' : ''}`,
    style: `transform: translateY(${offset}px);`, 
    onanimationend: onAnimationEnd
  }, [`❤️ ${lives ?? 0}`]);
}
