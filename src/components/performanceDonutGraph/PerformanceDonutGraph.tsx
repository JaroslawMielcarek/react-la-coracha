import { useState } from "react"
import './PerformanceDonutGraph.css'
import { IvoleyStats, IabititiStat, IgraphElement, IgraphLegend, Idata, Istat } from "shared/types"


export default function PerformanceDonutGraph({ stats }: {stats: IvoleyStats | undefined}){
  const settings = { centerX: 125, centerY: 125, radius: 100, strokeWidth: 20 }

  const [includePrevious, setIncludePrevious] = useState(false)

  const data = (stats) ? stats : null

  const abilityColor = (ability: string): string => {
    const abi: [string, string][] = [
      ['attack-good', '#F6BB42'], ['attack-bad', '#b2811f'],
      ['recieve-good', '#8CC152'], ['recieve-bad', '#689e2d'],
      ['set-good', '#3BAFDA'], ['set-bad', '#1d83a8'],
      ['block-good', '#967ADC'], ['block-bad', '#6142af',],
      ['serve-good', '#DA4453'], ['serve-bad', '#a6222f']
    ]
    const r = new Map(abi).get(ability)
    return r !== undefined ? r : '#fff'
  }
  function flaterData(data: IvoleyStats | null, isCurrent: boolean): Idata[] {
    if (data == null ) return []
    return Object.entries(data).map(([key, value]: [string, IabititiStat]) => ({ key: key, value: isCurrent ? value.current : value.prev }))
  }

  function svgElement (ele: IgraphElement) {
    switch(ele.type){
      case 'circle': return ( <circle onMouseEnter={() => hovered(ele.key) } onMouseLeave={() => hovered(ele.key) }
      id={ ele.id } stroke={ ele.stroke } strokeWidth={ ele.strokeWidth } fill='none'
      xmlns='http://www.w3.org/2000/svg' cx={ ele.cx } cy={ ele.cy } r={ ele.r }/> )
      case 'path': return ( <path onMouseEnter={ () => hovered(ele.key)} onMouseLeave={ () => hovered(ele.key) } id={ ele.id }
      stroke={ ele.stroke } strokeWidth={ ele.strokeWidth } fill='none' xmlns='http://www.w3.org/2000/svg'
      d={ ele.d } /> )
    }
  }

  const graphs = () => {
    const { centerX, centerY, radius, strokeWidth } = settings
    const graphList: IgraphElement[][] = []

    if (data == null) return graphList

    const currData = flaterData(data, true)
    if (!currData.length) return graphList
    graphList.push(generateGraph(currData, centerX, centerY, radius, strokeWidth, false))

    if (includePrevious) {
      const prevData = flaterData(data, false)
      if (prevData.length) graphList.push(generateGraph(prevData, centerX, centerY, radius - (strokeWidth * 2), strokeWidth, true))
    }
    if (!graphList.length) return <p>No hay estadísticas disponibles</p>
    return (
      <div className="donut-wrapper">
        { graphList.map((graph, index) => (
          <svg xmlns="http://www.w3.org/2000/svg" key={ index }>
            { graph.map(ele => (
              <g key={ ele.id }>
                { svgElement(ele) }
              </g>
            ))}
          </svg>
        ))}
      </div>
    )
  }

  const legend = () => {
    if (data == null) return []

    const currData = flaterData(data, true)
    const leg = generateLegend(currData)

    if (includePrevious) {
      const prevData: Idata[] = flaterData(data, false)
      leg.map((e, index) => {
        return e.value = e.value.reduce((accum, curr) => {
          accum.push(curr)
          accum.push({ key: curr.key + '-prev', val: prevData[index].value[curr.key as keyof Istat] })
          return accum
        }, [] as { key: string; val: number; color?: string; }[])
      })
    }

    if (!leg.length) return null
    return (
      <div className="legend">
        <div className="stat">
          <label className="prev">Prev<input type="checkbox" onChange={ () => setIncludePrevious(!includePrevious) }/></label>
          <p>Good</p>
          { includePrevious && <p className="prev">prev</p> }
          <p>Bad</p>
          { includePrevious && <p className="prev">prev</p> }
          <p>Total</p>
          { includePrevious && <p className="prev">prev</p> }
        </div>
        { leg.map(ele => (
          <div className="stat" key={ ele.key }>
            <label>{ ele.key }</label>
            { ele.value.map(e => (
              <p className={ e.key.includes('-prev') ? 'prev': '' } style={ {color: e.color} }
                onMouseEnter={ () => hovered(ele.key + '-' + e.key + '-graph') }
                onMouseLeave={ () => hovered(ele.key + '-' + e.key + '-graph') }
                id={ ele.key + '-' + e.key }
                key={ ele.key + '-' + e.key }>
                { e.val }
                </p>
            ))
            }
          </div>
          ))
        }
      </div>
    )
  }

  const generateLegend = (data: Idata[]): IgraphLegend[] => {
    const legend: IgraphLegend[] = []
    const abi = ['good', 'bad', 'total']
    if (!data.length) return legend

    return data.map((e) => {
      const v = abi.reduce((accum, curr) => {
        (curr === 'total')
          ? accum.push({ key: curr, val: e.value[curr as keyof Istat] })
          : accum.push({ key: curr, val: e.value[curr as keyof Istat], color: abilityColor(e.key + '-' + curr) })
        return accum
      }, [] as { key: string; val: number; color?: string; }[])

      return {
        key: e.key,
        value: v
      }
    })
  }

  const generateGraph = (data: Idata[], centerX: number, centerY: number, radius: number, strokeWidth: number, isPrev: boolean) => {
    const graph: IgraphElement[] = []

    if (!data.length) return graph

    const totalCumulative = data.reduce((accum, curr) => accum += curr.value.total, 0);

    let count = 0
    let beg = 0
    let end = 0
    data.map((e, index) => {
      const { total, ...val } = e.value

      return Object.entries(val).map(([key, pr]) => {
        let percent = 0
        if (totalCumulative !== 0) percent = roundToDecimals(((pr) / totalCumulative) * 100)

        count = roundToDecimals(count + percent)
        if ((index === data.length) && (count < 100)) percent += (100 - count)

        end = roundToDecimals(beg + ((360 / 100) * percent))

        const element = createElement({ key: e.key + '-' + key, value: pr }, beg, end, { x: centerX, y: centerY }, radius, strokeWidth, isPrev)
        if (element) graph.push(element)

        return beg = end
      })
    })
    return graph
  }

  function arcRadius(cx: number, cy: number, radius: number, degrees: number) {
    const radians = (degrees - 90) * Math.PI / 180.0;
    return { x: cx + (radius * Math.cos(radians)), y: cy + (radius * Math.sin(radians)) }
  }

  function createElement(data: { key: string, value: number }, beg: number, end: number, c: { x: number, y: number }, radius: number, strokeWidth: number = 50, isPrev: boolean = false): IgraphElement | null {
    const id = `${data.key}${isPrev ? '-prev' : ''}-graph`

    if (end === 0) return null

    const newElement = { key: data.key + (isPrev ? '-prev' : ''), id: id, stroke: abilityColor(data.key), strokeWidth: strokeWidth }

    if (beg === 0 && end === 360) return { ...newElement, type: 'circle', cx: c.x, cy: c.y, r: radius }

    const b = arcRadius(c.x, c.y, radius, end)
    const e = arcRadius(c.x, c.y, radius, beg)
    const la = (end - beg) <= 180 ? 0 : 1
    return {
      ...newElement,
      type: 'path',
      d: `M ${roundToDecimals(b.x)} ${roundToDecimals(b.y)} A ${radius} ${radius} 0 ${la} 0 ${roundToDecimals(e.x)} ${roundToDecimals(e.y)}`
    }
  }
  function roundToDecimals(x: number): number {
    return Math.round((x + Number.EPSILON) * 100) / 100
  }

  function hovered(id: string) {
    const ele = document.getElementById(id)
    if (ele) ele.classList.toggle('selected')
  }

  return (
    <div className="graph">
      <h4>Rendimiento</h4>
      { legend() }
      { graphs() }
    </div>
  )
}