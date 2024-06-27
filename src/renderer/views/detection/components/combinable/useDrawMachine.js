import { _public } from '@renderer/utils/common'
import { ref } from 'vue'

export const useDrawMachine = (
  axisSensorList,
  selectedSensor,
  img,
  ponitImg,
  disabledPointImg,
  axisImg
) => {
  // 已经绘制的矩形，记录矩形的坐标和宽高
  const drawedRect = ref([])
  // 绘制机床模型
  const drewMachine = () => {
    const canvas = document.getElementById('machine')
    canvas.style.cursor = 'pointer'
    const width = _public.screenPx(571)
    const height = _public.screenPx(600)
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height)
      axisSensorList.value.forEach((item, index) => {
        drawAxisAndPoint(ctx, item, index)
      })
    }
    if (img) {
      ctx.drawImage(img, 0, 0, width, height)
      axisSensorList.value.forEach((item, index) => {
        drawAxisAndPoint(ctx, item, index)
      })
    }
    canvas.onclick = handleCtxClick
  }
  // 绘制坐标轴和点
  const drawAxisAndPoint = (ctx, item, index) => {
    const { x, y, checked } = item
    const data = ctx.getImageData(x, y, 1, 1).data
    // 判断是否点击到机床
    if (data[3] !== 255) {
      return
    }
    const pImg = checked ? ponitImg : disabledPointImg
    const axisWidth = _public.screenPx(176)
    const axisHeight = _public.screenPx(156)
    const axisY = _public.screenPx(146)
    const pointWidth = _public.screenPx(62)
    const pointHeight = _public.screenPx(62)
    const roundWidth = _public.screenPx(136)
    const roundHeight = _public.screenPx(61)
    const roundX = _public.screenPx(68)
    const radio = _public.screenPx(8)
    const fontSize = _public.screenPx(24)
    const fontY = _public.screenPx(71)
    const text = item.label || ''
    ctx.drawImage(axisImg, x, y - axisY, axisWidth, axisHeight)
    ctx.drawImage(pImg, x - pointWidth / 2, y - pointHeight / 2, pointWidth, pointHeight)
    if (checked) {
      ctx.strokeStyle = 'rgb(65, 180, 207)'
      ctx.beginPath()
      const roundRect = ctx.roundRect(
        x - roundX,
        y + roundHeight / 2,
        roundWidth,
        roundHeight,
        radio
      )
      ctx.fillStyle = 'rgb(26, 29, 44)'
      ctx.lineWidth = 2
      ctx.fill(roundRect)
      ctx.stroke()
      ctx.closePath()
    } else {
      ctx.strokeStyle = 'rgb(129, 137, 146)'
      ctx.beginPath()
      const roundRect = ctx.roundRect(
        x - roundX,
        y + roundHeight / 2,
        roundWidth,
        roundHeight,
        radio
      )
      ctx.fillStyle = 'rgb(26, 29, 44)'
      ctx.lineWidth = 2
      ctx.fill(roundRect)
      ctx.stroke()
      ctx.closePath()
    }
    // 给绘制的矩形添加文字
    ctx.font = fontSize + 'px AlibabaPuHuiTi'
    ctx.fillStyle = 'rgb(65, 180, 207)'
    ctx.textAlign = 'center'
    ctx.fillText(text, x, y + fontY)
    drawedRect.value.push({
      x: x - roundX,
      y: y + roundHeight / 2,
      width: roundWidth,
      height: roundHeight,
      index
    })
  }
  const handleCtxClick = e => {
    const x = e.offsetX
    const y = e.offsetY
    if (drawedRect.value.length) {
      const rect = drawedRect.value.find(item => {
        return x > item.x && x < item.x + item.width && y > item.y && y < item.y + item.height
      })
      if (rect) {
        axisSensorList.value.forEach((item, index) => {
          if (index === rect.index) {
            item.checked = !item.checked
          } else {
            item.checked = false
          }
          if (item.checked) {
            item.label = selectedSensor.value.label
          } else {
            item.label = ''
          }
        })
        drewMachine()
      }
    }
  }
  return { drewMachine }
}
