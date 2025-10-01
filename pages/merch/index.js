import { useState } from 'react';

export default function MerchPage() {
  const [products] = useState([
    {
      id: 1,
      name: 'Riot Network T-Shirt',
      price: 25,
      image: 'https://via.placeholder.com/300x300/8B5CF6/ffffff?text=RIOT+SHIRT',
      description: 'Official Riot Network branded t-shirt'
    },
    {
      id: 2,
      name: 'Riot Network Hoodie',
      price: 45,
      image: 'https://via.placeholder.com/300x300/6B46C1/ffffff?text=RIOT+HOODIE',
      description: 'Premium quality hoodie with Riot Network logo'
    },
    {
      id: 3,
      name: 'Riot Network Cap',
      price: 20,
      image: 'https://via.placeholder.com/300x300/A855F7/ffffff?text=RIOT+CAP',
      description: 'Adjustable cap with embroidered logo'
    },
    {
      id: 4,
      name: 'Riot Network Sticker Pack',
      price: 10,
      image: 'https://via.placeholder.com/300x300/7C3AED/ffffff?text=STICKERS',
      description: 'Pack of 10 premium vinyl stickers'
    }
  ]);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '900',
          marginBottom: '1rem',
          background: 'linear-gradient(45deg, #ff0000, #ffffff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          RIOT NETWORK MERCH
        </h1>
        <p style={{ 
          fontSize: '1.2rem',
          textAlign: 'center', 
          marginBottom: '3rem', 
          opacity: 0.8,
          fontWeight: '300'
        }}>
          Official Riot Network merchandise - Show your support!
        </p>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {products.map(product => (
            <div key={product.id} style={{ 
              background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              textAlign: 'left'
            }}>
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
            <h3 style={{ 
              marginBottom: '0.5rem',
              color: '#ff0000',
              fontSize: '1.3rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {product.name}
            </h3>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              marginBottom: '1rem', 
              fontSize: '0.9rem',
              lineHeight: '1.6'
            }}>
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
                color: '#ff0000' 
              }}>
                ${product.price}
              </span>
              <button style={{
                background: 'linear-gradient(45deg, #ff0000, #cc0000)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '50px',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Add to Cart
              </button>
            </div>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
}
