import { useState } from 'react'

export function LocationSearch({ onSearch, onSelect }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const res = await onSearch(query)
    setResults(res)
    setLoading(false)
  }

  return (
    <div className="mx-4 mt-4 animate-fade-in">
      <p className="text-zinc-400 text-sm text-center mb-3">
        Location access denied — search for your city or postcode
      </p>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. London, Manchester..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          {loading ? '…' : 'Go'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="mt-2 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => { onSelect(r); setResults([]) }}
              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
            >
              <span className="font-medium">{r.name}</span>
              {r.admin1 && <span className="text-zinc-400">, {r.admin1}</span>}
              {r.country && <span className="text-zinc-500"> · {r.country}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
