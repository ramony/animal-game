import { useState, useCallback, useRef } from 'react';

export function useAnimations() {

  const animationsRef = useRef([]);

  const addAll = (animations) => {
    animationsRef.current.push(...animations)
  }

  const getTargetMap = useCallback(() => {
    if (animationsRef.current.length === 0) {
      return {};
    }
    const targetMap = animationsRef.current.reduce((acc, animation) => {
      const tween = animation.tween
      if (tween.isActive()) {
        acc[animation.id] = tween.targets()[0];
      }
      return acc;
    }, {});
    return targetMap;
  }, [animationsRef])

  const stopAnimation = (id) => {
    //console.log('stopAnimation', id)
    animationsRef.current = animationsRef.current.filter(animation => {
      if (animation.id === id) {
        animation.tween.kill();
      }
      return animation.id !== id;
    });
  };

  return [addAll, getTargetMap, stopAnimation];
}