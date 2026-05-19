import fs from 'fs/promises'
import path from 'path'
import pg from 'pg'

const { Pool } = pg

async function main() {
  const sqlPath = path.resolve(process.cwd(), 'database/seed_create_super_admin.sql')
  let sql
  try {
    sql = await fs.readFile(sqlPath, 'utf8')
  } catch (err) {
    console.error('No se encontró el archivo de seed en:', sqlPath)
    console.error(err.message)
    process.exit(1)
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('Falta la variable de entorno DATABASE_URL')
    process.exit(1)
  }

  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  const client = await pool.connect()
  try {
    console.log('Iniciando seed...')
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('Seed ejecutado correctamente.')
  } catch (err) {
    try { await client.query('ROLLBACK') } catch (e) {}
    console.error('Error ejecutando el seed:', err.message || err)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

main()
