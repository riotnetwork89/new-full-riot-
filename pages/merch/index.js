import { useState } from 'react';

export default function MerchPage() {
  const [products] = useState([
    {
      id: 1,
      name: 'Riot Network T-Shirt',
      price: 25,
      image: 'https://via.placeholder.com/300x300/ff0000/ffffff?text=RIOT+SHIRT',
      description: 'Official Riot Network branded t-shirt'
    },
    {
      id: 2,
      name: 'Riot Network Hoodie',
      price: 45,
      image: 'https://via.placeholder.com/300x300/cc0000/ffffff?text=RIOT+HOODIE',
      description: 'Premium quality hoodie with Riot Network logo'
    },
    {
      id: 3,
      name: 'Riot Network Cap',
      price: 20,
      image: 'https://via.placeholder.com/300x300/990000/ffffff?text=RIOT+CAP',
      description: 'Adjustable cap with embroidered logo'
    },
    {
      id: 4,
      name: 'Riot Network Sticker Pack',
      price: 10,
      image: 'https://via.placeholder.com/300x300/660000/ffffff?text=STICKERS',
      description: 'Pack of 10 premium vinyl stickers'
    }
  ]);

  return (
    <div className="container">
      <h1>Riot Network Merch</h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem', opacity: 0.8 }}>
        Official Riot Network merchandise - Show your support!
      </p>
      
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {products.map(product => (
          <div key={product.id} className="card">
            <img 
              src={product.image} 
              alt={product.name}
              style={{ 
                width: '100%', 
                height: '200px', 
                objectFit: 'cover', 
                borderRadius: '8px',
                marginBottom: '1rem'
              }}
            />
            <h3 style={{ marginBottom: '0.5rem' }}>{product.name}</h3>
            <p style={{ opacity: 0.8, marginBottom: '1rem', fontSize: '0.9rem' }}>
              {product.description}
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: 'auto'
            }}>
              <span style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#ff6b6b' 
              }}>
                ${product.price}
              </span>
              <button style={{
                background: 'linear-gradient(90deg, #ff6b6b, #ff5252)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
