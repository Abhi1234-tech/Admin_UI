import React, { useState, useEffect } from "react";
import "./styles.css";

const items_in_pages = 10;

const App = () => {
  const [usersData, setUsersData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Fetch data from API
    fetch(
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setUsersData(data);
      });
  }, []);

  useEffect(() => {
    // Filter data based on search term
    const filteredUsers = usersData.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filteredUsers);
    setCurrentPage(1); // Reset page to 1 when the search term changes
  }, [usersData, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCheckboxChange = (e, id) => {
    if (e.target.checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const handleSelectAllRows = (e) => {
    if (e.target.checked) {
      const allRowIds = filteredData
        .slice((currentPage - 1) * items_in_pages, currentPage * items_in_pages)
        .map((user) => user.id);
      setSelectedRows(allRowIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleDeleteSelected = () => {
    const remainingRows = filteredData.filter(
      (user) => !selectedRows.includes(user.id)
    );
    setFilteredData(remainingRows);
    setSelectedRows([]);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = (id) => {
    // Find the user with the given ID from filteredData
    const userToEdit = filteredData.find((user) => user.id === id);
    if (userToEdit) {
      // Toggle "Role" between "member" and "Admin"
      const updatedRole = userToEdit.role === "member" ? "Admin" : "member";
      const updatedData = filteredData.map((user) =>
        user.id === id ? { ...user, role: updatedRole } : user
      );
      setFilteredData(updatedData);
    }
  };

  const handleDelete = (id) => {
    // Filter out the user with the given ID from filteredData
    const updatedData = filteredData.filter((user) => user.id !== id);
    setFilteredData(updatedData);
    setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
  };

  const renderRows = () => {
    const startIndex = (currentPage - 1) * items_in_pages;
    const endIndex = currentPage * items_in_pages;
    return filteredData.slice(startIndex, endIndex).map((user) => (
      <tr
        key={user.id}
        className={selectedRows.includes(user.id) ? "selected" : ""}
      >
        <td>
          <input
            type="checkbox"
            checked={selectedRows.includes(user.id)}
            onChange={(e) => handleCheckboxChange(e, user.id)}
          />
        </td>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{user.role}</td>
        <td>
          <button onClick={() => handleEdit(user.id)}>Edit</button>
          <button onClick={() => handleDelete(user.id)}>Delete</button>
        </td>
      </tr>
    ));
  };

  const renderPaginationButtons = () => {
    const totalPages = Math.ceil(filteredData.length / items_in_pages);
    const pageButtons = [];

    const handleFirstPage = () => setCurrentPage(1);
    const handlePreviousPage = () =>
      setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    const handleNextPage = () =>
      setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    const handleLastPage = () => setCurrentPage(totalPages);

    pageButtons.push(
      <button
        key="first"
        onClick={handleFirstPage}
        disabled={currentPage === 1}
      >
        {"<<"}
      </button>
    );
    pageButtons.push(
      <button
        key="prev"
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
      >
        {"<"}
      </button>
    );

    for (let i = 1; i <= totalPages; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={i === currentPage ? "active" : ""}
        >
          {i}
        </button>
      );
    }

    pageButtons.push(
      <button
        key="next"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        {">"}
      </button>
    );
    pageButtons.push(
      <button
        key="last"
        onClick={handleLastPage}
        disabled={currentPage === totalPages}
      >
        {">>"}
      </button>
    );

    return (
      <div className="pagination-container">
        <div className="pagination-buttons">
          {pageButtons.map((button) => button)}
        </div>
      </div>
    );
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, email, or role"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: "70%", borderRadius: "5px" }}
        />
        <button onClick={handleDarkModeToggle} className="darkorlight">
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>
              <input type="checkbox" onChange={handleSelectAllRows} />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </table>
      {renderPaginationButtons()}
      <div className="delete-selected-container">
        {selectedRows.length > 0 && (
          <button onClick={handleDeleteSelected}>Delete Selected</button>
        )}
      </div>
    </div>
  );
};

export default App;
