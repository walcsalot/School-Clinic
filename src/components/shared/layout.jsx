import Sidebar from "./sidebar"
import "../../Css/layout.css"

const Layout = ({ children, userRole }) => {
  return (
    <div className="layout">
      <Sidebar userRole={userRole} />
      <main className="content">{children}</main>
    </div>
  )
}

export default Layout
