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

  if (i > e1) {
    if (i <= e2) {
      // 新增: [i, e2]
      while (i <= e2) {
        console.log('新增', c2[i])
        i++
      }
    }
  } else if (i > e2) {
    // 删除: [i, e1]
    while (i <= e1) {
      console.log('删除', c1[i])
      i++
    }
  } else {
    // i = 2, e1 = 5, e2 = 5
    // ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    // ['a', 'b', 'e', 'c', 'd', 'i', 'g', 'h'],

    // 待处理部分： [s1,e1] [s2,e2]
    // ['c', 'd', 'e', 'f']
    // ['e', 'c', 'd', 'i']

    // 旧索引开始 2
    const s1 = i
    // 新索引开始 2
    const s2 = i

    // 用新的元素做映视表，Map{key: index}
    // 如果在旧的元素找不到则是删除
    const keyToNewIndexMap = new Map()
    for (i = s2;i <= e2;i += 1) {
      keyToNewIndexMap.set(c2[i], i)
    }

    // Map { 'e' => 2, 'c' => 3, 'd' => 4, 'i' => 5 }
    // console.log(keyToNewIndexMap)

    // 新数组中需要处理的个数： 4
    const toBePatched = e2 - s2 + 1
    // [0,0,0,0]
    // 索引代表 在新数组的索引
    // 值代表： 在旧数组的索引
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

    let maxNewIndexSoFar = 0
    let moved = false

    // 从旧的元素查找是否是删除或是复用
    for (i = s1;i <= e1;i += 1) {
      const old = c1[i]
      const newIndex = keyToNewIndexMap.get(old)

      if (newIndex === undefined) {
        // 卸载：新的没有，旧的有
        console.log('unmount', old)
      } else {
        // 新的索引 => 旧的索引
        // [5,3,4,0]
        newIndexToOldIndexMap[newIndex - s2] = i + 1

        // 新位置索引小于最大索引，证明需要移动
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex
        } else {
          moved = true
        }

        // 做patch
      }
    }

    // 倒序
    for (i = toBePatched - 1;i >= 0;i--) {
      const currentIndex = i + s2

      if (newIndexToOldIndexMap[i] === 0) {
        console.log('新增', c2[currentIndex])
        continue
      } else {
        // 做最长增长序列去优化移动
        console.log('move', c2[currentIndex])
      }
    }
  }
}

diff(
  ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  ['a', 'b', 'e', 'c', 'd', 'i', 'g', 'h'],
)
