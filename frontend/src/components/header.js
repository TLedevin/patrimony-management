import "./header.css";

function Header({ HeaderTitle }) {
  return (
    <div className="header">
      <h1>{HeaderTitle}</h1>
    </div>
  );
}

export default Header;
