import "./Modal.css"

type TProps = {
  onClose: Function,
  children: React.ReactNode
}


export default function Modal (props: TProps) {

  return (
    <div id="modal-wrapper">
      <div id="modal">
        <span className="close" onClick={() => props.onClose() }></span>
        { props.children }
      </div>
    </div>
  )
}