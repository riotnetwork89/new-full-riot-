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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-black border border-gray-800 p-12 w-full max-w-2xl">
        <h2 className="text-3xl font-black text-white uppercase tracking-wide mb-12">
          {event ? 'Edit Event' : 'Create Event'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 bg-black text-white border border-gray-800 focus:outline-none focus:border-riot-red font-medium"
            />
          </div>
          
          <div>
            <label className="block text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Event Date
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 bg-black text-white border border-gray-800 focus:outline-none focus:border-riot-red font-medium"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                PPV Price ($)
              </label>
              <input
                type="number"
                name="ppv_price"
                value={formData.ppv_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-6 py-4 bg-black text-white border border-gray-800 focus:outline-none focus:border-riot-red font-medium"
              />
            </div>
            
            <div>
              <label className="block text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                Ticket Price ($)
              </label>
              <input
                type="number"
                name="ticket_price"
                value={formData.ticket_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-6 py-4 bg-black text-white border border-gray-800 focus:outline-none focus:border-riot-red font-medium"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-white font-medium">
              Active Event
            </label>
          </div>
          
          <div className="flex space-x-6 pt-8">
            <button
              type="submit"
              className="flex-1 bg-riot-red text-white py-4 px-6 font-bold uppercase tracking-[0.1em] hover:bg-red-700 transition-colors"
            >
              {event ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-800 text-white py-4 px-6 font-bold uppercase tracking-[0.1em] hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
