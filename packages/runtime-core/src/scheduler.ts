let queue = [];
export function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
    queueFlush();
  }
}

let isFlushPending = false;
function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true;
    // 在微任务队列才执行effect
    Promise.resolve().then(flushJobs);
  }
}

function flushJobs() {
  isFlushPending = false;
  queue.sort((a, b) => a.id - b.id);

  for (let i = 0; i < queue.length; i++) {
    const job = queue[i];
    job();
  }

  // 清空
  queue.length = 0;
}