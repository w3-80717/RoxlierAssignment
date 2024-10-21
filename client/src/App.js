import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BarChart from './BarChart';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [itemRanges, setItemRanges] = useState([]);
  const [month, setMonth] = useState('March');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchItemRanges();
  }, [month, search, page]);

  const fetchTransactions = async () => {
    const response = await axios.get(`http://localhost:8080/api/transactions`, {
      params: {
        month: getMonthNumber(month),
        search,
        page,
        limit,
      },
    });
    setTransactions(response.data);
  };

  const fetchStatistics = async () => {
    const response = await axios.get(`http://localhost:8080/api/statistics`, {
      params: {
        month: getMonthNumber(month),
      },
    });
    setStatistics(response.data);
  };

  const fetchItemRanges = async () => {
    const response = await axios.get(`http://localhost:8080/api/item_range`, {
      params: {
        month: getMonthNumber(month),
      },
    });
    setItemRanges(response.data);
  };

  const getMonthNumber = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(month) + 1;
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handlePreviousPage = () => {
    setPage(page - 1);
  };

  return (
    <div>
      <h1>Transactions</h1>
      <select value={month} onChange={handleMonthChange}>
        <option value="January">January</option>
        <option value="February">February</option>
        <option value="March">March</option>
        <option value="April">April</option>
        <option value="May">May</option>
        <option value="June">June</option>
        <option value="July">July</option>
        <option value="August">August</option>
        <option value="September">September</option>
        <option value="October">October</option>
        <option value="November">November</option>
        <option value="December">December</option>
      </select>
      <input
        type="search"
        value={search}
        onChange={handleSearchChange}
        placeholder="Search transactions"
      />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Price</th>
            <th>Description</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Date of Sale</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.id}</td>
              <td>{transaction.title}</td>
              <td>{transaction.price}</td>
              <td>{transaction.description}</td>
              <td>{transaction.category}</td>
              <td>{transaction.sold ? 'Yes' : 'No'}</td>
              <td>{transaction.dateOfSale}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handlePreviousPage}>Previous</button>
      <button onClick={handleNextPage}>Next</button>
      <h2>Statistics</h2>
      <p>Total Sales: {statistics.total_price}</p>
      <p>Total Sold Items: {statistics.sold_quantity}</p>
      <p>Total Not Sold Items: {statistics.not_sold_quantity}</p>
      <h2>Item Ranges</h2>
      <BarChart data={itemRanges} />
    </div>
  );
}

export default App;