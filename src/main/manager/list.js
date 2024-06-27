/**
 * 冒泡排序，默认是升序
 * @param data_list
 * @param key
 * @param asc
 */
function sort(data_list, key, asc = true) {
  if (!data_list || data_list.length === 0) {
    return data_list
  }

  for (let index = 0; index < data_list.length; index++) {
    for (let index_a = data_list.length - 1; index_a > index; index_a--) {
      const data = key ? data_list[index_a][key] : data_list[index_a]
      // 较前的一个
      const data_befor = key ? data_list[index_a - 1][key] : data_list[index_a - 1]

      const object_data = data_list[index_a]

      if (data < data_befor) {
        if (asc) {
          data_list[index_a] = data_list[index_a - 1]
          data_list[index_a - 1] = object_data
        }
      } else if (data > data_befor) {
        if (!asc) {
          data_list[index_a] = data_list[index_a - 1]
          data_list[index_a - 1] = object_data
        }
      }
    }
  }

  return data_list
}

function getNumSum(list, key) {
  let num = 0
  for (const data of list) {
    if (key) {
      num += data[key]
    } else {
      num += data
    }
  }
  return num
}

function get_in_sql(list) {
  let in_sql = JSON.stringify(list)
  in_sql = in_sql.replace('[', '')
  in_sql = in_sql.replace(']', '')
  in_sql = in_sql.replaceAll('"', "'")
  return `( ${in_sql} ) `
}

function get_list_map(list, k, v) {
  const map = new Map()
  for (const data of list) {
    map.set(k ? data[k] : k, v ? data[v] : data)
  }
  return map
}

function get_list_map_to_list(list, k, v) {
  const map = new Map()
  for (const data of list) {
    const data_v = v ? data[v] : data
    if (map.has(data[k])) {
      map.get(data[k]).push(data_v)
    } else {
      const p_list = [data_v]
      map.set(data[k], p_list)
    }
  }
  return map
}

// 获取一个key的全部list
function get_list_by_key(list, assert_fun) {
  const result_list = []
  for (const data of list) {
    if (assert_fun(data)) {
      result_list.push(data)
    }
  }
  return result_list
}

function is_empty(...list) {
  if (!list) {
    return true
  }
  if (list.length === 0) {
    return true
  }
  for (const data_list of list) {
    if (!data_list) {
      return true
    }
    if (data_list.length === 0) {
      return true
    }
  }
  return false
}

function add_set_batch(list, set) {
  if (!list || !set) {
    return
  }
  for (const data of list) {
    set.add(data)
  }
}

function get_list_by_set(set) {
  // let inter = set.values();
  const list = []
  if (!set || set.size === 0) {
    return list
  }
  for (const data of set.values()) {
    list.push(data)
  }
  return list
}

function insert_data_list_to_map(map, key, ...value) {
  if (!map || !key) {
    return
  }
  if (map.has(key)) {
    map.get(key).push(value)
  } else {
    map.set(key, [value])
  }
}

function insert_data_set_to_map(map, key, ...value) {
  if (!map || !key) {
    return
  }
  if (map.has(key)) {
    map.get(key).add(...value)
  } else {
    map.set(key, new Set(value))
  }
}

// let s = new Set([1,2,3]);
// console.log(get_list_by_set(s))

module.exports.sort = sort
module.exports.get_num_sum = getNumSum
module.exports.get_in_sql = get_in_sql
module.exports.get_list_map = get_list_map
module.exports.is_empty = is_empty
module.exports.add_set_batch = add_set_batch
module.exports.get_list_by_set = get_list_by_set
module.exports.insert_data_list_to_map = insert_data_list_to_map
module.exports.insert_data_set_to_map = insert_data_set_to_map
module.exports.get_list_by_key = get_list_by_key
module.exports.get_list_map_to_list = get_list_map_to_list

// let a = [{a:1},{a:3},{a:2},{a:6},{a:8}]
// sort(a,'a',true)
// console.log(a)
