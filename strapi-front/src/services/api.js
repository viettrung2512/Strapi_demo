const BASE_URL = "http://localhost:1337/api";

// Get all articles with relations
export async function getArticles() {
  const res = await fetch(`${BASE_URL}/articles?populate=*`);
  const data = await res.json();
  return data.data;
}

// Get authors
export async function getAuthors() {
  const res = await fetch(`${BASE_URL}/authors?populate=*`);
  const data = await res.json();
  return data.data;
}

// Get categories
export async function getCategories() {
  const res = await fetch(`${BASE_URL}/categories?populate=*`);
  const data = await res.json();
  return data.data;
}
