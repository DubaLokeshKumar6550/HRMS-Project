import React, { useState } from 'react';
import Avatar from './Avatar';
import Tag from './Tag';
import { Calendar, CheckSquare, MoreVertical, AlertCircle } from 'lucide-react';

const COLUMNS = [
  { id: 'To do', label: 'To do', dotColor: 'var(--muted)' },
  { id: 'In progress', label: 'In progress', dotColor: 'var(--info)' },
  { id: 'In review', label: 'In review', dotColor: 'var(--warn)' },
  { id: 'Done', label: 'Done', dotColor: 'var(--good)' },
];

export default function KanbanBoard({
  tasks = [],
  onTaskClick,
  onMoveTask,
  className = '',
}) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeMenuTaskId, setActiveMenuTaskId] = useState(null);

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId && onMoveTask) {
      onMoveTask(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full ${className}`}
    >
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="flex flex-col gap-2.5 p-3 rounded-2xl bg-surface2/40 border border-line min-h-[420px]"
          >
            {/* Lane Header */}
            <div className="flex items-center justify-between pb-2 border-b border-line/50 px-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: col.dotColor }}
                />
                <h3 className="font-display font-bold text-[13px] text-ink tracking-tight">
                  {col.label}
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-muted bg-surface2 px-2 py-0.5 rounded-full border border-line/40 tabular-nums">
                {colTasks.length}
              </span>
            </div>

            {/* Task Cards list */}
            <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="flex items-center justify-center h-28 border border-dashed border-line/50 rounded-xl text-[12px] text-muted select-none">
                  Drop tasks here
                </div>
              ) : (
                colTasks.map((task) => {
                  const completedSubtasks = task.subtasks?.filter((s) => s.done).length || 0;
                  const totalSubtasks = task.subtasks?.length || 0;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onTaskClick && onTaskClick(task)}
                      className="group relative p-3 rounded-xl bg-surface border border-line/80 hover:border-accent hover:bg-surface2/70 transition-all duration-150 shadow-sm cursor-pointer select-none"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Tag
                          variant={
                            task.priority === 'High'
                              ? 'bad'
                              : task.priority === 'Medium'
                              ? 'warn'
                              : 'default'
                          }
                        >
                          {task.priority}
                        </Tag>

                        {/* Keyboard accessible "Move to" menu toggle */}
                        <div className="relative">
                          <button
                            type="button"
                            aria-label={`Move task ${task.title}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id);
                            }}
                            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-surface2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                          >
                            <MoreVertical size={14} />
                          </button>

                          {activeMenuTaskId === task.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-6 z-30 w-36 py-1 bg-[#0a222b] border border-line rounded-xl shadow-xl flex flex-col"
                            >
                              <span className="px-2.5 py-1 text-[10px] uppercase font-bold text-muted tracking-wider">
                                Move to...
                              </span>
                              {COLUMNS.filter((c) => c.id !== task.status).map((targetCol) => (
                                <button
                                  key={targetCol.id}
                                  type="button"
                                  onClick={() => {
                                    onMoveTask && onMoveTask(task.id, targetCol.id);
                                    setActiveMenuTaskId(null);
                                  }}
                                  className="px-2.5 py-1.5 text-left text-[12px] font-medium text-ink hover:bg-surface2 flex items-center gap-1.5 transition-colors"
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: targetCol.dotColor }}
                                  />
                                  <span>{targetCol.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-[12.5px] font-semibold text-ink leading-snug mt-2 line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Footer Info: Due date & Assignee & subtasks */}
                      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-line/30 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex items-center gap-1 font-mono text-[10.5px] ${
                              task.isOverdue ? 'text-bad font-bold' : 'text-muted'
                            }`}
                          >
                            {task.isOverdue ? (
                              <AlertCircle size={12} className="shrink-0" />
                            ) : (
                              <Calendar size={12} className="shrink-0" />
                            )}
                            <span>{task.dueDate}</span>
                          </span>

                          {totalSubtasks > 0 && (
                            <span className="flex items-center gap-1 text-muted text-[10.5px] font-mono">
                              <CheckSquare size={11} className="shrink-0" />
                              <span>
                                {completedSubtasks}/{totalSubtasks}
                              </span>
                            </span>
                          )}
                        </div>

                        <Avatar
                          name={task.assigneeName}
                          size={22}
                          title={`Assigned to ${task.assigneeName}`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

