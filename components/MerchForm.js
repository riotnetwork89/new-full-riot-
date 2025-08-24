import { useState, useEffect } from 'react';

export default function MerchForm({ item, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image_url: '',
    stock_quantity: '',
    is_active: true
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        price: item.price?.toString() || '',
        description: item.description || '',
        image_url: item.image_url || '',
        stock_quantity: item.stock_quantity?.toString() || '',
        is_active: item.is_active ?? true
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const processedData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null
    };

    onSave(processedData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-riot-gray p-8 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {item ? 'Edit Merchandise' : 'Add New Merchandise'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-riot-black text-white border border-gray-600 rounded focus:outline-none focus:border-riot-red"
              placeholder="e.g., RIOT TEE (BLACK/RED)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-riot-black text-white border border-gray-600 rounded focus:outline-none focus:border-riot-red"
                placeholder="25.00"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-riot-black text-white border border-gray-600 rounded focus:outline-none focus:border-riot-red"
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 bg-riot-black text-white border border-gray-600 rounded focus:outline-none focus:border-riot-red"
              placeholder="Product description..."
            />
          </div>

          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Image URL
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-riot-black text-white border border-gray-600 rounded focus:outline-none focus:border-riot-red"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-white text-sm font-bold">
              Active (visible on merch page)
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-riot-red text-white rounded hover:bg-red-700 transition-colors"
            >
              {item ? 'Update' : 'Create'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
