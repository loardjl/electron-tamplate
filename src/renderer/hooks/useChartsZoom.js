let startTouches = []
let startDistance = 0
let initialDataZoom = null
let scale = 1
let startP = 0
let endP = 100
let wx = 0
export const useChartsZoom = (myChart, signal, once = false, xyAxis = 'x') => {
  myChart.getDom().addEventListener('touchstart', handleTouchStart, { once, signal })
  myChart.getDom().addEventListener('touchmove', handleTouchMove, { once, signal })
  myChart.getDom().addEventListener('touchend', handleTouchEnd, { once, signal })
  // 获取图表当前的坐标系
  const xAxis =
    xyAxis === 'x'
      ? myChart.getModel().getComponent('xAxis')
      : myChart.getModel().getComponent('yAxis')
  const coordinateSystem = xAxis.axis.grid
  const rect = xyAxis === 'x' ? coordinateSystem.getRect().width : coordinateSystem.getRect().height
  const mg = xyAxis === 'x' ? coordinateSystem.getRect().x : coordinateSystem.getRect().y
  function handleTouchStart(event) {
    if (event.touches.length === 2) {
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      if (xyAxis === 'x') {
        wx = myChart.getDom().getBoundingClientRect().left + mg
        const point1 = Math.max(touch1.clientX - wx, 0)
        const point2 = Math.max(touch2.clientX - wx, 0)
        point1 > point2 ? (startP = (point2 / rect) * 100) : (startP = (point1 / rect) * 100)
        point1 > point2 ? (endP = (point1 / rect) * 100) : (endP = (point2 / rect) * 100)
      } else {
        wx = myChart.getDom().getBoundingClientRect().top + mg
        const point1 = touch1.clientY - mg
        const point2 = touch2.clientY - mg
        point1 > point2 ? (startP = (point2 / rect) * 100) : (startP = (point1 / rect) * 100)
        point1 > point2 ? (endP = (point1 / rect) * 100) : (endP = (point2 / rect) * 100)
      }
      startP = Math.max(startP, 0)
      endP = Math.min(endP, 100)
      startDistance = getDistance(touch1, touch2)
      initialDataZoom = myChart.getOption().dataZoom[0]
      startTouches = [...event.touches].map(touch => {
        return {
          x: touch.clientX,
          y: touch.clientY
        }
      })
    } else if (event.touches.length === 1) {
      startTouches = [...event.touches].map(touch => {
        return {
          x: touch.clientX,
          y: touch.clientY
        }
      })
    }
  }
  function handleTouchMove(event) {
    event.preventDefault()
    if (event.touches.length === 2) {
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      const currentDistance = getDistance(touch1, touch2)

      // 计算缩放比例
      scale = startDistance / currentDistance
      // 计算缩放的中心点
      const dataZoomStart = initialDataZoom.start
      const dataZoomEnd = initialDataZoom.end
      const zoomRange = (dataZoomEnd - dataZoomStart) / 100

      // 计算新的数据范围
      const realsp = zoomRange * startP + dataZoomStart
      const realep = zoomRange * endP + dataZoomStart
      const centerP = (realep - realsp) / 2 + realsp
      const newStart = centerP - (centerP - dataZoomStart) * scale
      const newEnd = centerP + (dataZoomEnd - centerP) * scale

      // 检查新的数据范围是否超出边界
      const boundedNewStart = Math.max(newStart, 0)
      const boundedNewEnd = Math.min(newEnd, 100)

      // 调用 dispatchAction 完成缩放操作
      myChart.dispatchAction({
        type: 'dataZoom',
        start: boundedNewStart,
        end: boundedNewEnd
      })
    } else if (event.touches.length === 1) {
      // 获取手势的移动位移
      const deltaX = event.touches[0].clientX - startTouches[0].x

      // 计算缩放范围的偏移量
      const offset = (deltaX / rect) * 100

      // 调整缩放范围
      const newStart = myChart.getOption().dataZoom[0].start - offset
      const newEnd = myChart.getOption().dataZoom[0].end - offset
      myChart.dispatchAction({
        type: 'dataZoom',
        start: newStart,
        end: newEnd
      })
    }
  }

  function getDistance(touch1, touch2) {
    const deltaX = touch1.clientX - touch2.clientX
    const deltaY = touch1.clientY - touch2.clientY
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }
  let timer1 = null
  function handleTouchEnd(event) {
    clearTimeout(timer1)
    timer1 = setTimeout(() => {
      event.preventDefault()
      startTouches = [] // 清空双指的初始位置
    }, 20)
  }
}
