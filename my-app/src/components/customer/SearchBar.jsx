import "./SearchBar.css";

function SearchBar() {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search restaurants, food..."
        className="search-input"
      />

      <button className="search-btn">
        Search
      </button>
    </div>
  );
}

export default SearchBar;