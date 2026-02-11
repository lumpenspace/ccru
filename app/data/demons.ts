import type { Demon } from './types'

export const DEMON_NAMES: Record<string, string> = {
  '9:0': 'Uttunul', '8:1': 'Murrumur', '7:2': 'Oddubb', '6:3': 'Djynxx', '5:4': 'Katak',
  '1:0': 'Lurgo',
  '2:0': 'Duoddod', '2:1': 'Doogu',
  '3:0': 'Ixix', '3:1': 'Ixigool', '3:2': 'Ixidod',
  '4:0': 'Krako', '4:1': 'Sukugool', '4:2': 'Skoodu', '4:3': 'Skarkix',
  '5:0': 'Tokhatto', '5:1': 'Tukkamu', '5:2': 'Kuttadid', '5:3': 'Tikkitix',
  '6:0': 'Tchu', '6:1': 'Djungo', '6:2': 'Djuddha', '6:4': 'Tchakki', '6:5': 'Tchattuk',
  '7:0': 'Puppo', '7:1': 'Bubbamu', '7:3': 'Pabbakis', '7:4': 'Ababbatok',
  '7:5': 'Papatakoo', '7:6': 'Bobobja',
  '8:0': 'Minommo', '8:2': 'Nammamad', '8:3': 'Mummumix', '8:4': 'Numko',
  '8:5': 'Muntuk', '8:6': 'Mommoljo', '8:7': 'Mombbo',
  '9:1': 'Tuttagool', '9:2': 'Unnunddo', '9:3': 'Ununuttix', '9:4': 'Unnunaka',
  '9:5': 'Tukutu', '9:6': 'Unnutchi', '9:7': 'Nuttubab', '9:8': 'Ummnu',
}

export const TC = new Set([1, 2, 4, 5, 7, 8])

export const ALL_DEMONS: Demon[] = []
for (let i = 1; i < 10; i++)
  for (let j = 0; j < i; j++) {
    const key = `${i}:${j}`
    const isSyz = i + j === 9
    const kind = isSyz ? 'syzygy'
      : (TC.has(i) && TC.has(j)) ? 'chrono'
      : (!TC.has(i) && !TC.has(j)) ? 'xeno' : 'amphi'
    ALL_DEMONS.push({ a: i, b: j, name: DEMON_NAMES[key] || '?', kind })
  }
