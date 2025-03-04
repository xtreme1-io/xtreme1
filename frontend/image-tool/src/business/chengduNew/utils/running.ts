export function multiRun(
  _config: { taskN: number; maxRun?: number },
  runFn: (i: number) => void | Promise<any>,
) {
  let nextIndex = 0;
  let runningN = 0;
  let stopFlag = false;
  let cancelFlag = false;

  const config = Object.assign(_config, { maxRun: 4 }) as Required<typeof _config>;

  const promise = new Promise((resolve, reject) => {
    while (nextIndex < config.taskN && runningN < config.maxRun) {
      _next();
    }

    async function _next() {
      if (cancelFlag || stopFlag || nextIndex >= config.taskN || runningN >= config.maxRun) return;

      const index = nextIndex++;
      runningN++;
      try {
        await runFn(index);
      } catch (error) {
        stopFlag = true;
        cancel();
        reject(error);
        return;
      }
      runningN--;

      if (!cancelFlag && runningN === 0 && nextIndex >= config.taskN) {
        stopFlag = true;
        resolve(config.maxRun);
      } else {
        _next();
      }
    }
  });

  function cancel() {
    cancelFlag = true;
  }

  return {
    promise,
    cancel,
  };
}
