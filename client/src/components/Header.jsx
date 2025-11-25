// client/src/components/Header.jsx
import { NavLink } from 'react-router-dom';

function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <span className="logo">venus</span>
        <nav className="main-nav">
          <NavLink to="/" end>
            home
          </NavLink>
          <NavLink to="/dashboard">dashboard</NavLink>
          <NavLink to="/profile">profile</NavLink>
          <NavLink to="/auth">auth</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
