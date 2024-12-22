import { useState, useCallback } from 'react';
import easeFunctions from '../lib/easeFunctions';

export function useLinearMove() {
  const [motion, setMotion] = useState({});

  const start = (index, data, speed, range) => {
    setMotion(prev => {
      if (prev[index]?.flag) {
        return prev;
      }
      return {
        ...prev, [index]: {
          flag: true, data, speed, direction: 1, progress: 0, range
        }
      }
    });
  }

  const calc = (data, progress) => {
    const result = {}
    for (const key in data) {
      const subData = data[key]
      const easeFn = easeFunctions[subData.easeFn] || easeFunctions.linear
      result[key] = subData.v + subData.dV * easeFn(progress);
    }
    return result;
  }

  const get = useCallback((index, delta) => {
    if (!motion[index]?.flag) {
      return null;
    }
    const speed = motion[index].speed || 1
    const direction = motion[index].direction || 1
    const data = motion[index].data

    const range = motion[index].range || [1]
    let result = null
    if (range.length === 1) {
      const max = range[0]
      const progress = Math.min(motion[index].progress + direction * speed * delta / 60, max);
      result = calc(data, progress)
      if (progress >= max) {
        setMotion(prev => ({ ...prev, [index]: { flag: false } }));
      } else {
        setMotion(prev => ({ ...prev, [index]: { ...prev[index], progress: progress } }));
      }
    } else {
      const min = range[0]
      const max = range[1]
      const progress = Math.max(min, Math.min(motion[index].progress + direction * speed * delta / 60, max));
      result = calc(data, progress)
      if (progress >= max) {
        setMotion(prev => ({ ...prev, [index]: { ...prev[index], direction: -1 } }));
      } else if (progress <= min) {
        if (range.length === 3 && range[2] === true) {
          setMotion(prev => ({ ...prev, [index]: { ...prev[index], direction: 1 } }));
        } else {
          setMotion(prev => ({ ...prev, [index]: { flag: false } }));
        }
      } else {
        setMotion(prev => ({ ...prev, [index]: { ...prev[index], progress: progress } }));
      }
    }
    return result;
  }, [motion])

  return {
    start,
    get
  };
}


export function useRotateMove() {
  const [motion, setMotion] = useState({});

  const start = (index, data, speed) => {
    setMotion(prev => {
      if (prev[index]?.flag) {
        return prev;
      }
      return {
        ...prev, [index]: {
          flag: true, data, speed, progress: 0
        }
      }
    });
  }

  const calc = (data, progress) => {
    const result = {}
    for (const key in data) {
      const subData = data[key]
      const easeFn = easeFunctions[subData.easeFn] || easeFunctions.linear
      const x = subData.v.x - subData.radius * Math.sin(easeFn(progress) * Math.PI * 2)
      const y = subData.v.y - subData.radius * Math.cos(easeFn(progress) * Math.PI * 2)
      result[key] = { x, y };
    }
    return result;
  }

  const get = useCallback((index, delta) => {
    if (!motion[index]?.flag) {
      return null;
    }
    const speed = motion[index].speed || 1
    const direction = motion[index].direction || 1
    const data = motion[index].data
    let progress = motion[index].progress + direction * speed * delta / 60;
    if (progress > 1) progress -= 1;
    const result = calc(data, progress)
    setMotion(prev => ({ ...prev, [index]: { ...prev[index], progress: progress } }));
    return result;
  }, [motion])

  return {
    start,
    get
  };
}