import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PokemonLogo from 'https://res.cloudinary.com/dufzsv87k/image/upload/v1750023974/Pokemon_kmbzzp.png';

const Pokedex = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [trainerName, setTrainerName] = useState(localStorage.getItem('trainerName') || 'Entrenador');
  
  const [pokemons, setPokemons] = useState([]);
  const [allPokemons, setAllPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [types, setTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 20;

  useEffect(() => {
    // Actualizar el nombre del entrenador si viene en el estado de navegación
    if (location.state?.trainerName) {
      const newName = location.state.trainerName;
      setTrainerName(newName);
      localStorage.setItem('trainerName', newName);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchPokemonTypes = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/type');
        setTypes(response.data.results.filter(type => type.name !== 'shadow' && type.name !== 'unknown'));
      } catch (error) {
        console.error('Error fetching types:', error);
      }
    };

    fetchPokemonTypes();
  }, []);

  useEffect(() => {
    const fetchAllPokemons = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1302');
        const pokemonDetails = await Promise.all(
          response.data.results.map(async (pokemon) => {
            const details = await axios.get(pokemon.url);
            return details.data;
          })
        );
        setAllPokemons(pokemonDetails);
        setPokemons(pokemonDetails);
      } catch (error) {
        console.error('Error fetching pokemons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPokemons();
  }, []);

  useEffect(() => {
    if (selectedTypes.length === 0) {
      setPokemons(allPokemons);
      return;
    }

    const filtered = allPokemons.filter(pokemon => 
      pokemon.types.some(type => selectedTypes.includes(type.type.name))
    );
    setPokemons(filtered);
    setPage(1);
  }, [selectedTypes, allPokemons]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filteredPokemons = pokemons.filter(pokemon => 
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPokemons.length / itemsPerPage);

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const handlePokemonClick = (pokemonId) => {
    navigate(`/Pokedex/${pokemonId}`, { state: { trainerName } });
  };

  const getPokemonImage = (pokemon) => {
    const problematicIds = [10264, 10265, 10266, 10267, 10268, 10269, 10270, 10271];
    
    if (problematicIds.includes(pokemon.id)) {
      return pokemon.sprites.front_default || 'https://via.placeholder.com/128';
    }
    
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-red-600 p-2 md:p-4 flex flex-col md:flex-row items-center justify-between shadow-md">
        <div className="flex items-center mb-2 md:mb-0 w-full md:w-auto justify-between">
          <div className="flex items-center">
            <img 
              src={PokemonLogo} 
              alt="Pokemon Logo" 
              className="h-8 md:h-12 mr-2 md:mr-4" 
            />
            <h1 className="text-white text-sm md:text-xl font-bold">
              ¡Bienvenido, entrenador {trainerName}!
            </h1>
          </div>
          
          {/* Botón para mostrar filtros en mobile */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden bg-yellow-500 text-red-800 py-1 px-2 rounded text-xs font-bold"
          >
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>
        
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Buscar Pokémon..."
            className="w-full px-3 py-1 md:px-4 md:py-2 rounded-full border-2 border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm md:text-base"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); }}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex flex-col md:flex-row p-2 md:p-4 flex-grow">
        {/* Filtros por tipo */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-1/5 bg-white p-2 md:p-4 rounded-lg shadow md:mr-4 mb-4 md:mb-0`}
        >
          <h2 className="text-lg font-bold mb-2 md:mb-4 text-gray-800">Filtrar por tipo</h2>
          <div className="space-y-1 md:space-y-2 max-h-60 md:max-h-full overflow-y-auto">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedTypes.length === 0}
                onChange={() => setSelectedTypes([])}
                className="form-checkbox h-4 w-4 text-red-600 rounded"
              />
              <span className="ml-2 text-gray-700 text-sm md:text-base">Todos</span>
            </label>
            
            {types.map((type) => (
              <label key={type.name} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.name)}
                  onChange={() => handleTypeToggle(type.name)}
                  className="form-checkbox h-4 w-4 text-red-600 rounded"
                />
                <span 
                  className="ml-2 text-gray-700 capitalize text-sm md:text-base"
                  style={{ color: getTypeColor(type.name) }}
                >
                  {type.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Grid de Pokémon */}
        <div className="w-full md:w-4/5 flex flex-col">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-xl">Cargando Pokédex...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                {filteredPokemons
                  .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                  .map((pokemon) => {
                    const primaryType = pokemon.types[0].type.name;
                    return (
                      <div
                        key={pokemon.id}
                        className="rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-full"
                        onClick={() => handlePokemonClick(pokemon.id)}
                      >
                        <div 
                          className="p-2 md:p-4 flex-grow"
                          style={{ backgroundColor: `${getTypeColor(primaryType)}20` }}
                        >
                          <div className="flex justify-center">
                            <img
                              src={getPokemonImage(pokemon)}
                              alt={pokemon.name}
                              className="h-16 w-16 md:h-32 md:w-32 object-contain"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/128';
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="bg-white p-2 md:p-3 flex flex-col flex-grow">
                          <h3 className="text-center font-bold text-gray-800 text-xs md:text-base flex-grow">
                            #{pokemon.id.toString().padStart(3, '0')} - {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                          </h3>
                          <div className="flex justify-center gap-1 md:gap-2 mt-1 md:mt-2">
                            {pokemon.types.map((type) => (
                              <span
                                key={type.type.name}
                                className="px-1 md:px-2 py-0 md:py-1 rounded-full text-xs text-white"
                                style={{ 
                                  backgroundColor: getTypeColor(type.type.name),
                                  border: '1px solid white'
                                }}
                              >
                                {type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Paginación */}
              {filteredPokemons.length > 0 && (
                <div className="flex flex-col md:flex-row justify-center items-center mt-4 md:mt-8 gap-2 mb-4">
                  {page > 1 && (
                    <button
                      onClick={() => setPage(p => p - 1)}
                      className="px-3 md:px-4 py-1 md:py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition text-sm md:text-base cursor-pointer"
                    >
                      Anterior
                    </button>
                  )}
                  <span className="px-2 md:px-4 py-1 md:py-2 flex items-center text-sm md:text-base">
                    Página {page} de {totalPages}
                  </span>
                  {page < totalPages && (
                    <button
                      onClick={() => setPage(p => p + 1)}
                      className="px-3 md:px-4 py-1 md:py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition text-sm md:text-base cursor-pointer"
                    >
                      Siguiente
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-red-600 py-2 md:py-4 text-center text-white text-xs md:text-base">
        <p>Creado por Santiago Florido | Usando la PokéApi</p>
      </footer>
    </div>
  );
};

const getTypeColor = (type) => {
  const colors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };
  return colors[type] || '#777';
};

export default Pokedex;