const queue = [];

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
    // 在调度前，会将所有同步的都会放到queue
    Promise.resolve().then(flushJobs);
  }
}

function flushJobs() {
  isFlushPending = false;

  // 处理排序，执行父的再执行子的
  queue.sort((a, b) => a.id - b.id);

  for (let i = 0; i < queue.length; i++) {
    const job = queue[i];
    job();
  }

  // 清空
  queue.length = 0;
}

export function invalidateJob(job) {
  const index = queue.indexOf(job);
  if (index !== -1) {
    queue.splice(index, 1);
  }
}