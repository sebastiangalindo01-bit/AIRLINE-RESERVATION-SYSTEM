import pg from 'pg'
import { URL } from 'url'

function maskPassword(conn) {
  try {
    const url = new URL(conn)
    if (url.password) url.password = '****'
    return url.toString()
  } catch (e) {
    return conn.replace(/:(.*)@/, ':****@')
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL || process.argv[2]
  if (!connectionString) {
    console.error('Falta DATABASE_URL en env y no se pasó como argumento.')
    process.exit(1)
  }

  console.log('Connection string (masked):', maskPassword(connectionString))
  try {
    const url = new URL(connectionString)
    console.log('Host:', url.hostname)
    console.log('User:', url.username)
    console.log('Port:', url.port || '5432')
    console.log('Database:', url.pathname.replace('/', ''))
  } catch (e) {
    // ignore
  }

  const { Pool } = pg
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    const client = await pool.connect()
    const res = await client.query('SELECT NOW() AS now')
    console.log('Conexión OK. Hora del servidor:', res.rows[0].now)
    client.release()
    await pool.end()
    process.exit(0)
  } catch (err) {
    console.error('Error al conectar con la DB:')
    console.error(err && err.code ? `code=${err.code}` : '', err && err.message ? err.message : err)
    await pool.end().catch(()=>{})
    process.exit(1)
  }
}

main()
