import React from 'react';

export default function Table({
  columns = [], // [{ header: 'Name', key: 'name', sticky: true, render: (row) => ... }]
  data = [],
  className = '',
  keyField = 'id',
  onRowClick,
}) {
  return (
    <div className={`w-full overflow-x-auto relative select-text ${className}`}>
      <table className="w-full text-left border-collapse min-w-[620px]">
        <thead>
          <tr className="border-b border-line text-[12px] font-semibold uppercase tracking-wider text-muted select-none">
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={`py-3 px-3.5 ${
                  col.sticky ? 'sticky left-0 bg-[#071922] z-10' : ''
                } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                style={col.width ? { width: col.width } : {}}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-line text-[13.5px] font-body">
          {data.map((row, rIdx) => (
            <tr
              key={row[keyField] || rIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`transition-colors duration-150 ${
                onRowClick
                  ? 'cursor-pointer hover:bg-surface2/60 active:bg-surface2'
                  : 'hover:bg-surface2/30'
              }`}
            >
              {columns.map((col, cIdx) => (
                <td
                  key={col.key || cIdx}
                  className={`py-3 px-3.5 align-middle ${
                    col.sticky
                      ? 'sticky left-0 bg-[#071922] z-10 font-medium'
                      : ''
                  } ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {col.render ? col.render(row, rIdx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-muted text-[13px] italic"
              >
                All caught up — no records to display.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

