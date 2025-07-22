import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import GenbaForm from './pages/GenbaForm';
import SuggestionForm from './pages/SuggestionForm';
import SearchHistory from './pages/SearchHistory';
import Login from './pages/Login';
import Header from './components/Header';
import Footer from './components/Footer';

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isLoginPage && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/genba-form" element={<GenbaForm />} />
          <Route path="/suggestion-form" element={<SuggestionForm />} />
          <Route path="/search-history" element={<SearchHistory />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;