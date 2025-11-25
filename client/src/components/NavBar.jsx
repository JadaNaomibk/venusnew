// src/components/NavBar.jsx
// Simple navigation bar for the four main pages.

import { NavLink } from 'react-router-dom'

function NavBar() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="nav-brand">
          venus
        </NavLink>

        <div className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              'nav-link' + (isActive ? ' nav-link-active' : '')
            }
          >
            home
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              'nav-link' + (isActive ? ' nav-link-active' : '')
            }
          >
            dashboard
          </NavLink>
          <NavLink
            to="/insights"
            className={({ isActive }) =>
              'nav-link' + (isActive ? ' nav-link-active' : '')
            }
          >
            insights
          </NavLink>
          <NavLink
            to="/auth"
            className={({ isActive }) =>
              'nav-link' + (isActive ? ' nav-link-active' : '')
            }
          >
            sign in
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
