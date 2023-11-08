import './CustomToolTip.css'
import { useEffect, useState } from "react"
import { TToolTipArguments } from 'types'

export default function CustomToolTip ({text = 'Not provided', duration = 4000, delay = 1000, direction = 'bottom'}: TToolTipArguments) {

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout( () => {
      setIsOpen(true)
      const p = setTimeout( () => { 
        setIsOpen(false)
        clearTimeout(p)
      }, duration)
      clearTimeout(t)
    }, delay)
  },[delay, duration])

  

  return (
    <div className={'tooltip ' + ( isOpen ? 'open ' : '' ) + direction}>
      <span className="tooltip__text">{ text }</span>
    </div>
  )
}