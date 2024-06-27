let Database = null
if (process.env.NODE_ENV === 'debug') {
  const path = '../../../resource/exec/better_sqlite3'
  Database = require(path)
} else {
  Database = require('better-sqlite3')
}

class DB {
  constructor(path) {
    this.db = new Database(path)
    this.logger = require('../manager/log')
  }

  findOneBySql(sql) {
    this.logger.info(sql)
    const stmt = this.db.prepare(sql)
    const data = stmt.get()
    return data || null
  }

  /**
   * 新增数据
   * @param {Object} obj 插入对象，key数据库列名
   */
  insertOne(tableName, obj) {
    let sql = `insert into ${tableName} `
    const keys = Object.keys(obj)
    sql += `(${keys.join(',')}) values`

    const varr = keys.map(data => {
      return `@${data}`
    })

    sql += ` (${varr.join(',')}) `
    this.logger.info(sql, obj)
    const stmt = this.db.prepare(sql)
    const result = stmt.run(obj)
    // 返回主键
    return result.lastInsertRowid
  }
  /**
   * 计数
   * @param where
   * @returns {*}
   */
  count(tableName, where) {
    let sql = `SELECT COUNT(*) AS 'count' from ${tableName}  `
    if (where) {
      sql += '  where  ' + where
    }
    this.logger.info(sql)
    const stmt = this.db.prepare(sql)
    const data = stmt.get()
    return data.count
  }

  /**
   * 查询所有
   * @param sql
   * @returns {*}
   */
  findBySql(sql) {
    this.logger.info(sql)
    // console.log(sql)
    const stmt = this.db.prepare(sql)
    const data = stmt.all()
    return data
  }
}

module.exports.DB = DB
