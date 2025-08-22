export default function AdminTable({ title, columns, data, actions }) {
  return (
    <div className="mb-16">
      {title && <h2 className="text-3xl font-black text-white uppercase tracking-wide mb-8">{title}</h2>}
      <div className="bg-black border border-gray-800">
        <table className="w-full">
          <thead className="bg-black border-b border-gray-800">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-8 py-6 text-left text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
                  {column.label}
                </th>
              ))}
              {actions && <th className="px-8 py-6 text-left text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-riot-gray">
                {columns.map((column) => (
                  <td key={column.key} className="px-8 py-6 whitespace-nowrap text-sm text-white font-medium">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-8 py-6 whitespace-nowrap text-sm">
                    <div className="flex space-x-4">
                      {actions.map((action, actionIndex) => {
                        if (action.condition && !action.condition(row)) {
                          return null;
                        }
                        return (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${action.className}`}
                          >
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-sm uppercase tracking-widest">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
