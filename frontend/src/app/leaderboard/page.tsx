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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="space-y-2">
          <label htmlFor="gender-filter" className="text-sm font-medium">Género</label>
          <select
            id="gender-filter"
            name="gender"
            className="w-full p-2 border rounded-md bg-background"
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            aria-label="Filtrar por género"
          >
            <option value="all">Todos</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="location-filter" className="text-sm font-medium">Ubicación</label>
          <select
            id="location-filter"
            name="location"
            className="w-full p-2 border rounded-md bg-background"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            aria-label="Filtrar por ubicación"
          >
            <option value="all">Todas</option>
            <option value="bogota">Bogotá</option>
            <option value="medellin">Medellín</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="box-filter" className="text-sm font-medium">Box/Gimnasio</label>
          <select
            id="box-filter"
            name="box"
            className="w-full p-2 border rounded-md bg-background"
            value={filters.box}
            onChange={(e) => setFilters({ ...filters, box: e.target.value })}
            aria-label="Filtrar por box o gimnasio"
          >
            <option value="all">Todos</option>
            <option value="box1">CrossFit Bogotá</option>
            <option value="box2">CrossFit Medellín</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="level-filter" className="text-sm font-medium">Nivel</label>
          <select
            id="level-filter"
            name="level"
            className="w-full p-2 border rounded-md bg-background"
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            aria-label="Filtrar por nivel"
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
        <table className="w-full border-collapse" role="table">
          <thead role="rowgroup">
            <tr className="bg-secondary" role="row">
              <th className="p-4 text-left" role="columnheader" scope="col">#</th>
              <th className="p-4 text-left" role="columnheader" scope="col">Nombre</th>
              <th className="p-4 text-left" role="columnheader" scope="col">Tiempo</th>
              <th className="p-4 text-left" role="columnheader" scope="col">Nivel</th>
              <th className="p-4 text-left" role="columnheader" scope="col">Género</th>
              <th className="p-4 text-left" role="columnheader" scope="col">Ubicación</th>
              <th className="p-4 text-left" role="columnheader" scope="col">Box</th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {results.map((result, index) => (
              <tr
                key={index}
                className="border-b hover:bg-secondary/50 transition-colors"
                role="row"
              >
                <td className="p-4" role="cell">{result.rank}</td>
                <td className="p-4" role="cell">{result.name}</td>
                <td className="p-4 font-mono" role="cell">{result.time}</td>
                <td className="p-4" role="cell">{result.level}</td>
                <td className="p-4" role="cell">{result.gender}</td>
                <td className="p-4" role="cell">{result.location}</td>
                <td className="p-4" role="cell">{result.box}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
