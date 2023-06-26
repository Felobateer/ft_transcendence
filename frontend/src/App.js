import React, { useState } from "react";
import './App.css';
import { Register } from './pages/Register'
import { Login } from './pages/Login'

function App() {
  const [currentForm, setCurrentForm] = useState('login');

	const toggleForm = (formName) => {
		setCurrentForm(formName);
	}

  return (
    <div className="App">
			{
				currentForm === "login" ? <Login onFormSwitch={toggleForm} /> : <Register onFormSwitch={toggleForm} />
			}
    </div>
  );
}

export default App;
