import React from 'react';
import './App.css';
import axios from "axios";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import UserComponent from "./components/UserComponent";
import AnimalComponent from "./components/AnimalComponent";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./components/HomePage";
function App() {

  axios.defaults.baseURL = 'https://inqool-interview-api.vercel.app/api';
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage type="home"/>}/>
          <Route path="/users" element={<HomePage type="user" children={<UserComponent/>}/>} />
          <Route path="/animals" element={<HomePage type="animal" children={<AnimalComponent/>}/>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
