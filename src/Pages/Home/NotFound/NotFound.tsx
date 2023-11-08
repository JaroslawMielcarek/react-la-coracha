import "./NotFound.css"
import { missedBall } from "assets/images/missedBall"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

export default function NotFound() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setIsVisible(true)
      clearTimeout(t)
    }, 2000);
  },[])

  const klass = isVisible ? "link visible" : "link"
  
  return (
    <div>
      <div id="court">
        { missedBall }
      </div>
      <div className="half-right">
        <h1 className="big__text">404</h1>
        <h3 className="sub__text">Casi fue donde querías. Vaya a la página de inicio y vuelva a intentarlo</h3>
        <Link to='/' className={ klass }><button className= 'btn color full-width'>Vamos a empezar de nuevo</button></Link>
      </div>
    </div>
  )
}