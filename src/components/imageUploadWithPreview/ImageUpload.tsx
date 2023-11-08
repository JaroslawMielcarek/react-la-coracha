import "./ImageUpload.css"
import uploadSVG from "../../assets/images/upload.svg"
import { isEmpty } from "utils/object"
import { useContext, useEffect } from "react"
import { NotificationContext } from "components/notification/useNotificationState"
import { FormContext } from "components/form/useFormState"

interface  IImage {
  contentType: string,
  data: string
}

export function ImagePreview <T extends IImage | File>({image, onClick}: {image: T , onClick?: Function}) {

  const getSrc = () => {
    if ( image instanceof File ) return URL.createObjectURL(image)
    if ( !image.contentType || !image.data ) return ''
    return `data:${image.contentType || ""};base64,${image.data || ""}`
  }
  return (
    <div className="image-wrapper">
      <img className="sponsor-logo" src={ getSrc() } alt="team logo"/>
      { onClick && <button className="btn color red" onClick={ () => onClick(null) }>x</button> }
    </div>
  )
}
type TImagePreviewWithFormProps = {
  name: string,
  label?: string,
  onClick?: Function,
  validators?: Function[]
}

export const ImagePreviewWithForm = (props: TImagePreviewWithFormProps) => {
  const { formState, setFieldValue, registerInput } = useContext(FormContext)

  useEffect(() => {
    if (props.validators) registerInput(props.name, props.validators)
  },[props.validators, props.name, registerInput])

  const onClick = (val: IImage | File) => {
    if (props.onClick) return props.onClick(props.name, val)
    setFieldValue(props.name, val)
  }
  const inputValue = formState.data[props.name] as IImage | File

  return (
    <div className="form-group">
      {props.label && <label>{props.label}</label> }
      <ImagePreview image={ inputValue } onClick={ onClick }/>
    </div>
  )
}



type TFileUploadProps = {
  text?: string
  file?: File | null,
  sizeLimit?: number,
  canAccept?: string,
  onChange: Function
}


export const FileUpload = ({text = "FILE", file, sizeLimit = 200000, canAccept = "image/jpg, image/png", onChange}: TFileUploadProps) => {
  const { setNotification } = useContext(NotificationContext)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files ? e.target.files[0] : null
    if (!f) return
    if (f?.size > sizeLimit ) {
      return setNotification("File Upload", "File Upload", "We could not upload your file", "attention")
    }
    const reader = new FileReader()
    reader.readAsDataURL(f)
    reader.onload = () => {
      const data = reader.result ? reader.result.toString().split(",")[1] : ""
      if (data) onChange( {data: data, contentType: f.type} )
    }
  }

  return (
    <div>
      <label className="uploadFile">
        <input type="file" onChange={ handleFileUpload } accept={ canAccept } multiple={ false }/>
        <img src={ uploadSVG } alt="Upload"/>
        { !file || isEmpty(file) ? `Upload ${text}` : file.name}
      </label>
      <p className="extra-message">max: { sizeLimit/8000 }kb</p>
    </div>
  )
}

type TFileUploadWithFormProps = {
  name: string,
  label?: string,
  onChange?: Function,
  validators?: Function[],
  sizeLimit?: number
}

export const FileUploadWithForm = (props: TFileUploadWithFormProps ) => {
  const { formState, setFieldValue, registerInput } = useContext(FormContext)

  useEffect(() => {
    if (props.validators) registerInput(props.name, props.validators)
  },[props.validators, props.name, registerInput])

  const onChange = (val: File) => {
    if (props.onChange) return props.onChange(props.name, val)
    setFieldValue(props.name, val)
  }
  const inputValue = formState.data[props.name] as File

  return (
    <div className="form-group">
      {props.label && <label>{props.label}</label> }
      <FileUpload file={ inputValue } onChange={ onChange } sizeLimit={ props?.sizeLimit }/>
    </div>
  )
}