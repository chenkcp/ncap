/**
 * syncLotDefectCounts - 同步 lotDefectCounts 数据
 * 
 * 根据 penDefects 中的 primary 缺陷（primaryDefect === -1）统计每个 lot 的缺陷数量，
 * 同时统计 Good pen 数量，维护 lotDefectCounts 的增删改。
 * 
 * lotDefectCounts 结构:
 * {
 *   lineType, lineNumber, source, lotId, birthday,
 *   itemType: "PEN",
 *   className: "Good" | "Risk" | "Functional" | "Cosmetic",
 *   count: number
 * }
 * 
 * 统计规则:
 * - 遍历 lot 下所有 pen，查找每个 pen 的 primary 缺陷 (primaryDefect !== 0)
 * - 兼容两种 sentinel：DefectEditor 写入 1，FrmNextCap (ink weight/burst) 写入 -1
 * - 如果 pen 有 primary 缺陷，则该缺陷的 className 的 count +1
 * - 如果 pen 没有任何缺陷（Good pen），则 "Good" 的 count +1
 * - 如果某个 className 的 count 变为 0，则删除该条记录
 * - 如果某个 className 之前不存在，则新增记录
 */

import { useGlobalStore } from '../store'

/**
 * 同步指定 lotId 的 lotDefectCounts
 * @param {string} lotId - 要同步的 lot ID
 */
export function syncLotDefectCounts(lotId) {
  if (!lotId) return

  const state = useGlobalStore.getState()
  const { pens, penDefects, lots, lotDefectCounts, clientInfo, setLotDefectCounts } = state

  // 找到当前 lot
  const lot = lots.find(l => l.lotId === lotId)
  if (!lot) {
    console.warn(`[syncLotDefectCounts] Lot not found: ${lotId}`)
    return
  }

  // 获取该 lot 下的所有 pen
  const lotPens = pens.filter(p => p.lotId === lotId)

  // 统计各 className 的 count
  // className: Good, Risk, Functional, Cosmetic
  const countMap = { Good: 0, Risk: 0, Functional: 0, Cosmetic: 0 }

  lotPens.forEach(pen => {
    // 获取该 pen 的所有缺陷
    const penDefectList = penDefects.filter(
      d => d.lotId === lotId && d.penId === pen.penId
    )

    if (penDefectList.length === 0) {
      // Good pen - 没有缺陷
      countMap.Good += 1
    } else {
      // 找到 primary 缺陷
      // 兼容两种 sentinel 值：DefectEditor 写入 1，FrmNextCap (ink weight/burst strength) 写入 -1
      const primaryDefect = penDefectList.find(d => d.primaryDefect !== 0 && d.primaryDefect != null)
      if (primaryDefect && primaryDefect.className) {
        countMap[primaryDefect.className] = (countMap[primaryDefect.className] || 0) + 1
      } else {
        // 有缺陷但没有 primary 标记的，也算 Good
        // （理论上不应出现，因为保存时会强制设置 primary）
        countMap.Good += 1
      }
    }
  })

  // 基础字段
  const baseFields = {
    lineType: lot.lineType || clientInfo.lineType,
    lineNumber: lot.lineNumber || parseInt(clientInfo.lineNumber) || 1,
    source: lot.source || clientInfo.source,
    lotId: lot.lotId,
    birthday: lot.birthday,
    itemType: 'PEN',
  }

  // 获取其他 lot 的 lotDefectCounts（保持不变）
  const otherCounts = lotDefectCounts.filter(dc => dc.lotId !== lotId)

  // 构建新的 lotDefectCounts：只保留 count > 0 的记录
  const newLotCounts = Object.entries(countMap)
    .filter(([, count]) => count > 0)
    .map(([className, count]) => ({
      ...baseFields,
      className,
      count,
    }))

  const updatedCounts = [...otherCounts, ...newLotCounts]

  console.log(`📊 [syncLotDefectCounts] lotId=${lotId}`, countMap)
  setLotDefectCounts(updatedCounts)
}

export default syncLotDefectCounts
