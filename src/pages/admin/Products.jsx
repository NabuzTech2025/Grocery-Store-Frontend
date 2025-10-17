import { useEffect, useState } from 'react';
import axios from '../../api';

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('/products').then(res => setProducts(res.data));
  }, []);

  return (
    <div>
      <h2>All Products</h2>
      {products.map(p => <div key={p.id}><h4>{p.name}</h4></div>)}
    </div>
  );
};

export default Products;
