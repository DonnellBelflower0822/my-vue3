const arr1 = ['d', 'a', 'b', 'c', 'd']
const arr2 = ['a', 'b', 'c', 'd']

function diff(c1, c2) {
  let i = 0
  let e1 = c1.length - 1
  let e2 = c2.length - 1

  // 从左往右，一次比较是否是相同类型，遇到第一个不同类型则跳出循环
  while (i <= e1 && i <= e2) {
    if (c1[i] === c2[i]) {
      // 走更新操作
      i += 1
    } else {
      break
    }
  }

  // 走到这里：已经处理了[0,i]
  while (i <= e1 && i <= e2) {
    if (c1[e1] === c2[e2]) {
      e1 -= 1
      e2 -= 1
    } else {
      break
    }
  }

  console.log(i, e1, e2)
}

// 0 0 -1
diff(arr1, arr2)

// 0 -1 0
diff(arr2, arr1)
