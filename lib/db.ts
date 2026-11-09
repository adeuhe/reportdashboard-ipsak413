import sql from "mssql";

const config: sql.config = {
  user: "sa",
  password: "saadmin1!",
  server: "10.8.0.101",
  database: "iPSAK71",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  connectionTimeout: 3000,
  requestTimeout: 5000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const configMID: sql.config = {
  user: "sa",
  password: "saadmin1!",
  server: "10.8.0.101",
  database: "ipsak413_mid",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  connectionTimeout: 3000,
  requestTimeout: 5000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const configStaging: sql.config = {
  user: "sa",
  password: "saadmin1!",
  server: "10.8.0.101",
  database: "ipsak413_staging",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  connectionTimeout: 3000,
  requestTimeout: 5000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | undefined;
let poolMID: sql.ConnectionPool | undefined;
let poolStaging: sql.ConnectionPool | undefined;

export async function getPool() {
  if (!pool) {
    pool = new sql.ConnectionPool(config);
    try {
      await pool.connect();
    } catch (err) {
      pool = undefined;
      throw err;
    }
  } else if (!pool.connected && !pool.connecting) {
    try {
      await pool.connect();
    } catch (err) {
      pool = undefined;
      throw err;
    }
  }
  return pool;
}

export async function getPoolMID() {
  if (!poolMID) {
    poolMID = new sql.ConnectionPool(configMID);
    try {
      await poolMID.connect();
    } catch (err) {
      poolMID = undefined;
      throw err;
    }
  } else if (!poolMID.connected && !poolMID.connecting) {
    try {
      await poolMID.connect();
    } catch (err) {
      poolMID = undefined;
      throw err;
    }
  }
  return poolMID;
}

export async function getPoolStaging() {
  if (!poolStaging) {
    poolStaging = new sql.ConnectionPool(configStaging);
    try {
      await poolStaging.connect();
    } catch (err) {
      poolStaging = undefined;
      throw err;
    }
  } else if (!poolStaging.connected && !poolStaging.connecting) {
    try {
      await poolStaging.connect();
    } catch (err) {
      poolStaging = undefined;
      throw err;
    }
  }
  return poolStaging;
}

export { sql, configMID };