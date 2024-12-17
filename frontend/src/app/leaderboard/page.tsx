'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

type Result = {
  rank: number;
  name: string;
  time: string;
  level: string;
  gender: string;
  location: string;
  box: string;
};

export default function LeaderboardPage() {
  const [filters, setFilters] = useState({
    gender: 'all',
    location: 'all',
    box: 'all',
    level: 'all',
  });

  // Datos de ejemplo
  const results: Result[] = [
    {
      rank: 1,
      name: 'Juan Pérez',
      time: '03:45',
      level: 'RX',
      gender: 'Masculino',
      location: 'Bogotá',
      box: 'CrossFit Bogotá',
    },
    // Añadir más resultados de ejemplo aquí
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>

      {/* Filtros */}
      <div role="search" aria-label="Filtros de leaderboard" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="space-y-2">
          <label id="gender-label" htmlFor="gender-filter" className="text-sm font-medium">Género</label>
          <select
            id="gender-filter"
            name="gender"
            aria-labelledby="gender-label"
            className="w-full p-2 border rounded-md bg-background"
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
          >
            <option value="all">Todos</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </div>

        <div className="space-y-2">
          <label id="location-label" htmlFor="location-filter" className="text-sm font-medium">Ubicación</label>
          <select
            id="location-filter"
            name="location"
            aria-labelledby="location-label"
            className="w-full p-2 border rounded-md bg-background"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          >
            <option value="all">Todas</option>
            <option value="bogota">Bogotá</option>
            <option value="medellin">Medellín</option>
          </select>
        </div>

        <div className="space-y-2">
          <label id="box-label" htmlFor="box-filter" className="text-sm font-medium">Box/Gimnasio</label>
          <select
            id="box-filter"
            name="box"
            aria-labelledby="box-label"
            className="w-full p-2 border rounded-md bg-background"
            value={filters.box}
            onChange={(e) => setFilters({ ...filters, box: e.target.value })}
          >
            <option value="all">Todos</option>
            <option value="box1">CrossFit Bogotá</option>
            <option value="box2">CrossFit Medellín</option>
          </select>
        </div>

        <div className="space-y-2">
          <label id="level-label" htmlFor="level-filter" className="text-sm font-medium">Nivel</label>
          <select
            id="level-filter"
            name="level"
            aria-labelledby="level-label"
            className="w-full p-2 border rounded-md bg-background"
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
          >
            <option value="all">Todos</option>
            <option value="rx">RX</option>
            <option value="advanced">Avanzado</option>
            <option value="intermediate">Intermedio</option>
            <option value="beginner">Principiante</option>
          </select>
        </div>
      </div>

      {/* Tabla de resultados */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Resultados del leaderboard">
          <thead>
            <tr>
              <th scope="col" className="px-4 py-2 text-left">Posición</th>
              <th scope="col" className="px-4 py-2 text-left">Nombre</th>
              <th scope="col" className="px-4 py-2 text-left">Tiempo</th>
              <th scope="col" className="px-4 py-2 text-left">Nivel</th>
              <th scope="col" className="px-4 py-2 text-left">Género</th>
              <th scope="col" className="px-4 py-2 text-left">Ubicación</th>
              <th scope="col" className="px-4 py-2 text-left">Box</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{result.rank}</td>
                <td className="px-4 py-2">{result.name}</td>
                <td className="px-4 py-2">{result.time}</td>
                <td className="px-4 py-2">{result.level}</td>
                <td className="px-4 py-2">{result.gender}</td>
                <td className="px-4 py-2">{result.location}</td>
                <td className="px-4 py-2">{result.box}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
