import React from 'react'

export default function SearchBar({
  query,
  onChange,
  onSubmit,
  onUseMyLocation,
  suggestions,
  loadingSuggestions,
  onPickSuggestion,
}) {
  return (
    <div className="w-full max-w-2xl mx-auto card p-4 md:p-6">
      <form
        onSubmit={onSubmit}
        className="flex flex-col sm:flex-row gap-3 items-stretch"
      >
        <input
          className="input flex-1"
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search a city (e.g., Bengaluru, London, Tokyo)"
          autoFocus
          spellCheck="false"
        />
        <button type="submit" className="btn">Search</button>
        <button type="button" className="btn bg-slate-700 hover:bg-slate-600" onClick={onUseMyLocation}>
          Use my location
        </button>
      </form>

      {loadingSuggestions && (
        <div className="mt-3 text-sm text-slate-400">Searching places…</div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-3 border border-white/10 rounded-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={`${s.name}-${s.latitude}-${s.longitude}-${i}`}
              onClick={() => onPickSuggestion(s)}
              className="w-full text-left px-4 py-3 bg-slate-800/60 hover:bg-slate-700/60 transition flex justify-between items-center"
            >
              <div>
                <div className="text-slate-100 font-medium">
                  {s.name}{s.admin1 ? `, ${s.admin1}` : ""}{s.country ? `, ${s.country}` : ""}
                </div>
                <div className="text-slate-400 text-xs">
                  {s.latitude.toFixed(3)}, {s.longitude.toFixed(3)} · {s.timezone}
                </div>
              </div>
              <span className="badge">{s.population ? `${s.population.toLocaleString()} ppl` : "Place"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
