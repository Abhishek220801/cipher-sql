import { Editor } from "@monaco-editor/react"
import { useEffect, useState } from "react"
import { BASE_URL } from "./utils/constants.js"
import axios from "axios"

function App() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState(null)
  const [schema, setSchema] = useState([])
  const [error, setError] = useState(null)
  const [expiry, setExpiry] = useState('')
  const [dbLoading, setDBLoading] = useState(false)
  const [queryLoading, setQueryLoading] = useState(false)

  async function loadDB() {
    try {
      setDBLoading(true)
      const res = await axios.post(
        BASE_URL + "/api/v1/query/load",
        {},
        { withCredentials: true },
      )
      calcExpiry(res.data?.data?.expires)
      setSchema(res.data?.data?.schema)
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth", // optional
        })
      }, 300)

      console.log("DB loaded")
    } catch (err) {
      console.error("DB load failed", err)
    } finally {
      setDBLoading(false)
    }
  }

  const calcExpiry = (expInISO) => {
    const expires = new Date(expInISO)

    const timer = setInterval(() => {
      const now = new Date()
      const diff = expires.getTime() - now.getTime()

      if (diff <= 0) {
        setExpiry("Expired")
        clearInterval(timer)
        return
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setExpiry(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000)
  }

  const handleRun = async () => {
    console.log("Running Query...")
    setQueryLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await axios.post(
        BASE_URL + "/api/v1/query/exec",
        { query },
        { withCredentials: true },
      )
      setResult(res.data)
      calcExpiry(res.data.expires)
    } catch (err) {
      setError(err.response?.data?.message || "Could not reach server.")
    } finally {
      setQueryLoading(false)
    }
  }

  return (
    <>
      <div
        id="heading"
        className="flex justify-between items-center bg-neutral-200 p-2"
      >
        <h1 className="text-xl p-2 font-light tracking-wide font-[Monument]">
          CipherSQLEditor
        </h1>
        <div className="space-x-3">
          {expiry && <p>{expiry ? `Expires in `: ''} {expiry}</p>}
          <button
            disabled={dbLoading}
            className="cursor-pointer p-2 border-2"
            onClick={loadDB}
          >
            {dbLoading ? "Loading..." : "Show Database"}
          </button>
          <button
            onClick={handleRun}
            disabled={queryLoading}
            className="border-x-black border-2 p-2"
          >
            {queryLoading ? "Running..." : "Run Query"}
          </button>
        </div>
      </div>
      <hr />
      <div className="flex h-[90vh]">
        <div className="w-2/3">
          <Editor
            height="100%"
            defaultLanguage="sql"
            defaultValue="--Write Your Query Below"
            value={query}
            onChange={(val) => setQuery(val ?? "")}
          />
        </div>
        <div className="w-px bg-gray-400"></div>
        <div className="w-1/2 p-4 bg-gray-50 overflow-auto">
          <h2 className="font-semibold mb-2">Output</h2>
          {queryLoading && <p>Running...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {result && (
            <pre className="text-sm">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center">
        {schema.map((table) => (
          <div
            className="p-4 border border-slate-200 mr-2 mt-2"
            key={table.name}
          >
            <p className="text-lg font-semibold mb-2">{table.name}</p>

            <table className="w-auto border border-gray-300 rounded-md overflow-hidden text-sm">
              <tr className="bg-gray-100">
                {Object.entries(table.columns).map(([col]) => (
                  <th
                    key={col}
                    className="px-3 py-2 font-medium text-gray-700 border-r border-gray-300 last:border-r-0"
                  >
                    {col}
                  </th>
                ))}
              </tr>

              <tr>
                {Object.entries(table.columns).map(([col, type]) => (
                  <td
                    key={col}
                    className="px-3 py-2 text-gray-800 text-center border-r border-gray-300 last:border-r-0"
                  >
                    {type}
                  </td>
                ))}
              </tr>
            </table>
          </div>
        ))}
      </div>
    </>
  )
}

export default App
