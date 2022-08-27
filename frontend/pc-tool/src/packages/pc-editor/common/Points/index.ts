// @ts-ignore
import PointsWorker from './worker?worker&url';

const worker = new PointsWorker() as Worker;

// worker.postMessage({ a: 1 });
worker.onmessage = function (event) {};

worker.addEventListener('message', function (event) {});

// @ts-ignore
window.worker = worker;
