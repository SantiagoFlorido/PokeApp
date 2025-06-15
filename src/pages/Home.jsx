import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PokemonLogo from '/pokemon.png';

const Home = () => {

  const [trainerName, setTrainerName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trainerName.trim()) {
      navigate('/pokedex', { state: { trainerName } });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between">
      {/* Encabezado con mensaje de bienvenida */}
      <header className="w-full text-center py-4">
        <h1 className="text-3xl font-bold text-gray-800">¡Bienvenido a la <span className="text-red-600">PokeApp</span>!</h1>
        <p className="text-gray-600 mt-2">Descubre el mundo de los Pokémon</p>
      </header>

      {/* Contenido central: Logo, input y label */}
      <main className="flex flex-col items-center justify-center flex-grow w-full max-w-md mx-auto px-4">
        <img 
          src={PokemonLogo} 
          alt="Pokemon Logo" 
          className="w-64 h-auto mb-8" 
        />

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <label htmlFor="trainer-name" className="text-xl font-medium text-gray-700 mb-2">
            Ingresa tu nombre
          </label>

          <input
            type="text"
            id="trainer-name"
            value={trainerName}
            onChange={(e) => setTrainerName(e.target.value)}
            placeholder="Ingresa tu nombre de entrenador Pokémon"
            className="md:w-full w-[350px] px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-center mb-4"
            required
          />

          <button
            type="submit"
            disabled={!trainerName.trim()}
            className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-colors 
                      ${!trainerName.trim() ? 'opacity-50 cursor-not-allowed' : 'shadow-lg cursor-pointer'}`}
          >
            Ingresar a la Pokédex
          </button>
        </form>
      </main>

      {/* Footer con diseño de Pokéball */}
      <footer className="w-full relative">
        <div className="h-4 bg-red-600 w-full"></div>
        <div className="h-7 bg-white w-full"></div>
        
        <div className="absolute left-1/2 -translate-x-1/2 -top-1">
          <div className="relative">
            <div className="w-12 h-6 bg-red-600 rounded-t-full border-4 border-gray-800"></div>
            <div className="w-12 h-6 bg-white rounded-b-full border-4 border-gray-800 border-t-0"></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gray-800 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;