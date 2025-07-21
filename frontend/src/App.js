import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GenbaForm from './pages/GenbaForm';
import SuggestionForm from './pages/SuggestionForm';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/genba-form" element={<GenbaForm />} />
            <Route path="/suggestion-form" element={<SuggestionForm />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;