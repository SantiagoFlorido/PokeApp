import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PokemonLogo from '@public/pokemon.png';

const PokemonId = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [flavorText, setFlavorText] = useState('');
  const [evolutionDetails, setEvolutionDetails] = useState([]);

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        setLoading(true);
        
        // Fetch basic pokemon data
        const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        
        // Fetch species data for evolution chain and flavor text
        const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        
        // Fetch evolution chain if exists
        if (speciesResponse.data.evolution_chain) {
          const evolutionResponse = await axios.get(speciesResponse.data.evolution_chain.url);
          processEvolutionChain(evolutionResponse.data.chain);
        }
        
        // Get English flavor text
        const flavorTextEntries = speciesResponse.data.flavor_text_entries
          .filter(entry => entry.language.name === 'es')
          .map(entry => entry.flavor_text.replace(/\n/g, ' ').replace(/\f/g, ' '));
        
        setFlavorText(flavorTextEntries[Math.floor(Math.random() * flavorTextEntries.length)]);
        
        setPokemon({
          ...pokemonResponse.data,
          species: speciesResponse.data,
        });
        
      } catch (err) {
        console.error('Error fetching pokemon data:', err);
        setError('No se pudo cargar la información del Pokémon');
      } finally {
        setLoading(false);
      }
    };
    
    const processEvolutionChain = (chain) => {
      const evoChain = [];
      let evoData = chain;
      
      do {
        const speciesUrlParts = evoData.species.url.split('/');
        const speciesId = speciesUrlParts[speciesUrlParts.length - 2];
        
        evoChain.push({
          id: speciesId,
          name: evoData.species.name,
          details: evoData.evolution_details[0] || null
        });
        
        evoData = evoData.evolves_to[0];
      } while (evoData && evoData.evolves_to);
      
      setEvolutionChain(evoChain);
    };
    
    fetchPokemonData();
  }, [id]);

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

  const getPokemonImage = () => {
    const problematicIds = [10264, 10265, 10266, 10267, 10268, 10269, 10270, 10271];
    
    if (problematicIds.includes(parseInt(id))) {
      return pokemon?.sprites?.front_default || 'https://via.placeholder.com/128';
    }
    
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  };

  const getGenderRatio = () => {
    if (!pokemon?.species?.gender_rate) return 'Desconocido';
    
    const femaleRate = (pokemon.species.gender_rate / 8) * 100;
    const maleRate = 100 - femaleRate;
    
    if (femaleRate === 0) return '100% ♂';
    if (maleRate === 0) return '100% ♀';
    
    return `${maleRate}% ♂ / ${femaleRate}% ♀`;
  };

  const renderStats = () => {
    if (!pokemon) return null;
    
    return (
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        {pokemon.stats.map((stat, index) => (
          <div key={index} className="bg-white p-2 rounded-lg shadow">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs md:text-sm font-semibold text-gray-600 capitalize">
                {stat.stat.name.replace('-', ' ')}
              </span>
              <span className="text-xs md:text-sm font-bold">
                {stat.base_stat}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full" 
                style={{
                  width: `${Math.min(100, stat.base_stat)}%`,
                  backgroundColor: stat.base_stat > 50 ? '#4CAF50' : '#F44336'
                }}
              ></div>
            </div>
          </div>
        ))}
        <div className="bg-white p-2 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm font-semibold text-gray-600">Total</span>
            <span className="text-xs md:text-sm font-bold">
              {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderAbilities = () => {
    if (!pokemon) return null;
    
    return (
      <div className="space-y-2">
        {pokemon.abilities.map((ability, index) => (
          <div key={index} className="bg-white p-3 rounded-lg shadow">
            <h4 className="font-bold text-sm md:text-base capitalize">
              {ability.ability.name.replace('-', ' ')}
            </h4>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              {ability.is_hidden ? '(Habilidad oculta)' : '(Habilidad normal)'}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderEvolutions = () => {
    if (evolutionChain.length <= 1) {
      return (
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm md:text-base">Este Pokémon no evoluciona</p>
        </div>
      );
    }
    
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
          {evolutionChain.map((evo, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative">
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`}
                  alt={evo.name}
                  className="w-16 h-16 md:w-24 md:h-24 object-contain"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/96';
                  }}
                />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  #{evo.id}
                </span>
              </div>
              <h4 className="font-bold text-sm md:text-base capitalize mt-2">
                {evo.name}
              </h4>
              {evo.details?.min_level && (
                <p className="text-xs text-gray-600">Nivel {evo.details.min_level}</p>
              )}
              {evo.details?.item?.name && (
                <p className="text-xs text-gray-600 capitalize">
                  Usar {evo.details.item.name.replace('-', ' ')}
                </p>
              )}
              {index < evolutionChain.length - 1 && (
                <div className="mt-2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMoves = () => {
    if (!pokemon) return null;
    
    // Group moves by generation and method
    const movesByMethod = {};
    pokemon.moves.forEach(move => {
      move.version_group_details.forEach(detail => {
        const method = detail.move_learn_method.name;
        if (!movesByMethod[method]) {
          movesByMethod[method] = [];
        }
        movesByMethod[method].push({
          name: move.move.name,
          level: detail.level_learned_at,
          generation: detail.version_group.name
        });
      });
    });
    
    return (
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 md:max-h-[610px]">
        {Object.entries(movesByMethod).map(([method, moves]) => (
          <div key={method} className="bg-white p-3 rounded-lg shadow">
            <h4 className="font-bold text-sm md:text-base mb-2 capitalize">
              {method.replace('-', ' ')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {moves
                .sort((a, b) => a.level - b.level)
                .map((move, index) => (
                  <div key={index} className="border-b border-gray-100 pb-2">
                    <p className="text-xs md:text-sm font-semibold capitalize">
                      {move.name.replace('-', ' ')}
                    </p>
                    {method === 'level-up' && (
                      <p className="text-xs text-gray-600">Nivel {move.level}</p>
                    )}
                    <p className="text-xs text-gray-400 capitalize">
                      {move.generation.replace('-', ' ')}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mb-4"></div>
        <p className="text-xl">Cargando información del Pokémon...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/Pokedex')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition"
          >
            Volver a la Pokédex
          </button>
        </div>
      </div>
    );
  }

  if (!pokemon) return null;

  const primaryType = pokemon.types[0].type.name;
  const backgroundColor = `${getTypeColor(primaryType)}20`;

  const location = useLocation();
  const trainerName = location.state?.trainerName || 'Entrenador';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-red-600 p-2 md:p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={PokemonLogo} 
              alt="Pokemon Logo" 
              className="h-8 md:h-12 mr-2 md:mr-4" 
              
            />
          </div>
          
          <button
            onClick={() => navigate('/Pokedex', { state: { trainerName } })}
            className="bg-yellow-500 hover:bg-yellow-600 text-red-800 font-bold py-1 px-3 md:py-2 md:px-6 rounded-full text-xs md:text-base transition flex items-center cursor-pointer"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-2 md:p-4">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Left Column - Pokemon Image and Basic Info */}
          <div className="w-full lg:w-1/3">
            <div 
              className="rounded-xl p-4 md:p-6 shadow-lg mb-4 md:mb-6"
              style={{ backgroundColor }}
            >
              <div className="flex justify-center">
                <img
                  src={getPokemonImage()}
                  alt={pokemon.name}
                  className="h-48 w-48 md:h-64 md:w-64 object-contain"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/256';
                  }}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold text-center capitalize mb-2">
                {pokemon.name}
              </h2>
              
              <div className="flex justify-center gap-2 mb-4">
                {pokemon.types.map((type, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-xs md:text-sm text-white font-medium"
                    style={{ 
                      backgroundColor: getTypeColor(type.type.name),
                      border: '1px solid white'
                    }}
                  >
                    {type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600">Altura</p>
                  <p className="font-bold">{(pokemon.height / 10).toFixed(1)} m</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600">Peso</p>
                  <p className="font-bold">{(pokemon.weight / 10).toFixed(1)} kg</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600">Género</p>
                  <p className="font-bold">{getGenderRatio()}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600">Habitat</p>
                  <p className="font-bold capitalize">
                    {pokemon.species.habitat?.name || 'Desconocido'}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-xs md:text-sm italic text-center">
                  {flavorText}
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Column - Detailed Info */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 overflow-x-auto">
                <button
                  className={`px-4 py-2 text-sm md:text-base font-medium whitespace-nowrap ${activeTab === 'stats' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('stats')}
                >
                  Estadísticas
                </button>
                <button
                  className={`px-4 py-2 text-sm md:text-base font-medium whitespace-nowrap ${activeTab === 'abilities' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('abilities')}
                >
                  Habilidades
                </button>
                <button
                  className={`px-4 py-2 text-sm md:text-base font-medium whitespace-nowrap ${activeTab === 'evolution' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('evolution')}
                >
                  Evolución
                </button>
                <button
                  className={`px-4 py-2 text-sm md:text-base font-medium whitespace-nowrap ${activeTab === 'moves' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('moves')}
                >
                  Movimientos
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="p-4 md:p-6">
                {activeTab === 'stats' && renderStats()}
                {activeTab === 'abilities' && renderAbilities()}
                {activeTab === 'evolution' && renderEvolutions()}
                {activeTab === 'moves' && renderMoves()}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-red-600 py-2 md:py-4 text-center text-white text-xs md:text-sm">
        <p>Creado por Santiago Florido | Usando la PokéApi | #{id.toString().padStart(3, '0')}</p>
      </footer>
    </div>
  );
};

export default PokemonId;