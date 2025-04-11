import React, { useState, useEffect } from "react";
import { fetchExpenses, addExpenseToTrip , updateExpense,deleteExpense } from "../controllers/tripController";
import "../styles/Expense.css";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(localStorage.getItem("currentTripId"));
  const [editingExpense, setEditingExpense] = useState(null);


  useEffect(() => {
    const loadExpenses = async () => {
      if (selectedTrip) {
        const tripExpenses = await fetchExpenses(selectedTrip);
        setExpenses(tripExpenses);
      }
    };
    loadExpenses();
  }, [selectedTrip]);

  const handleAddExpense = async () => {
    if (!name || !category || !amount ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await addExpenseToTrip(selectedTrip, name, category, parseFloat(amount));
      alert("Expense added successfully!");
      setName("");
      setCategory("");
      setAmount("");
      const updatedExpenses = await fetchExpenses(selectedTrip);
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setName(expense.name);
    setCategory(expense.category);
    setAmount(expense.amount);
  
    // ✅ Show the form
    const form = document.getElementById("expenseForm");
    if (form) {
      form.style.display = "block";
    }
  };
  
  
  const handleUpdateExpense = async () => {
    try {
      await updateExpense(selectedTrip, editingExpense.id, { name, category, amount: parseFloat(amount) });
      alert("Expense updated!");
      setEditingExpense(null);
      setName("");
      setCategory("");
      setAmount("");
      const updatedExpenses = await fetchExpenses(selectedTrip);
      setExpenses(updatedExpenses);
    } catch (err) {
      console.error("Error updating expense:", err);
    }
  };
  
  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(selectedTrip, expenseId);
        const updatedExpenses = await fetchExpenses(selectedTrip);
        setExpenses(updatedExpenses);
      } catch (err) {
        console.error("Error deleting expense:", err);
      }
    }
  };
  

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const filteredExpenses = expenses.filter(expense =>
    expense.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="expenses-container">
      <h2>Expenses</h2>

      <input
        type="text"
        className="search-bar"
        placeholder="Search expenses..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="total-expense">
      <h3>Total Spent: ${totalExpenses.toFixed(2)}</h3>


      </div>

      <button onClick={() => document.getElementById("expenseForm").style.display = "block"}>+ Add Expense</button>

      <div id="expenseForm" style={{ display: "none" }}>
      <input type="text" placeholder="Expense Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="number" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} />   
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
          <option value="Hotel">Hotel</option>
          <option value="Activity">Activity</option>
          <option value="Flight">Flight</option>
          <option value="Flight">Other</option>

        </select>
        <button onClick={editingExpense ? handleUpdateExpense : handleAddExpense}>
          {editingExpense ? "Update Expense" : "Save Expense"}
        </button>

      </div>

      <div className="expense-list">
        {filteredExpenses.map((expense) => (
          <div key={expense.id} className="expense-card">
            <span className="expense-name">{expense.name}</span>
            <span className="expense-category">{expense.category}</span>
            <span className="expense-amount">${Number(expense.amount || 0).toFixed(2)}</span>
            <button onClick={() => handleEditExpense(expense)}>📝</button>
            <button onClick={() => handleDeleteExpense(expense.id)}>🗑️</button>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Expenses;
