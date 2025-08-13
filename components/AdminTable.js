export default function AdminTable({ title, columns, data, actions }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-riot-gray rounded-lg overflow-hidden">
          <thead className="bg-riot-red">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-white font-semibold">
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-left text-white font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.id || index} className="border-b border-riot-black hover:bg-gray-800">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-white">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(row)}
                          className={`px-3 py-1 rounded text-sm ${action.className || 'bg-riot-red text-white hover:bg-red-700'}`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
