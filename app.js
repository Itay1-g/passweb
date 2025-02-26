import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const categories = ["Food", "Transport", "Entertainment", "Rent", "Utilities", "Shopping", "Health", "Education", "Travel", "Others"];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6B6B", "#6BFFB3", "#DFFF00", "#FF007F", "#A0A0A0"];

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState(0);
  const [warning, setWarning] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const addExpense = () => {
    if (!amount || !date || (category === "Others" && !customCategory)) return;
    if (parseFloat(amount) > budget * 0.5) {
      setWarning("Warning: This expense is over 50% of your budget!");
    } else {
      setWarning("");
    }
    const finalCategory = category === "Others" ? customCategory : category;
    setExpenses([...expenses, { amount: parseFloat(amount), category: finalCategory, date }]);
    setAmount("");
    setCustomCategory("");
  };

  const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  
  const categorizedExpenses = expenses.reduce((acc, exp) => {
    const found = acc.find(e => e.name === exp.category);
    if (found) {
      found.value += exp.amount;
    } else {
      acc.push({ name: exp.category, value: exp.amount });
    }
    return acc;
  }, []);

  const expenseTrends = expenses.map(exp => ({ date: exp.date, amount: exp.amount }));

  // Dynamic budget advice based on spending
  let budgetAdvice;
  let budgetColor;

  if (totalSpent > budget) {
    budgetAdvice = "You're over budget! Consider cutting back on expenses.";
    budgetColor = "text-red-600"; // Bad
  } else if (totalSpent > budget * 0.8) {
    budgetAdvice = "You're close to your budget limit, keep an eye on your spending!";
    budgetColor = "text-yellow-600"; // Okay
  } else if (totalSpent > budget * 0.5) {
    budgetAdvice = "You're managing your budget well!";
    budgetColor = "text-lightgreen"; // Good
  } else {
    budgetAdvice = "Great job! You're well within your budget!";
    budgetColor = "text-green-600"; // Very Good
  }

  // AI assistant interaction
  const handleAiSubmit = () => {
    if (aiInput.trim()) {
      const userQuestion = aiInput.toLowerCase();
      let response = "I'm here to help!";

      if (userQuestion.includes("budget")) {
        response = "Make sure your expenses don't exceed your budget!";
      } else if (userQuestion.includes("tips")) {
        response = "Track your expenses regularly to stay within your budget.";
      } else if (userQuestion.includes("help")) {
        response = "How can I assist you with your budgeting?";
      } else {
        response = "I'm not sure how to answer that. Try asking about budget tips or general help!";
      }

      setAiResponse(response);
      setAiInput(""); // Clear input after submission
    }
  };

  return (
    <div className={`p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <Button onClick={() => setDarkMode(!darkMode)} className="mb-2 px-2 py-1 text-sm">Toggle Dark Mode</Button>
      <Card className="p-4 bg-blue-100">
        <h2 className="text-xl font-bold text-blue-900">Monthly Budget</h2>
        <Input type="number" placeholder="Set Budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="border-blue-500" />
        <p className={`mt-2 font-semibold ${budgetColor}`}>
          {totalSpent > budget ? `In Debt: $${(totalSpent - budget).toFixed(2)}` : `Remaining: $${(budget - totalSpent).toFixed(2)}`}
        </p>
        <p className={`mt-2 font-semibold ${budgetColor}`}>{budgetAdvice}</p>
      </Card>

      <Card className="p-4 bg-green-100">
        <h2 className="text-xl font-bold text-green-900">Add Expense</h2>
        {warning && <p className="text-red-600 font-semibold">{warning}</p>}
        <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="border-green-500" />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min="2025-01-01" max="2025-12-31" className="mt-2 border-green-500" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 border-green-500">
          {categories.map(cat => <option key={cat}>{cat}</option>)}
        </select>
        {category === "Others" && <Input type="text" placeholder="Specify Category" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="mt-2 border-green-500" />}
        <Button onClick={addExpense} className="mt-2 bg-green-500 hover:bg-green-700 text-white">Add Expense</Button>
      </Card>

      {/* Switch the positions of Expense Distribution and Expense Trends */}
      <Card className="p-4 bg-purple-100 col-span-2">
        <h2 className="text-xl font-bold text-purple-900">Expense Trends</h2>
        <LineChart width={500} height={300} data={expenseTrends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#8884d8" />
        </LineChart>
      </Card>

      <Card className="p-4 bg-green-100 col-span-1">
        <h2 className="text-xl font-bold text-green-900">Expense Distribution</h2>
        <PieChart width={300} height={200}>
          <Pie data={categorizedExpenses} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
            {categorizedExpenses.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Card>

      <Card className="p-4 bg-gray-100 col-span-2">
        <h2 className="text-xl font-bold text-gray-900">Expense Table</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((exp, index) => (
              <TableRow key={index}>
                <TableCell>{exp.date}</TableCell>
                <TableCell>{exp.category}</TableCell>
                <TableCell>${exp.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* New AI Box */}
      <Card className="p-4 bg-yellow-100 col-span-1">
        <h2 className="text-xl font-bold text-yellow-900">AI Assistant</h2>
        <Input
          type="text"
          placeholder="Ask me something..."
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAiSubmit()} // Submit on Enter key press
          className="border-yellow-500"
        />
        <Button onClick={handleAiSubmit} className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white">Ask</Button>
        {aiResponse && <p className="mt-2 text-gray-700">{aiResponse}</p>}
      </Card>
    </div>
  );
}
