import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Plus, Building2 } from 'lucide-react';
import useStore from '../store/useStore';
import { PIPELINE_STATUSES } from '../utils/constants';
import PropertyCard from '../components/property/PropertyCard';
import ConfirmDialog from '../components/shared/ConfirmDialog';

export default function Properties() {
  const navigate = useNavigate();
  const properties = useStore((s) => s.properties);
  const updatePropertyStatus = useStore((s) => s.updatePropertyStatus);
  const [confirmDrop, setConfirmDrop] = useState(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    if (newStatus === 'dropped') {
      setConfirmDrop({ id: draggableId, status: newStatus });
    } else {
      updatePropertyStatus(draggableId, newStatus);
    }
  };

  return (
    <div className="p-4 pb-20" dir="rtl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: '#E2E8F0' }}
        >
          נכסים
        </h1>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/properties/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
          style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
        >
          <Plus size={18} />
          הוסף דירה
        </motion.button>
      </div>

      {/* Empty State */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Building2 size={56} style={{ color: '#64748B' }} strokeWidth={1.5} />
          <h3
            className="text-lg font-semibold mt-4 mb-2"
            style={{ color: '#E2E8F0' }}
          >
            אין נכסים עדיין
          </h3>
          <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
            הוסף את הנכס הראשון שלך כדי להתחיל לעקוב
          </p>
          <button
            onClick={() => navigate('/properties/new')}
            className="px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
            style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
          >
            הוסף דירה
          </button>
        </div>
      )}

      {/* Kanban Board */}
      {properties.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div
            className="flex gap-3 overflow-x-auto pb-4"
            style={{ minHeight: 'calc(100vh - 240px)' }}
          >
            {PIPELINE_STATUSES.map((status) => {
              const columnProps = properties.filter(
                (p) => p.status === status.id
              );

              return (
                <div
                  key={status.id}
                  className="flex-shrink-0"
                  style={{ width: 280, minWidth: 260 }}
                >
                  {/* Column Header */}
                  <div
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg mb-2"
                    style={{ backgroundColor: `${status.color}1A` }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: status.color }}
                      />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: '#E2E8F0' }}
                      >
                        {status.label}
                      </span>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: '#334155',
                        color: '#94A3B8',
                      }}
                    >
                      {columnProps.length}
                    </span>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={status.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex flex-col gap-2 p-2 transition-all"
                        style={{
                          minHeight: 200,
                          backgroundColor: snapshot.isDraggingOver
                            ? `${status.color}0D`
                            : 'transparent',
                          border: `1px dashed ${
                            snapshot.isDraggingOver
                              ? status.color
                              : '#33415544'
                          }`,
                          borderRadius: 8,
                        }}
                      >
                        {columnProps.map((property, index) => (
                          <Draggable
                            key={property.id}
                            draggableId={property.id}
                            index={index}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                style={{
                                  ...dragProvided.draggableProps.style,
                                  opacity: dragSnapshot.isDragging ? 0.85 : 1,
                                }}
                              >
                                <PropertyCard
                                  property={property}
                                  onClick={() =>
                                    navigate(`/properties/${property.id}`)
                                  }
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Empty column hint */}
                        {columnProps.length === 0 &&
                          !snapshot.isDraggingOver && (
                            <div
                              className="flex items-center justify-center py-8 text-xs"
                              style={{ color: '#64748B' }}
                            >
                              גרור נכס לכאן
                            </div>
                          )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Confirm Dialog for "dropped" status */}
      <ConfirmDialog
        isOpen={!!confirmDrop}
        title="הסרת נכס"
        message='האם אתה בטוח שברצונך להעביר נכס זה לסטטוס "נפלה"? ניתן לשנות את הסטטוס חזרה בכל עת.'
        onConfirm={() => {
          if (confirmDrop) {
            updatePropertyStatus(confirmDrop.id, confirmDrop.status);
          }
          setConfirmDrop(null);
        }}
        onClose={() => setConfirmDrop(null)}
        confirmText="כן, העבר"
        cancelText="ביטול"
        variant="danger"
      />
    </div>
  );
}
