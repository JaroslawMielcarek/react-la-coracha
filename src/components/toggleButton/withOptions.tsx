import { useError } from "utils/useErrors";


type WithOptionsPropsType = {
  name: string,
  label?: string,
  className: string,
  errors: string[],
  value?: string | number,
  onChange?: Function
  options?: string[]
  children?: React.ReactNode
}
export default function withOptions(InputComponent: any) {
  const WrappedWithOptions = (props: WithOptionsPropsType) => {
    const { renderErrors, hasError } = useError({errors: props.errors, name: props.name})

    const renderOptions = () => {
      if (!props.options) return <p>There is no options!</p>

      console.log({props})
      return props.options.map((o, index) => (
        <InputComponent
        { ...props }
        isActive={ o === props.value }
        key={ index }>
          { props.children }
        </InputComponent>
      ))
    }

    let klass = "form-group "
    if (props.className) klass += ' ' + props.className
    if (hasError) klass += " has-error"

    return (
      <fieldset className={klass}>
        <legend>{props.label}</legend>
        {renderErrors()}
        <div className="options">
          {renderOptions()}
        </div>
      </fieldset>
    );
  };

  return WrappedWithOptions;
};
