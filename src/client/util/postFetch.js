async function postFetch (res) {
  if (res.ok) return res
  else throw res
}

export default postFetch
