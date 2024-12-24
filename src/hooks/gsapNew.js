import gsap from 'gsap';

const gsapNew = {
  moveTo: function (targets, vars) {
    return gsap.to(targets, vars)
  },
  move: function (targets, vars) {
    const store = {
      current: targets,
      init: { ...targets },
    }
    const stepInterval = vars.stepInterval || -1
    const stepFlag = stepInterval > 0;

    const repeat = vars.duration == -1 ? -1 : (stepFlag ? Math.ceil(vars.duration / updateInterval) : 0)
    const duration = stepFlag ? updateInterval : (vars.duration == -1 ? 1 : vars.duration)

    const tween = gsap.to({ x: 1 }, {
      duration: duration,
      repeat: repeat,
      repeatDelay: 0,
      yoyo: false,
      onUpdate: function () {
        if (stepFlag) {
          return;
        }
        const calculated = vars.compute.bind(store)();
        store.current = calculated;
        if (vars.onUpdate) {
          // console.log('onUpdate', newTween)
          vars.onUpdate.bind(newTween)();
        }
      },
      onRepeat: function () {
        if (!stepFlag) {
          return;
        }
        const calculated = vars.compute.bind(store)();
        store.current = calculated;
        if (vars.onUpdate) {
          vars.onUpdate.bind(newTween)();
        }
      }
    })

    const newTween = {
      now: performance.now(),
      data: vars.data,
      targets: function () {
        return [store.current];
      },
      kill: function () {
        tween.kill()
      },
      isActive: function () {
        return tween.isActive()
      }
    };
    return newTween;
  }

}

export default gsapNew;

