import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';
import './styles/App.css';

function App() {
  const router = createBrowserRouter(routes); //comment

  return <RouterProvider router={router} />;
}

export default App;
