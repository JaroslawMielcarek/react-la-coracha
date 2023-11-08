import "./Tabs.css"
import { useState } from "react"

export const Tab = ({isActive, label, children}: {isActive?: boolean, label: string, children: JSX.Element | JSX.Element[]}) => {
  const klass = isActive ? "tab active" : "tab"
  return (
    <div className={ klass }>
      { children }
    </div>
  )
}

export const Tabs = ({children}: { children: JSX.Element[]}) => {
  const [activeTab, setActiveTab] = useState(children[0].props.label || null)

  const generateTabLabels = () => {
    return children.map(t => {
      const label = t.props?.label
      const klass = label === activeTab ? "tab-title active": "tab-title"
      return <li className={ klass } key={label} onClick={() => setActiveTab(label)}>{ label }</li>
      }
    )
  }
  const renderSelectedTabContent = () => children.find(c => c.props.label === activeTab)

  return (
    <div>
      <ul className="tabs-header">
        { generateTabLabels() }
      </ul>
      {renderSelectedTabContent()}
    </div>
  )
}