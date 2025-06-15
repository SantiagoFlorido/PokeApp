import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Pokedex from './pages/Pokedex'
import PokemonId from './pages/PokemonId';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Pokedex" element={<Pokedex />} />
        <Route path="/Pokedex/:id" element={<PokemonId />} />
      </Routes>
    </div>
  );
}

export default App