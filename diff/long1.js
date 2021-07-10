const arr = [1, 8, 5, 3, 4, 9, 7, 6]

// 1 8
// 1 5
// 1 3
// 1 3 4
// 1 3 4 9
// 1 3 4 7
// 1 3 4 6

// 获取索引
function getSequence(arr) {
  const len = arr.length
  // 存放索引
  const result = [0]
  let start
  let end
  let middle

  for (let i = 0;i < len;i += 1) {
    const item = arr[i]
    if (item !== 0) {
      const resultLastIndex = result[result.length - 1]

      if (arr[resultLastIndex] < arr[i]) {
        result.push(i)
      } else {
        // 二分超找
        start = 0
        end = result.len - 1
        while (start < end) {
          // 中间位置的前一个
          middle = ((start + end) / 2) | 0

          if (arr[result[middle]] < arr[i]) {
            start = middle + 1
          } else {
            end = middle
          }
        }
      }
    }
  }

  return result
}

getSequence()

