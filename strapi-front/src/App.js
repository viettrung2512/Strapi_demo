import React, { useEffect, useState } from "react";
import { getArticles } from "./services/api";

function App() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getArticles();
      setArticles(data);
    }
    fetchData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Strapi Articles</h1>

      {articles.length === 0 && <p>Loading...</p>}

      {articles.map((article) => {
        const coverUrl = article.cover?.url 
          ? `http://localhost:1337${article.cover.url}`
          : null;

        const authorName = article.author?.name || "Unknown";
        const categoryName = article.category?.name || "Uncategorized";

        return (
          <div key={article.id} style={{ marginBottom: 20 }}>
            {coverUrl && (
              <img 
                src={coverUrl} 
                alt={article.title} 
                style={{ width: "200px", borderRadius: 10 }} 
              />
            )}

            <h2>{article.title}</h2>
            <p>{article.description}</p>

            <p><b>Author:</b> {authorName}</p>
            <p><b>Category:</b> {categoryName}</p>

            <hr />
          </div>
        );
      })}
    </div>
  );
}

export default App;
