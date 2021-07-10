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

  if (i > e1) {
    if (i <= e2) {
      // 1. 新增

      // 1.0 前新增
      // (a b c d)
      // f (a b c d)
      // i = 0, e1 = -1, e2 = 0     ===> i> e1 且 [i, e2]部分为新增

      // 1.1 中间新增
      // (a b) (c d)
      // (a b) e (c d)
      // i =2, e1=1, e2=2   ===> i> e1 且 [i,e2]部分为新增

      // 1.2 后新增
      // (a, b, c, d)
      // (a, b, c, d), e, f
      // i = 4, e1 = 4, e2 = 6 ===>i> e1 且 [i,e2]部分为新增

      while (i <= e2) {
        // 新增
        console.log('新增', c2[i])
        i++
      }
    }
  }
}

// 新增
// 后面新增
// diff(['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd', 'e', 'f'])
// 中间新增
// diff(['a', 'b', 'c', 'd'], ['a', 'b', 'e', 'f', 'c', 'd'])
// 前面新增
// diff(['a', 'b', 'c', 'd'], ['f', 'a', 'b', 'c', 'd'])
