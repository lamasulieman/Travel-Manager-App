import React, { useState } from "react";
import "../styles/Expense.css";

const Expenses = () => {
  // Sample hardcoded expenses (Later, these will be dynamic)
  const [expenses, setExpenses] = useState([
    { id: 1, category: "Flight", name: "Budapest to Rome", amount: 120, date: "2025-06-10" },
    { id: 2, category: "Hotel", name: "Hilton Rome - 2 Nights", amount: 250, date: "2025-06-10" },
    { id: 3, category: "Food", name: "Dinner at Trastevere", amount: 50, date: "2025-06-11" },
    { id: 4, category: "Activity", name: "Colosseum Tour", amount: 30, date: "2025-06-12" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Filter expenses based on search query
  const filteredExpenses = expenses.filter(expense =>
    expense.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="expenses-container">
      <h2>Expenses </h2>

      {/* Search Bar */}
      <input
        type="text"
        className="search-bar"
        placeholder="Search expenses..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Total Expenses */}
      <div className="total-expense">
        <h3>Total Spent: ${totalExpenses}</h3>
      </div>

      {/* Expense List */}
      <div className="expense-list">
        {filteredExpenses.map((expense) => (
          <div key={expense.id} className="expense-card">
            <span className="expense-name">{expense.name}</span>
            <span className="expense-category">{expense.category}</span>
            <span className="expense-amount">${expense.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Expenses;
