const arr = [1, 8, 5, 3, 6, 9, 7, 6]

// 索引
function getSequence(arr) {
  const len = arr.length
  const result = [0]

  let start
  let end
  let middle

  for (let i = 1;i < len;i += 1) {
    const arrI = arr[i]

    if (arrI !== 0) {
      const lastResult = result[result.length - 1];
      console.log(arr[lastResult])
      if (arr[lastResult] < arrI) {
        result.push(i)
        continue
      }

      // 二分查找
      start = 0
      end = result.length - 1

      while (start < end) {
        // 找到中间位置的前一个
        middle = (start + end) / 2 | 0

        if (arr[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        }
      }

      if (arrI < arr[result[start]]) {
        result[start] = i
      }
    }
  }

  return result
}

console.log(getSequence(arr))