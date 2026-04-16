//import './App.css'
import axios from "axios";
import AppRouter from './router';
axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

export default function App() {
  return (
    <>
      <AppRouter />
    </>
  )
}