import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="logo">
        OmniRetail
      </div>

      <div className="location">
        📍 Chennai
      </div>

      <button className="login-btn">
        Login
      </button>
    </header>
  );
}

export default Header;