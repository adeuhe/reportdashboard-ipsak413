import sql from "mssql";

const config: sql.config = {
  user: "sa",
  password: "saadmin1!",
  server: "192.168.100.101",
  database: "iPSAK71",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const configMID: sql.config = {
  user: "sa",
  password: "saadmin1!",
  server: "192.168.100.101",
  database: "ipsak413_mid",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool;
let poolMID: sql.ConnectionPool;

export async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

export async function getPoolMID() {
  if (!poolMID) {
    poolMID = new sql.ConnectionPool(configMID);
    await poolMID.connect();
  }
  return poolMID;
}