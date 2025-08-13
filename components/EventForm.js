import { useState } from 'react';

export default function EventForm({ event, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date || '',
    ppv_price: event?.ppv_price || 25,
    ticket_price: event?.ticket_price || 40,
    is_active: event?.is_active ?? true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-riot-gray p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">
          {event ? 'Edit Event' : 'Create Event'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-riot-black text-white border border-riot-red rounded focus:outline-none focus:border-riot-red"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Date
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-riot-black text-white border border-riot-red rounded focus:outline-none focus:border-riot-red"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-1">
              PPV Price ($)
            </label>
            <input
              type="number"
              name="ppv_price"
              value={formData.ppv_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-riot-black text-white border border-riot-red rounded focus:outline-none focus:border-riot-red"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Ticket Price ($)
            </label>
            <input
              type="number"
              name="ticket_price"
              value={formData.ticket_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-riot-black text-white border border-riot-red rounded focus:outline-none focus:border-riot-red"
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
            <label className="text-white text-sm">
              Active Event
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-riot-red text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
